<?php

namespace App\Http\Controllers;

use App\Models\BasicResource;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BasicResourceController extends Controller
{
    public function __construct(protected ProductService $productService) {}

    public function search(Request $request): JsonResponse
    {
        $search = (string) $request->input('search', '');
        $limit = min((int) $request->input('limit', 20), 50);
        $page = max(0, (int) $request->input('page', 0));

        $resources = BasicResource::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->skip($page * $limit)
            ->limit($limit)
            ->get(['code', 'name']);

        return response()->json($resources->map(fn (BasicResource $resource) => [
            'id' => $resource->code,
            'code' => $resource->code,
            'title' => $resource->name,
        ]));
    }

    public function refresh(): JsonResponse
    {
        set_time_limit(300);

        try {
            $count = $this->productService->syncBasicResources();

            return response()->json([
                'success' => true,
                'count' => $count,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
