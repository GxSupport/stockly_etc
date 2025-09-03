<?php

namespace App\Services;

use App\Models\DepList;
use Illuminate\Database\Eloquent\Collection;

class DepListService
{
    public function getDepList(): Collection
    {
        return DepList::query()->orderBy('id','DESC')->get();
    }

    public function list($page = 1, $perPage = 10, $search = null): array
    {
        $query = DepList::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('dep_code', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        $total = $query->count();
        $departments = $query->orderBy('dep_code', 'asc')
                           ->skip(($page - 1) * $perPage)
                           ->take($perPage)
                           ->get();

        return [
            'data' => $departments,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
        ];
    }

    public function create(array $data): DepList
    {
        // Convert dep_code to uppercase
        $data['dep_code'] = strtoupper($data['dep_code']);

        // Set default active status
        $data['is_active'] = $data['is_active'] ?? true;

        return DepList::query()->create($data);
    }

    public function checkDepCodeExists(string $depCode): bool
    {
        return DepList::query()->where('dep_code', strtoupper($depCode))->exists();
    }
}
