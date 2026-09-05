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

    /**
     * Tovar qoldiqlari ro'yxati: warehouse_code berilsa — o'sha sklad,
     * berilmasa — foydalanuvchiga biriktirilgan barcha skladlar birlashtirilib qaytariladi.
     */
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

            $warehouses = collect([$warehouse]);
        } else {
            $warehouses = UserWarehouse::query()
                ->where('user_id', Auth::id())
                ->with('warehouse')
                ->get()
                ->pluck('warehouse')
                ->filter()
                ->values();

            if ($warehouses->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Вам не назначен склад, обратитесь к администратору',
                ], 400);
            }
        }

        $date = $request->input('date');

        try {
            $products = [];

            foreach ($warehouses as $warehouse) {
                $products = array_merge($products, $this->productService->getProductsList(
                    warehouseCode: $warehouse->code,
                    warehouseTitle: $warehouse->title,
                    date: $date
                ));
            }

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
