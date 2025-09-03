<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarehouseType\StoreWarehouseTypeRequest;
use App\Services\WarehouseTypeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseTypeController extends Controller
{
    public function __construct(private WarehouseTypeService $warehouseTypeService) {}

    public function index(Request $request)
    {
        $page = (int) $request->get('page', 1);
        $perPage = (int) $request->get('per_page', 10);
        $search = $request->get('search');

        $result = $this->warehouseTypeService->list($page, $perPage, $search);

        return Inertia::render('warehouse-types', [
            'warehouse_types' => $result['warehouse_types'],
            'total' => $result['total'],
            'page' => $page,
            'perPage' => $perPage,
            'search' => $search,
        ]);
    }

    public function create()
    {
        return Inertia::render('warehouse-types/create');
    }

    public function store(StoreWarehouseTypeRequest $request)
    {
        $this->warehouseTypeService->create($request->validated());

        return redirect()
            ->route('warehouse-types.index')
            ->with('success', 'Тип склада успешно создан!');
    }
}