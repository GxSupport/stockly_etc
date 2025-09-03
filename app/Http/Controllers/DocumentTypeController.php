<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentType\StoreDocumentTypeRequest;
use App\Services\DocumentTypeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentTypeController extends Controller
{
    public function __construct(private DocumentTypeService $documentTypeService) {}

    public function index(Request $request)
    {
        $page = (int) $request->get('page', 1);
        $perPage = (int) $request->get('per_page', 10);
        $search = $request->get('search');

        $result = $this->documentTypeService->list($page, $perPage, $search);

        return Inertia::render('document-types', [
            'document_types' => $result['document_types'],
            'total' => $result['total'],
            'page' => $page,
            'perPage' => $perPage,
            'search' => $search,
        ]);
    }

    public function create()
    {
        return Inertia::render('document-types/create');
    }

    public function store(StoreDocumentTypeRequest $request)
    {
        $this->documentTypeService->create($request->validated());

        return redirect()
            ->route('document-types.index')
            ->with('success', 'Тип документа успешно создан!');
    }
}