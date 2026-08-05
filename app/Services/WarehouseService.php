<?php

namespace App\Services;

use App\Models\UserWarehouse;
use App\Models\Warehouse;
use App\Models\WarehouseType;
use GuzzleHttp\Client;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
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
     * Kelgan skladlarni code bo'yicha batch upsert qiladi, ВидСклада matnini warehouse_type ga
     * bog'laydi, API'da bo'lmagan skladlarni faolsizlantiradi (o'chirmaydi — FK saqlanadi).
     *
     * 1С javobidagi kalitlar: Код (code), Наименование (title), ВидСклада (type).
     * is_active javobda yo'q — sinxronlangan barcha sklad faol deb belgilanadi.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    public function storeWarehouses(array $items): int
    {
        $now = now();

        // ВидСклада (matn) -> warehouse_type.id kesh (bo'sh -> null)
        $typeCache = WarehouseType::pluck('id', 'title')->all();
        $resolveType = function (mixed $rawType) use (&$typeCache): ?int {
            $title = trim((string) $rawType);
            if ($title === '') {
                return null;
            }
            if (! array_key_exists($title, $typeCache)) {
                $typeCache[$title] = WarehouseType::create(['title' => $title, 'is_active' => true])->id;
            }

            return $typeCache[$title];
        };

        $rows = collect($items)
            ->map(fn ($item) => [
                'code' => trim((string) ($item['Код'] ?? '')),
                'title' => mb_substr(trim((string) ($item['Наименование'] ?? '')), 0, 255),
                'type' => $resolveType($item['ВидСклада'] ?? null),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->filter(fn ($row) => $row['code'] !== '' && $row['title'] !== '')
            ->keyBy('code') // dublikat kodlarni birlashtirish (oxirgi yozuv qoladi)
            ->values();

        if ($rows->isEmpty()) {
            return 0;
        }

        // Avval hammasini faolsizlantirib, keyin sinxronlanganlarni upsert bilan faollashtirish.
        // Shu tariqa 1С da yo'q skladlar faolsiz qoladi (o'chirilmaydi — FK saqlanadi), va bu
        // timestamp aniqligiga bog'liq emas. Atomarlik uchun transaction.
        DB::transaction(function () use ($rows) {
            Warehouse::query()->update(['is_active' => false]);

            $rows->chunk(500)->each(function ($chunk) {
                Warehouse::upsert($chunk->all(), ['code'], ['title', 'type', 'is_active', 'updated_at']);
            });
        });

        return $rows->count();
    }
}
