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

    public function edit(int $id)
    {
        $documentType = $this->documentTypeService->find($id);

        if (! $documentType) {
            return redirect()
                ->route('document-types.index')
                ->with('error', 'Тип документа не найден!');
        }

        return Inertia::render('document-types/edit', [
            'documentType' => $documentType,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'title' => 'required|string|max:255',
            'workflow_type' => 'required|integer|in:1,2',
            'requires_deputy_approval' => 'boolean',
        ]);

        // If workflow_type is direct (2), deputy approval should be false
        if ($validated['workflow_type'] == 2) {
            $validated['requires_deputy_approval'] = false;
        }

        $this->documentTypeService->update($id, $validated);

        return redirect()
            ->route('document-types.index')
            ->with('success', 'Тип документа успешно обновлён!');
    }
}
