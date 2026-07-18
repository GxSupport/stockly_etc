<?php

namespace App\Http\Controllers;

use App\Http\Requests\Product\ProductListRequest;
use App\Http\Requests\Warehouse\StoreWarehouseRequest;
use App\Models\Warehouse;
use App\Services\ProductService;
use App\Services\WarehouseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    public function __construct(
        protected WarehouseService $warehouseService
    ) {}

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
            'search' => $request->input('search', null),
        ]);
    }

    public function show(Warehouse $warehouse)
    {
        $warehouse->load('type_info');

        return Inertia::render('warehouses/show', [
            'warehouse' => $warehouse,
        ]);
    }

    public function products(Warehouse $warehouse, ProductListRequest $request, ProductService $productService): JsonResponse
    {
        try {
            $products = $productService->getProductsList(
                warehouseCode: $warehouse->code,
                warehouseTitle: $warehouse->title,
                date: $request->input('date')
            );

            return response()->json([
                'success' => true,
                'data' => $products,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function create()
    {
        $warehouse_types = $this->warehouseService->getWarehouseTypes();

        return Inertia::render('warehouses/create', [
            'warehouse_types' => $warehouse_types,
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
