<?php

namespace App\Services;

use App\Models\UserWarehouse;
use App\Models\Warehouse;
use App\Models\WarehouseType;
use GuzzleHttp\Client;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

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

    public function getWarehouseByUserId($user_id): ?UserWarehouse
    {
        return UserWarehouse::query()
            ->where('user_id', $user_id)
            ->with('warehouse')
            ->first();
    }

    public function getWarehouseTypes(): Collection
    {
        return WarehouseType::query()
            ->where('is_active', true)
            ->orderBy('title', 'asc')
            ->get();
    }

    public function search(string $search = '', int $limit = 20, int $page = 0): Collection
    {
        $query = Warehouse::query()
            ->where('is_active', true)
            ->select(['id', 'code', 'title']);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('title')
            ->skip($page * $limit)
            ->limit($limit)
            ->get();
    }

    public function checkCodeExists(string $code): bool
    {
        return Warehouse::where('code', strtoupper($code))->exists();
    }

    /**
     * 1С HTTP-servisidan skladlar spravochnigini olib, lokal bazaga sinxronlash.
     * Upsert kaliti — code. Har safar emas, foydalanuvchi "Обновить" bosganda chaqiriladi.
     */
    public function syncWarehouses(): int
    {
        return $this->storeWarehouses($this->fetchWarehousesFromApi());
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function fetchWarehousesFromApi(): array
    {
        $client = new Client([
            'proxy' => (config('services.app.local') == 'local') ? 'socks5h://host.docker.internal:8089' : '',
            'timeout' => 180,
            'connect_timeout' => 10,
            'verify' => false,
        ]);

        $baseUrl = 'http://89.236.216.12:8083';
        $endpoint = '/base2/hs/CarData/wh_data';

        Log::info('1C Warehouse Sync Request', ['endpoint' => $endpoint]);

        try {
            $response = $client->get($endpoint, [
                'base_uri' => $baseUrl,
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => '*/*',
                    'Authorization' => 'Basic aHR0cGJvdDpodHRwYm90',
                ],
            ]);

            $statusCode = $response->getStatusCode();
            $body = $response->getBody()->getContents();

            if ($statusCode < 200 || $statusCode >= 300) {
                Log::error('1C Warehouse Sync Failed', ['status' => $statusCode]);
                throw new \Exception('Ошибка подключения к серверу, ошибка: '.$statusCode);
            }

            $clean = str_replace('﻿', '', $body);
            $items = json_decode($clean, true);

            if (! is_array($items)) {
                Log::warning('1C Warehouse Sync: items is not array', ['body' => mb_substr($body, 0, 1000)]);
                throw new \Exception('Некорректный ответ от сервера 1С');
            }

            Log::info('1C Warehouse Sync Response', ['items_count' => count($items)]);

            return $items;
        } catch (\Exception $e) {
            Log::error('1C Warehouse Sync Exception', ['message' => $e->getMessage()]);
            throw new \Exception('Ошибка подключения к серверу: '.$e->getMessage());
        }
    }

    /**
     * Kelgan skladlarni code bo'yicha upsert qiladi, type matnini warehouse_type ga bog'laydi,
     * API'da bo'lmagan skladlarni faolsizlantiradi (o'chirmaydi — FK bog'lanishlar saqlanadi).
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    public function storeWarehouses(array $items): int
    {
        // Sklad turi (matn) -> warehouse_type.id kesh
        $typeCache = WarehouseType::pluck('id', 'title')->all();

        $syncedCodes = [];

        foreach ($items as $item) {
            $code = trim((string) ($item['code'] ?? ''));
            $title = trim((string) ($item['name'] ?? ''));

            if ($code === '' || $title === '') {
                continue;
            }

            // type matnini warehouse_type ga bog'lash (bo'lmasa yaratish)
            $typeId = null;
            $typeTitle = trim((string) ($item['type'] ?? ''));
            if ($typeTitle !== '') {
                if (! array_key_exists($typeTitle, $typeCache)) {
                    $typeCache[$typeTitle] = WarehouseType::create([
                        'title' => $typeTitle,
                        'is_active' => true,
                    ])->id;
                }
                $typeId = $typeCache[$typeTitle];
            }

            Warehouse::updateOrCreate(
                ['code' => $code],
                [
                    'title' => mb_substr($title, 0, 255),
                    'type' => $typeId,
                    'is_active' => filter_var($item['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
                ]
            );

            $syncedCodes[] = $code;
        }

        // 1C dan kelmagan skladlarni faolsizlantirish (faqat javob bo'sh bo'lmasa)
        if (! empty($syncedCodes)) {
            Warehouse::whereNotIn('code', $syncedCodes)
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        return count($syncedCodes);
    }
}
