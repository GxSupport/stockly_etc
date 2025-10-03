<?php

namespace App\Http\Controllers;

use App\Http\Requests\Product\ProductListRequest;
use App\Models\UserWarehouse;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    public function __construct(public ProductService $productService) {}

    public function list(ProductListRequest $request): JsonResponse
    {
        $userWarehouse = UserWarehouse::where('user_id', Auth::id())
            ->with('warehouse')
            ->first();

        if (! $userWarehouse || ! $userWarehouse->warehouse) {
            return response()->json([
                'success' => false,
                'message' => 'У вас нет склада!',
            ], 400);
        }

        $date = $request->input('date');

        try {
            $products = $this->productService->getProductsList(
                warehouseCode: $userWarehouse->warehouse->code,
                warehouseTitle: $userWarehouse->warehouse->title,
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
