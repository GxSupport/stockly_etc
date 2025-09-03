<?php

namespace App\Services;

use App\Models\DocumentType;

class DocumentTypeService
{
    public function list(int $page = 1, int $perPage = 10, ?string $search = null): array
    {
        $query = DocumentType::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhere('code', 'like', '%' . $search . '%');
            });
        }

        $query->orderBy('created_at', 'desc');

        $total = $query->count();
        $document_types = $query
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return [
            'document_types' => $document_types,
            'total' => $total,
        ];
    }

    public function create(array $data): DocumentType
    {
        // Ensure code is uppercase
        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }
        
        return DocumentType::create($data);
    }

    public function checkCodeExists(string $code, ?int $excludeId = null): bool
    {
        $query = DocumentType::where('code', strtoupper($code));
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
