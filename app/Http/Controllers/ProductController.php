<?php

namespace App\Http\Controllers;

use App\Http\Requests\Product\ProductListRequest;
use App\Models\UserWarehouse;
use App\Models\Warehouse;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    public function __construct(public ProductService $productService) {}

    public function list(ProductListRequest $request): JsonResponse
    {
        $warehouseCode = $request->input('warehouse_code');

        if ($warehouseCode) {
            $warehouse = Warehouse::query()->where('code', $warehouseCode)->first();

            if (! $warehouse) {
                return response()->json([
                    'success' => false,
                    'message' => 'Склад не найден',
                ], 404);
            }

            $code = $warehouse->code;
            $title = $warehouse->title;
        } else {
            $userWarehouse = UserWarehouse::where('user_id', Auth::id())
                ->with('warehouse')
                ->first();

            if (! $userWarehouse || ! $userWarehouse->warehouse) {
                return response()->json([
                    'success' => false,
                    'message' => 'У вас нет склада!',
                ], 400);
            }

            $code = $userWarehouse->warehouse->code;
            $title = $userWarehouse->warehouse->title;
        }

        $date = $request->input('date');

        try {
            $products = $this->productService->getProductsList(
                warehouseCode: $code,
                warehouseTitle: $title,
                date: $date
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
}
