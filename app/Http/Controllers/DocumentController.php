<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentRequest;
use App\Models\DocumentType;
use App\Services\DocumentService;
use App\Services\ProductService;
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
        protected ProductService $productService
    ) {
        $this->documentService = $documentService;
    }

    public function index(Request $request, $status = 'draft')
    {
        $documents = $this->documentService->list($request, $status);

        return Inertia::render('documents', [
            'documents' => $documents,
            'status' => $status,
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

        return Inertia::render('documents/create', [
            'documentTypes' => $documentTypes,
            'products' => $products,
            'services' => $services,
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

            $response = $this->documentService->create($request);
            if ($response->getStatusCode() === 201) {
                return redirect()->route('documents.index')
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

            return Inertia::render('documents/show', [
                'document' => $document->load(['products', 'document_type', 'user_info']),
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
            if ($document->is_finished || $document->status != 1) {
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
                'document' => $document->load(['products', 'document_type', 'user_info']),
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
                return redirect()->route('documents.show', $id)
                    ->with('success', 'Документ успешно обновлен');
            }

            return back()->with('error', 'Ошибка при обновлении документа');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage())
                ->withInput();
        }
    }

    public function runProcess(Request $request, $id)
    {
        try {
            $documentService = new DocumentService($id);
            $response = $documentService->runProcess($request);

            return $response;
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
}
