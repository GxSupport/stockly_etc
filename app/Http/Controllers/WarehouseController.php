<?php

namespace App\Http\Controllers;

use App\Http\Requests\Warehouse\StoreWarehouseRequest;
use App\Services\WarehouseService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    public function __construct(
        protected WarehouseService $warehouseService
    )
    {
    }

    public function index(Request $request)
    {
        $list = $this->warehouseService->list(
            $request->input('page', 1),
            $request->input('perPage', 10),
            $request->input('search', null)
        );

        return Inertia::render('warehouses', [
            'warehouses' => $list['data'],
            'total' => $list['total'],
            'page' => $list['page'],
            'perPage' => $list['perPage'],
            'search' => $request->input('search', null)
        ]);
    }

    public function create()
    {
        $warehouse_types = $this->warehouseService->getWarehouseTypes();

        return Inertia::render('warehouses/create', [
            'warehouse_types' => $warehouse_types
        ]);
    }

    public function store(StoreWarehouseRequest $request)
    {
        $data = $request->validated();
        
        $this->warehouseService->create($data);
        
        return redirect()
            ->route('warehouses.index')
            ->with('success', 'Склад успешно создан');
    }
}