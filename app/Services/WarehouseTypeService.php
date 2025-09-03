<?php

namespace App\Services;

use App\Models\WarehouseType;

class WarehouseTypeService
{
    public function list(int $page = 1, int $perPage = 10, ?string $search = null): array
    {
        $query = WarehouseType::query();

        if ($search) {
            $query->where('title', 'like', '%' . $search . '%');
        }

        $query->orderBy('created_at', 'desc');

        $total = $query->count();
        $warehouse_types = $query
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return [
            'warehouse_types' => $warehouse_types,
            'total' => $total,
        ];
    }

    public function create(array $data): WarehouseType
    {
        return WarehouseType::create($data);
    }

    public function checkTitleExists(string $title, ?int $excludeId = null): bool
    {
        $query = WarehouseType::where('title', $title);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}