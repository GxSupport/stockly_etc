<?php

namespace App\Services;

use App\Data\ProductData;
use App\Data\ProductServiceData;
use App\Http\Integrations\IstTelecom\Requests\GetGoodsRequest;
use App\Http\Integrations\IstTelecom\Warehouse;
use App\Models\DocumentPriority;
use App\Models\DocumentPriorityConfig;
use App\Models\DocumentProducts;
use App\Models\DocumentReturned;
use App\Models\Documents;
use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DocumentService
{
    public Documents $document;

    public ?User $user;

    public ?DocumentPriority $priority;

    public ?DocumentPriorityConfig $current_config;

    private bool $attachedHead = false;

    private mixed $requestFront;

    public function __construct(?int $id = null)
    {
        if (! is_null($id)) {
            $document = Documents::find($id);
            if (empty($document)) {
                throw new \Exception('АКТ не найден!');
            } else {
                $this->document = $document;
                $this->setPriority();
            }
        }
        $this->user = Auth::user();
    }

    private function setPriority(): void
    {
        $this->priority = (new DocumentPriorityService)
            ->getPriorityByOrdering($this->document->id, $this->document->status);
    }

    private function setRequest($request): void
    {
        $this->requestFront = $request;
    }

    public function list(Request $request, $status)
    {
        // Get filters and pagination parameters
        $search = $request->input('search');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $documentType = $request->input('document_type');
        $documentStatus = $request->input('is_finished');
        $perPage = $request->input('per_page', 20);

        // For draft and return, the logic is simple and correct.
        if ($status === 'draft') {
            $query = Documents::with(['user_info', 'document_type', 'products'])
                ->where('is_draft', 1)
                ->where('user_id', $this->user->id);

            $this->applyFilters($query, $search, $startDate, $endDate, $documentType, $documentStatus);

            return $query->latest()->paginate($perPage);
        }

        if ($status === 'return') {
            $query = Documents::with(['user_info', 'document_type', 'products'])
                ->where('is_returned', 1)
                ->where('user_id', $this->user->id);

            $this->applyFilters($query, $search, $startDate, $endDate, $documentType, $documentStatus);

            return $query->latest()->paginate($perPage);
        }

        // For 'sent', we implement the detailed logic from the old service.
        if ($status === 'sent') {
            $roleStatusMap = [
                'admin' => 0,
                'frp' => 1,
                'header_frp' => 2,
                'buxgalter' => 3,
                'director' => 4,
            ];
            $min_status = $roleStatusMap[$this->user->type] ?? 0;

            $priorityWhere = [
                ['user_role', $this->user->type],
                ['is_active', 1],
            ];

            // Get the document IDs from the DocumentPriority table with filters
            $documentIdsQuery = DocumentPriority::where($priorityWhere)
                ->where(function ($query) {
                    $query->whereNull('user_id')
                        ->orWhere('user_id', $this->user->id);
                })
                ->whereHas('document', function ($query) use ($min_status, $search, $startDate, $endDate, $documentType, $documentStatus) {
                    $query->where('is_draft', 0)
                        ->where('is_returned', 0)
                        ->where('status', '>=', $min_status);

                    // Apply filters to document relation
                    if ($search) {
                        $query->where('number', 'like', "%{$search}%");
                    }

                    if ($startDate) {
                        $query->where('date_order', '>=', $startDate);
                    }

                    if ($endDate) {
                        $query->where('date_order', '<=', $endDate);
                    }

                    if ($documentType) {
                        $query->where('document_type_id', $documentType);
                    }

                    if ($documentStatus) {
                        if ($documentStatus === 'draft') {
                            $query->where('is_draft', 1);
                        } elseif ($documentStatus === 'returned') {
                            $query->where('is_returned', 1);
                        } elseif ($documentStatus === 'finished') {
                            $query->where('is_finished', 1);
                        } elseif ($documentStatus === 'processing') {
                            $query->where('is_draft', 0)
                                ->where('is_returned', 0)
                                ->where('is_finished', 0);
                        }
                    }
                });

            $documentIds = $documentIdsQuery->pluck('document_id');

            // Now, fetch the documents with those IDs
            return Documents::with(['user_info', 'document_type', 'products', 'priority.role_info'])
                ->whereIn('id', $documentIds)
                ->latest()
                ->paginate($perPage);
        }

        // Fallback for any other status, though the route is constrained.
        return Documents::query()->where('id', -1)->paginate($perPage);
    }

    private function applyFilters($query, $search, $startDate, $endDate, $documentType, $documentStatus): void
    {
        if ($search) {
            $query->where('number', 'like', "%{$search}%");
        }

        if ($startDate) {
            $query->whereDate('date_order', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('date_order', '<=', $endDate);
        }

        if ($documentType) {
            $query->where('document_type_id', $documentType);
        }

        if ($documentStatus) {
            $query->where('is_finished', $documentStatus);
        }
    }

    public function create(Request $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $document = new Documents;
            $document->type = $request->input('type');
            // Проверяем что тип документа указан
            if (is_null($document->type)) {
                throw new \Exception('Тип документа обязателен для заполнения');
            }
            $document->user_id = $this->user->id;
            $document->date_order = date('Y-m-d');
            $document->number = $request->input('number');
            $document->main_tool = $request->input('main_tool');
            $document->subscriber_title = $request->input('subscriber_title');
            $document->address = $request->input('address');
            $document->in_charge = $request->input('in_charge');
            $document->is_draft = 1;
            $document->status = 1;
            $document->save();

            $total_amount = 0;
            foreach ($request->input('products', []) as $product) {
                $this->addProduct($product, $document->id);
                $total_amount += $product['amount'] * $product['quantity'];
            }
            $document->total_amount = $total_amount;
            $document->save();
            $this->document = $document;

            // Проверяем приоритеты только для обычных документов (не возвращенных)
            if (! $document->is_returned) {
                $this->checkStartPriorityConfig();
                $this->checkStartPriority();
            }

            $this->createPriority();
            DB::commit();

            return response()->json(['success' => true, 'data' => ['id' => $document->id]], 201);
        } catch (QueryException $e) {
            DB::rollback();
            Log::error('DocumentService::create QueryException: '.$e->getMessage(), [
                'user_id' => $this->user->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['success' => false, 'message' => 'Ошибка базы данных: '.$e->getMessage()], 503);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('DocumentService::create Exception: '.$e->getMessage(), [
                'user_id' => $this->user->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * @throws \Exception
     */
    public function update(Request $request, int $id): JsonResponse
    {
        // Birinchi tekshiruvlar - transaction dan tashqarida
        $document = Documents::find($id);
        if (! $document) {
            throw new \Exception('АКТ не найден!');
        }

        // Проверяем статус документа как в старом проекте
        if ($document->status != 1) {
            throw new \Exception('АКТ изменить невозможно!');
        }

        // Дополнительная проверка на завершенность документа
        if ($document->is_finished) {
            throw new \Exception('Завершенный документ нельзя изменить!');
        }

        $this->document = $document;

        DB::beginTransaction();
        try {
            $this->removeProduct($id);

            $document->type = $request->input('document_type_id');
            // Проверяем что тип документа указан
            if (is_null($document->type)) {
                throw new \Exception('Тип документа обязателен для заполнения');
            }
            $document->user_id = $this->user->id;
            // Для существующих документов дата не изменяется
            $document->number = $request->input('number');
            $document->main_tool = $request->input('main_tool');
            $document->subscriber_title = $request->input('subscriber_title');
            $document->address = $request->input('address');
            $document->in_charge = $request->input('in_charge');
            $document->is_draft = 1;
            $document->status = 1;
            $document->save();

            $total_amount = 0;
            foreach ($request->input('products', []) as $product) {
                $this->addProduct($product, $document->id);
                $total_amount += $product['amount'] * $product['quantity'];
            }
            $document->total_amount = $total_amount;
            $document->save();
            $this->document = $document;

            // Проверяем приоритеты только для обычных документов (не возвращенных)
            if (! $document->is_returned) {
                $this->checkStartPriorityConfig();
                $this->checkStartPriority();
            }

            $this->removePriority();
            $this->createPriority();
            DB::commit();

            return response()->json(['success' => true, 'data' => ['id' => $document->id]], 200);
        } catch (QueryException $e) {
            DB::rollback();
            Log::error('DocumentService::update QueryException: '.$e->getMessage(), [
                'id' => $id,
                'user_id' => $this->user->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['success' => false, 'message' => 'Ошибка базы данных: '.$e->getMessage()], 503);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('DocumentService::update Exception: '.$e->getMessage(), [
                'id' => $id,
                'user_id' => $this->user->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function removePriority(): void
    {
        (new DocumentPriorityService)->removePriority($this->document->id);
    }

    private function addProduct($data, $document_id): void
    {
        $product = new DocumentProducts;
        $product->document_id = $document_id;
        $product->user_id = $data['user_id'] ?? $this->user->id;
        $product->title = $data['selected_product']['name'];
        $product->measure = $data['selected_product']['measure'];
        $product->quantity = $data['selected_product']['count'];
        $product->amount = $data['selected_product']['price'];
        $product->nomenclature = $data['selected_product']['nomenclature'] ?? '';
        $product->note = $data['note'] ?? '';
        try {
            $product->save();
        } catch (QueryException $e) {
            throw new \Exception($e->getMessage());
        }
    }

    private function removeProduct($document_id): void
    {
        try {
            DocumentProducts::query()->where('document_id', $document_id)
                ->delete();
        } catch (QueryException $e) {
            throw new \Exception($e->getMessage());
        }
    }

    public function checkStartPriorityConfig(): void
    {

        $item = (new DocumentPriorityService)
            ->checkConfigByOrderingRole(1, $this->user->type, $this->document->type);
        if (is_null($item)) {
            throw new \Exception('Вы не можете перевести заявку на следующий этап');
        }
    }

    public function checkStartPriority()
    {
        $check = (new DocumentPriorityService)->getPriorityByOrdering($this->document->id, 1);
        if ($check) {
            throw new \Exception('Приложение не находится в статусе startProcess!');
        }
    }

    public function createPriority()
    {
        // Убеждаемся что document и type установлены
        if (! $this->document || is_null($this->document->type)) {
            Log::error('DocumentService::createPriority - document or type is null', [
                'document' => $this->document ? $this->document->id : 'null',
                'type' => $this->document ? $this->document->type : 'null',
            ]);
            throw new \Exception('Документ или тип документа не установлен');
        }

        (new DocumentPriorityService)->createPriority($this->document->id, $this->document->type);
    }

    public function getProductsFromApi($info)
    {

        $date = ($info['date']) ?? date('d.m.Y');
        $date = date('d.m.Y', strtotime($date));
        $foo_code = ($info['foo_code']) ?? null;
        $warehouse_code = ($info['warehouse_code']) ?? null;
        $dep_code = ($info['dep_code']) ?? null;
        $re = new GetGoodsRequest(date: $date, foo_code: $foo_code, dep_code: $dep_code, warehouse_code: $warehouse_code);
        $res = new Warehouse;
        $response = $res->send($re);
        $send = [];
        if ($response->successful()) {
            $clean = str_replace('﻿', '', $response->body());
            $items = json_decode($clean, true);
            foreach ($items as $value) {
                $send[] = new ProductServiceData(
                    $value['ОсновноеСредство'],
                    $this->numberFromStringForProduct($value['СтоимостьОстаток']),
                    $value['КоличествоОстаток'],
                    $this->numberFromStringForProduct($value['АмортизацияОстаток']),
                    $value['ПереоценкаОстаток'],
                    $value['ПодразделениеОрганизации'],
                    $value['СчетУчетаБУ'],
                    $value['СчетНачисленияАмортизацииБУ'],
                    $value['ОсновноеСредствоКод'],
                    $value['СкладКод'],
                    $value['МОЛКод'],
                    $value['ПодразделениеОрганизацииКод'],
                );
            }
        } else {
            $status = $response->status();
            throw new \ErrorException('Ошибка подключения к серверу,ошибка: '.$status);
        }

        return $send;

    }

    public function getGoods($code, $title, $date): array
    {
        // Use direct Guzzle instead of Saloon for testing
        $client = new Client([
            'proxy' => (config('services.app.local') == 'local') ? 'socks5h://host.docker.internal:8089' : '',
            'timeout' => 30,
            'connect_timeout' => 10,
            'verify' => false,
        ]);

        $baseUrl = 'http://89.236.216.12:8083';
        $endpoint = '/base2/hs/CarData/os/empl';

        $queryParams = [
            'm' => 'get_stock_leftover',
            'code' => $code,
            'wh_name' => $title, // Raw title without encoding
            'date' => $date,
        ];

        $fullUrl = $baseUrl.$endpoint.'?'.http_build_query($queryParams);

        Log::info('1C Integration Request (Guzzle)', [
            'base_url' => $baseUrl,
            'endpoint' => $endpoint,
            'query_params' => $queryParams,
            'full_url' => $fullUrl,
            'raw_title' => $title,
        ]);

        try {
            $response = $client->get($endpoint, [
                'base_uri' => $baseUrl,
                'query' => $queryParams,
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => '*/*',
                    'Authorization' => 'Basic aHR0cGJvdDpodHRwYm90',
                ],
            ]);

            $statusCode = $response->getStatusCode();
            $body = $response->getBody()->getContents();

            Log::info('1C Integration Response (Guzzle)', [
                'status' => $statusCode,
                'successful' => $statusCode >= 200 && $statusCode < 300,
                'body_length' => strlen($body),
            ]);

            $send = [];

            if ($statusCode >= 200 && $statusCode < 300) {
                $clean = str_replace('﻿', '', $body);
                $items = json_decode($clean, true);

                Log::info('1C Integration Parsed Data (Guzzle)', [
                    'items_count' => is_array($items) ? count($items) : 'not_array',
                ]);

                if (is_array($items)) {
                    foreach ($items as $value) {
                        $send[] = new ProductData(
                            $value['Номенклатура'],
                            $value['Склад'],
                            $value['ЕдИзм'],
                            $this->numberFromStringForProduct($value['СуммаОстаток']),
                            $value['КоличествоОстаток'],
                            $value['КодНоменклатуры']
                        );
                    }
                } else {
                    Log::warning('1C Integration: items is not array (Guzzle)', ['items' => $items]);
                }
            } else {
                Log::error('1C Integration Failed (Guzzle)', [
                    'status' => $statusCode,
                    'body' => $body,
                    'url' => $fullUrl,
                ]);
                throw new \ErrorException('Ошибка подключения к серверу,ошибка: '.$statusCode);
            }

            Log::info('1C Integration Final Result (Guzzle)', ['products_count' => count($send)]);

            return $send;

        } catch (\Exception $e) {
            Log::error('1C Integration Exception (Guzzle)', [
                'message' => $e->getMessage(),
                'url' => $fullUrl,
            ]);
            throw new \ErrorException('Ошибка подключения к серверу: '.$e->getMessage());
        }
    }

    // Workflow methods from old DocumentService
    public function runProcess($request): JsonResponse
    {
        DB::beginTransaction();
        $this->setRequest($request);
        $this->checkAcceptUser();
        if ($this->document->status == 1) {
            $this->unCheckIsReturned();
        }
        $this->checkAcceptStep();
        $this->checkOptions();
        $this->process();
        DB::commit();

        return response()->json(['success' => true]);
    }

    private function process()
    {
        $this->priority->is_success = true;
        $this->priority->user_id = $this->user->id;
        $this->savePriority();
        if ($this->lastPriority()) {
            $this->document->is_finished = 1;
        }
        $this->document->status = $this->priority->ordering + 1;
        $this->document->user_id = $this->attachedHead && isset($this->user->senior_id) ? $this->user->senior_id : null;
        if ($this->priority->ordering == 1) {
            $this->document->is_draft = 0;
            $service = new DocumentPriorityService;
            $second = $service->getPriorityByOrdering($this->document->id, 2);
            if ($this->attachedHead && isset($this->user->senior_id)) {
                $service->updateDocumentPriority($second->id, ['user_id' => $this->user->senior_id]);
            }
        }
        $this->saveDocument();
    }

    public function lastPriority(): bool
    {
        return (new DocumentPriorityService)->lastDocumentPriority(
            $this->document->id,
            $this->document->status
        );
    }

    private function savePriority(): void
    {
        $this->priority->save();
    }

    private function saveDocument(): void
    {
        $this->document->save();
    }

    public function checkAcceptUser(): void
    {
        if (! is_null($this->document->user_id) && $this->document->user_id != $this->user->id) {
            throw new \Exception('У вас нет доступа к этом заявки!');
        }
    }

    public function checkAcceptStep(): void
    {
        $this->current_config = $this->checkUserCondition();
        if (is_null($this->current_config)) {
            throw new \Exception('Вы не можете перевести заявку на следующий этап');
        }
    }

    public function checkUserCondition()
    {
        $this->checkDocumentFinished();

        return (new DocumentPriorityService)
            ->checkConfigByOrderingRole($this->priority->ordering, $this->user->type, $this->document->type);
    }

    public function checkDocumentFinished(): void
    {
        if ($this->document->is_finished == 1) {
            throw new \Exception('Заявка завершена!');
        }
    }

    public function checkOptions(): void
    {
        $options = json_decode($this->current_config->options, true);
        if (! is_null($options)) {
            foreach ($options as $key => $option) {
                if ($key == 'attached_head' && $option === true) {
                    $this->checkAttachedHead();
                }
                if ($key == 'sms_confirm' && $option === true) {
                    $this->checkSmsConfirm();
                }
                if ($key == 'check_product' && $option === true) {
                    $this->checkProduct();
                }
                if ($key == 'check_main' && $option === true) {
                    $this->checkMainTools();
                }
            }
        }
    }

    public function checkAttachedHead(): void
    {
        $this->attachedHead = true;
    }

    public function checkSmsConfirm(): void
    {
        if (! $this->requestFront->input('code') || ! $this->requestFront->input('token')) {
            throw new \Exception('На этом шаге подтверждение по смс обязательно!');
        }
    }

    public function checkProduct(): void
    {
        // Product validation logic would go here
    }

    public function checkMainTools(): void
    {
        // Main tools validation logic would go here
    }

    public function unCheckIsReturned(): void
    {
        $this->document->is_returned = 0;
        $this->document->save();
    }

    public function sendToNext(): bool
    {
        try {
            DB::beginTransaction();

            // Check if document can be sent to next level
            if ($this->document->is_finished || $this->document->status > 4) {
                throw new \Exception('Документ уже завершен или достиг максимального статуса');
            }

            // Update document status
            $this->document->status = $this->document->status + 1;
            $this->document->is_draft = 0;
            $this->document->save();

            // Update priority if exists
            if ($this->priority) {
                $this->priority->is_success = true;
                $this->priority->user_id = $this->user->id;
                $this->priority->save();
            }

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error sending document to next level: '.$e->getMessage());
            throw $e;
        }
    }

    public function getHistory(): array
    {
        try {
            // Get document history from priority records or similar source
            $history = DocumentPriority::where('document_id', $this->document->id)
                ->with('user_info')
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'user_info' => [
                            'id' => $item->user_info->id ?? null,
                            'name' => $item->user_info->name ?? 'Unknown',
                            'type' => $item->user_info->type ?? 'unknown',
                        ],
                        'is_success' => $item->is_success ?? 1,
                        'created_at' => $item->created_at->toISOString(),
                        'return_info' => $item->return_info ?? [],
                    ];
                })
                ->toArray();

            return ['data' => $history];
        } catch (\Exception $e) {
            Log::error('Error getting document history: '.$e->getMessage());

            return ['data' => []];
        }
    }

    public function getStaffList(): array
    {
        try {
            // Get staff list - you may need to adjust this based on your User model structure
            $director = User::where('type', 'director')->first();

            return [
                'data' => [
                    'director' => [
                        'name' => $director->name ?? 'Не найден',
                    ],
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Error getting staff list: '.$e->getMessage());

            return ['data' => []];
        }
    }

    public function rejectDocument(string $note): bool
    {
        DB::beginTransaction();
        try {
            $this->checkAddNote();
            $document_id = $this->document->id;
            $from_id = $this->user->id;
            $to_id = $this->getToCharge();
            $returned_priority = $this->priority->id;

            $this->saveDocumentReturned(
                $document_id,
                $from_id,
                $to_id,
                $note,
                $returned_priority
            );

            $this->document->is_returned = 1;
            $this->document->status = $this->getReturnedStatus();
            $this->document->user_id = $to_id;
            $this->document->save();

            $this->deActiveDocumentPriority();

            // TODO: Send telegram notification to document owner if needed
            // $owner = $this->getDocumentOwner();
            // if (isset($owner->chat_id)) {
            //     $message = $this->returnMessage($note);
            //     // Send telegram message
            // }

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error rejecting document: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Check if user can reject this document
     */
    public function checkAddNote(): void
    {
        $message = 'Вы не можете отказаться от этого АКТ!';
        Log::info('Checking reject permissions', [
            'priority_user_role' => $this->priority->user_role ?? 'null',
            'current_user_type' => $this->user->type,
            'document_user_id' => $this->document->user_id ?? 'null',
            'current_user_id' => $this->user->id,
        ]);
        if ($this->priority->user_role != $this->user->type) {
            throw new \Exception($message);
        }
        if (! is_null($this->document->user_id)) {
            //            if ($this->document->user_id != $this->user->id) {
            //                throw new \Exception($message);
            //            }
        }
    }

    /**
     * Get the user ID to assign document to after rejection
     */
    public function getToCharge(): int
    {
        $first_priority = (new DocumentPriorityService)->getPriorityByOrdering(
            $this->document->id,
            1
        );

        return $first_priority->user_id;
    }

    /**
     * Get status to set when document is returned
     */
    public function getReturnedStatus(): int
    {
        return 1;
    }

    /**
     * Save document returned record
     */
    public function saveDocumentReturned(
        int $document_id,
        int $from_id,
        int $to_id,
        string $note,
        int $priority_id
    ): void {
        $returned = new DocumentReturned;
        $returned->document_id = $document_id;
        $returned->from_id = $from_id;
        $returned->to_id = $to_id;
        $returned->note = $note;
        $returned->priority_id = $priority_id;
        try {
            $returned->save();
        } catch (QueryException $e) {
            throw new \Exception('Error saving returned document: '.$e->getMessage());
        }
    }

    /**
     * Deactivate document priorities after rejection
     */
    public function deActiveDocumentPriority(): void
    {
        DocumentPriority::where('document_id', $this->document->id)
            ->where('ordering', '>', $this->priority->ordering)
            ->delete();

        DocumentPriority::where('document_id', $this->document->id)
            ->where('ordering', $this->priority->ordering)
            ->update(['user_id' => $this->user->id]);

        DocumentPriority::where('document_id', $this->document->id)
            ->update(['is_active' => 0]);
    }

    /**
     * Get document owner for notifications
     */
    public function getDocumentOwner(): User
    {
        return User::where('id', $this->document->user_id)->first();
    }

    /**
     * Generate rejection message for notifications
     */
    public function returnMessage($note): string
    {
        return '*№ документа:* '.$this->document->number."
*Тип:* Отказать ❌
*Причина:* $note";
    }

    public function numberFromStringForProduct(string $number): float
    {
        // vergullarni olib tashlash
        $number = str_replace(',', '', $number);
        // so'mdagi summani tiyin qilish
        $number = $number * 100;
        // raqamni formatini float qilish
        (float) $number = $number / 100;

        return $number;
    }
}
