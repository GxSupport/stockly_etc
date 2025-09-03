<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentRequest;
use App\Models\DocumentType;
use App\Models\Product;
use App\Services\DocumentService;
use App\Services\WarehouseService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentController extends Controller
{
    protected $documentService;

    public function __construct(DocumentService $documentService,protected WarehouseService $warehouseService)
    {
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
        $date = ($request->date)??date('d.m.Y');
        $date = date('d.m.Y',strtotime($date));
        if(!$warehouse){
            return redirect()->route('documents.index')->with('error', 'Склад не найден. Обратитесь к администратору.');
        }
        $code = $warehouse->warehouse->code;
        $title = $warehouse->warehouse->title;
        $documentTypes = DocumentType::all();
        try {
            $products = $this->documentService->getGoods($code, $title, $date);
        } catch (\ErrorException $e) {
            $products = [];
        }
        return Inertia::render('documents/create', [
            'documentTypes' => $documentTypes,
            'products' => $products,
        ]);
    }

    public function store(StoreDocumentRequest $request)
    {
        $this->documentService->create($request);

        return redirect()->route('documents.index')->with('success', 'Document created successfully.');
    }
}
