<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentRequest;
use App\Models\DocumentType;
use App\Services\DocumentService;
use App\Services\ProductService;
use App\Services\TelegramService;
use App\Services\WarehouseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DocumentController extends Controller
{
    protected $documentService;

    public function __construct(
        DocumentService $documentService,
        protected WarehouseService $warehouseService,
        protected ProductService $productService,
        protected TelegramService $telegramService
    ) {
        $this->documentService = $documentService;
    }

    public function index(Request $request, $status = 'draft')
    {
        $user = auth()->user();
        if ($user->type != 'frp') {
            $status = 'sent';
        }
        $documents = $this->documentService->list($request, $status);
        $documentTypes = DocumentType::all(['id', 'title']);

        return Inertia::render('documents', [
            'documents' => $documents,
            'status' => $status,
            'documentTypes' => $documentTypes,
            'filters' => [
                'search' => $request->input('search'),
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
                'document_type' => $request->input('document_type'),
                'is_finished' => $request->input('is_finished'),
                'per_page' => $request->input('per_page', 20),
            ],
        ]);
    }

    public function create(Request $request)
    {
        $user = auth()->user();

        $warehouse = $this->warehouseService->getWarehouseByUserId($user->id);
        if (! $warehouse) {
            return redirect()->route('documents.index')->with('error', 'Склад не найден. Обратитесь к администратору.');
        }
        $date = $request->date ?? date('d.m.Y');
        $date = date('d.m.Y', strtotime($date));
        $code = $warehouse->warehouse->code;
        $title = $warehouse->warehouse->title;
        $documentTypes = DocumentType::all();

        try {
            $products = $this->documentService->getGoods($code, $title, $date);
        } catch (\ErrorException $e) {
            $products = [];
            Log::error($e->getMessage());
        }

        try {
            $services = $this->productService->listServiceFromDepCode();
        } catch (\Exception $e) {
            $services = [];
            Log::error('Ошибка при получении услуг: '.$e->getMessage());
        }

        // Calculate next document number
        $currentYear = date('Y');
        $lastDocument = \App\Models\Documents::where('number', 'like', $currentYear.'/%')
            ->get()
            ->sortByDesc(function ($doc) {
                $parts = explode('/', $doc->number);

                return isset($parts[1]) ? (int) $parts[1] : 0;
            })
            ->first();

        if ($lastDocument) {
            $parts = explode('/', $lastDocument->number);
            $lastNumber = isset($parts[1]) ? (int) $parts[1] : 0;
            $nextNumber = $currentYear.'/'.($lastNumber + 1);
        } else {
            $nextNumber = $currentYear.'/1';
        }

        return Inertia::render('documents/create', [
            'documentTypes' => $documentTypes,
            'products' => $products,
            'services' => $services,
            'nextNumber' => $nextNumber,
        ]);
    }

    public function getComposition(Request $request)
    {
        $request->validate([
            'os_code' => 'required|string',
        ]);

        try {
            $composition = $this->productService->getComposition($request->os_code);

            return response()->json([
                'success' => true,
                'composition' => $composition,
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при получении состава: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении состава основного средства',
            ], 422);
        }
    }

    public function store(StoreDocumentRequest $request)
    {

        try {
            $request['is_draft'] = ! $request->has('is_draft') || $request->is_draft;
            $request['type'] = $request->document_type_id;
            $response = $this->documentService->create($request);
            if ($response->getStatusCode() === 201) {
                $data = $response->getData(true);
                $documentId = $data['data']['id'];

                return redirect()->route('documents.edit', $documentId)
                    ->with('success', 'Документ успешно создан');
            }

            return back()->with('error', 'Ошибка при создании документа');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage())
                ->withInput();
        }
    }

    public function show($id)
    {

        try {
            $documentService = new DocumentService($id);
            $document = $documentService->document;

            // Get document history
            $history = [];
            try {
                $historyResponse = $documentService->getHistory();
                if ($historyResponse && isset($historyResponse['data'])) {
                    $history = $historyResponse['data'];
                }
            } catch (\Exception $e) {
                Log::error('Error getting document history: '.$e->getMessage());
            }

            // Get staff list for director info
            $staff = [];
            try {
                $staffResponse = $documentService->getStaffList();
                if ($staffResponse && isset($staffResponse['data'])) {
                    $staff = $staffResponse['data'];
                }
            } catch (\Exception $e) {
                Log::error('Error getting staff list: '.$e->getMessage());
            }

            return Inertia::render('documents/show', [
                'document' => $document->load(['products', 'document_type', 'user_info', 'notes', 'priority']),
                'history' => $history,
                'staff' => $staff,
                'user' => auth()->user(),
            ]);
        } catch (\Exception $e) {
            return redirect()->route('documents.index')
                ->with('error', $e->getMessage());
        }
    }

    public function edit($id)
    {
        try {
            $documentService = new DocumentService($id);
            $document = $documentService->document;

            // Only allow editing of draft documents
            if ($document->is_finished) {
                return redirect()->route('documents.show', $id)
                    ->with('error', 'Можно редактировать только черновики документов.');
            }

            $user = auth()->user();
            $warehouse = $this->warehouseService->getWarehouseByUserId($user->id);

            if (! $warehouse) {
                return redirect()->route('documents.index')
                    ->with('error', 'Склад не найден. Обратитесь к администратору.');
            }

            $date = $document->date_order ?? date('d.m.Y');
            $date = date('d.m.Y', strtotime($date));
            $code = $warehouse->warehouse->code;
            $title = $warehouse->warehouse->title;
            $documentTypes = DocumentType::all();

            try {
                $products = $this->documentService->getGoods($code, $title, $date);
            } catch (\ErrorException $e) {
                $products = [];
                Log::error($e->getMessage());
            }

            try {
                $services = $this->productService->listServiceFromDepCode();
            } catch (\Exception $e) {
                $services = [];
                Log::error('Ошибка при получении услуг: '.$e->getMessage());
            }

            return Inertia::render('documents/edit', [
                'document' => $document->load(['products', 'document_type', 'user_info', 'notes']),
                'documentTypes' => $documentTypes,
                'products' => $products,
                'services' => $services,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('documents.index')
                ->with('error', $e->getMessage());
        }
    }

    public function update(StoreDocumentRequest $request, $id)
    {
        try {
            $response = $this->documentService->update($request, $id);

            if ($response->getStatusCode() === 200) {
                return redirect()->route('documents.index')
                    ->with('success', 'Документ успешно обновлен');
            }

            return back()->with('error', 'Ошибка при обновлении документа');
        } catch (\Exception $e) {
            Log::error('Error updating document: '.$e->getMessage());
            session('errors', collect([$e->getMessage()]));

            return back()->with('error', $e->getMessage());
        }
    }

    public function runProcess(Request $request, $id)
    {
        try {
            $documentService = new DocumentService($id);

            return $documentService->runProcess($request);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function typeList()
    {
        return DocumentType::all();
    }

    public function checkSmsRequired($id)
    {
        try {
            $documentService = new DocumentService($id);
            $document = $documentService->document;

            // Check if SMS is required for this document/user
            // This is just a placeholder - implement your SMS logic here
            $smsRequired = true; // You can implement your own logic here

            return response()->json([
                'sms_required' => $smsRequired,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function sendOtp(Request $request)
    {
        $user = auth()->user();
        $request->validate([
            'document_id' => 'required|integer',
            'type' => 'required|string',
        ]);

        try {
            // Generate OTP token
            $token = bin2hex(random_bytes(16));
            $otp = rand(100000, 999999);

            // Store OTP in session or database
            session([
                'otp_token' => $token,
                'otp_code' => $otp,
                'document_id' => (int) $request->document_id,
            ]);

            // Here you would send the OTP via SMS/Telegram
            // For now, we'll just return success
            Log::info('OTP sent for document: '.$request->document_id.', Code: '.$otp);
            $documentService = new DocumentService($request->document_id);
            $document = $documentService->document;
            $this->telegramService->sendMessage($user->chat_id,
                "Ваш код подтверждения для документа №{$document->number}: {$otp}"
            );

            return response()->json([
                'success' => true,
                'token' => $token,
                'message' => 'Код подтверждения отправлен',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при отправке кода',
            ], 422);
        }
    }

    public function confirmCode(Request $request, $id)
    {
        $request->validate([
            'code' => 'required|string',
            'token' => 'required|string',
        ]);

        try {
            // Debug session data
            Log::info('OTP Verification Debug', [
                'request_token' => $request->token,
                'request_code' => $request->code,
                'request_id' => $id,
                'session_token' => session('otp_token'),
                'session_code' => session('otp_code'),
                'session_document_id' => session('document_id'),
            ]);

            // Verify OTP
            if (session('otp_token') !== $request->token ||
                session('otp_code') != $request->code ||
                session('document_id') != (int) $id) {

                Log::warning('OTP Verification Failed', [
                    'token_match' => session('otp_token') === $request->token,
                    'code_match' => session('otp_code') == $request->code,
                    'id_match' => session('document_id') == $id,
                ]);

                return response()->json([
                    'errors' => ['message' => 'Неверный код подтверждения'],
                ], 400);
            }

            // Clear OTP from session
            session()->forget(['otp_token', 'otp_code', 'document_id']);

            // Process document - send to next level
            $documentService = new DocumentService($id);
            $response = $documentService->sendToNext();

            if ($response) {
                return response()->json([
                    'success' => true,
                    'message' => 'Документ успешно отправлен следующему',
                ]);
            }

            return response()->json([
                'errors' => ['message' => 'Ошибка при отправке документа'],
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'errors' => ['message' => $e->getMessage()],
            ], 400);
        }
    }

    public function rejectCode(Request $request, $id)
    {
        $request->validate([
            'code' => 'required|string',
            'token' => 'required|string',
            'note' => 'required|string',
        ]);

        try {
            // Debug session data
            Log::info('OTP Rejection Debug', [
                'request_token' => $request->token,
                'request_code' => $request->code,
                'request_id' => $id,
                'request_note' => $request->note,
                'session_token' => session('otp_token'),
                'session_code' => session('otp_code'),
                'session_document_id' => session('document_id'),
            ]);

            // Verify OTP
            if (session('otp_token') !== $request->token ||
                session('otp_code') != $request->code ||
                session('document_id') != (int) $id) {

                Log::warning('OTP Rejection Failed', [
                    'token_match' => session('otp_token') === $request->token,
                    'code_match' => session('otp_code') == $request->code,
                    'id_match' => session('document_id') == $id,
                ]);

                return response()->json([
                    'errors' => ['message' => 'Неверный код подтверждения'],
                ], 400);
            }

            // Clear OTP from session
            session()->forget(['otp_token', 'otp_code', 'document_id']);

            // Reject document
            $documentService = new DocumentService($id);
            $response = $documentService->rejectDocument($request->note);

            if ($response) {
                return response()->json([
                    'success' => true,
                    'message' => 'Документ успешно отклонен',
                ]);
            }

            return response()->json([
                'errors' => ['message' => 'Ошибка при отклонении документа'],
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'errors' => ['message' => $e->getMessage()],
            ], 400);
        }
    }

    public function sendToNext(Request $request, $id)
    {
        try {
            $documentService = new DocumentService($id);
            $response = $documentService->sendToNext();

            if ($response) {
                return response()->json([
                    'success' => true,
                    'message' => 'Документ успешно отправлен следующему',
                ]);
            }

            return response()->json([
                'errors' => ['message' => 'Ошибка при отправке документа'],
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'errors' => ['message' => $e->getMessage()],
            ], 400);
        }
    }
}
