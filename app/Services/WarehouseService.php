<?php

namespace App\Services;

use App\Models\Warehouse;
use App\Models\WarehouseType;
use Illuminate\Database\Eloquent\Collection;

class WarehouseService
{
    public function list($page = 1, $perPage = 10, $search = null): array
    {
        $query = Warehouse::query();
        $query->with(['type_info']);
        
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        $total = $query->count();
        $warehouses = $query->orderBy('code', 'asc')
                           ->skip(($page - 1) * $perPage)
                           ->take($perPage)
                           ->get();

        return [
            'data' => $warehouses,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
        ];
    }

    public function create(array $data): Warehouse
    {
        // Convert code to uppercase
        $data['code'] = strtoupper($data['code']);
        
        // Set default active status
        $data['is_active'] = $data['is_active'] ?? true;

        return Warehouse::create($data);
    }

    public function getWarehouseTypes(): Collection
    {
        return WarehouseType::query()
            ->where('is_active', true)
            ->orderBy('title', 'asc')
            ->get();
    }

    public function checkCodeExists(string $code): bool
    {
        return Warehouse::where('code', strtoupper($code))->exists();
    }
}