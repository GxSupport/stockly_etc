<?php

namespace App\Services;

use App\Data\CompositionData;
use App\Data\ProductData;
use App\Data\ProductServiceData;
use App\Models\BasicResource;
use App\Models\UserWarehouse;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProductService
{
    public function listServiceFromDepCode(): array
    {
        $user = Auth::user();

        if (! $user->dep_code) {
            throw new \Exception('У вас нет кода отдела!');
        }

        $wh = UserWarehouse::where('user_id', $user->id)->with('warehouse')->first();

        if (! $wh || ! $wh->warehouse || ! $wh->warehouse->code) {
            throw new \Exception('У вас нет склада!');
        }

        $info['dep_code'] = $user->dep_code;
        $info['warehouse_code'] = $wh->warehouse->code;

        return $this->listService($info);
    }

    public function listService($info): array
    {
        $date = ($info['date']) ?? date('d.m.Y');
        $date = date('d.m.Y', strtotime($date));
        $foo_code = ($info['foo_code']) ?? null;
        $warehouse_code = ($info['warehouse_code']) ?? null;
        $dep_code = ($info['dep_code']) ?? null;

        // Plain Guzzle HTTP client
        $client = new Client([
            'proxy' => (config('services.app.local') == 'local') ? 'socks5h://host.docker.internal:8089' : '',
            'timeout' => 30,
            'connect_timeout' => 10,
            'verify' => false,
        ]);

        $baseUrl = config('services.one_c.base_url');
        $endpoint = '/base2/hs/CarData/goods/goodsget_stock_leftover_os'; // Same endpoint as GetGoodsRequest

        // Build query parameters like GetGoodsRequest does
        $queryParams = [
            'date' => $date,
        ];
        if (! is_null($foo_code)) {
            $queryParams['fooCode'] = $foo_code;
        }
        if (! is_null($warehouse_code)) {
            $queryParams['whCode'] = $warehouse_code;
        }
        if (! is_null($dep_code)) {
            $queryParams['depCode'] = $dep_code;
        }

        $fullUrl = $baseUrl.$endpoint.'?'.http_build_query($queryParams);

        Log::info('1C Services Integration Request (Plain Guzzle)', [
            'base_url' => $baseUrl,
            'endpoint' => $endpoint,
            'query_params' => $queryParams,
            'full_url' => $fullUrl,
        ]);

        try {
            $response = $client->get($endpoint, [
                'base_uri' => $baseUrl,
                'query' => $queryParams,
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => '*/*',
                    'Authorization' => 'Basic '.config('services.one_c.basic_auth'),
                ],
            ]);

            $statusCode = $response->getStatusCode();
            $body = $response->getBody()->getContents();

            Log::info('1C Services Integration Response (Plain Guzzle)', [
                'status' => $statusCode,
                'successful' => $statusCode >= 200 && $statusCode < 300,
                'body_length' => strlen($body),
            ]);

            $services = [];

            if ($statusCode >= 200 && $statusCode < 300) {
                $clean = str_replace('﻿', '', $body);
                $items = json_decode($clean, true);

                Log::info('1C Services Integration Parsed Data (Plain Guzzle)', [
                    'items_count' => is_array($items) ? count($items) : 'not_array',
                ]);

                if (is_array($items)) {
                    foreach ($items as $value) {
                        $services[] = new ProductServiceData(
                            name: $value['ОсновноеСредство'],
                            cost_balance: $this->numberFromStringForProduct($value['СтоимостьОстаток']),
                            quantity_balance: $value['КоличествоОстаток'],
                            deprecation_balance: $this->numberFromStringForProduct($value['АмортизацияОстаток']),
                            revaluation_balance: $value['ПереоценкаОстаток'],
                            organization: $value['ПодразделениеОрганизации'],
                            account: $value['СчетУчетаБУ'],
                            deprecation_account: $value['СчетНачисленияАмортизацииБУ'],
                            basic_resource_code: $value['ОсновноеСредствоКод'],
                            warehouse_code: $value['СкладКод'],
                            frp_code: $value['МОЛКод'],
                            organization_code: $value['ПодразделениеОрганизацииКод'],
                            warehouse_name: $value['Склад'] ?? null,
                        );
                    }
                } else {
                    Log::warning('1C Services Integration: items is not array (Plain Guzzle)', ['items' => $items]);
                }
            } else {
                Log::error('1C Services Integration Failed (Plain Guzzle)', [
                    'status' => $statusCode,
                    'body' => $body,
                    'url' => $fullUrl,
                ]);
                throw new \Exception('Ошибка подключения к серверу, ошибка: '.$statusCode);
            }

            Log::info('1C Services Integration Final Result (Plain Guzzle)', ['services_count' => count($services)]);

            return $services;

        } catch (\Exception $e) {
            Log::error('1C Services Integration Exception (Plain Guzzle)', [
                'message' => $e->getMessage(),
                'url' => $fullUrl,
            ]);
            throw new \Exception('Ошибка подключения к серверу: '.$e->getMessage());
        }
    }

    public function getComposition(string $osCode): array
    {
        $osCode = str_replace(' ', '', $osCode);

        $client = new Client([
            'proxy' => (config('services.app.local') == 'local') ? 'socks5h://host.docker.internal:8089' : '',
            'timeout' => 30,
            'connect_timeout' => 10,
            'verify' => false,
        ]);

        $baseUrl = config('services.one_c.base_url');
        $endpoint = '/base2/hs/CarData/os_composition/get_composition';

        $requestBody = [
            'dateStart' => Carbon::now()->subYear()->format('d.m.Y'),
            'dateEnd' => Carbon::now()->format('d.m.Y'),
            'os' => [
                ['osCode' => $osCode],
            ],
        ];

        Log::info('1C Composition Integration Request (Guzzle)', [
            'base_url' => $baseUrl,
            'endpoint' => $endpoint,
            'body' => $requestBody,
            'os_code' => $osCode,
        ]);

        try {
            $response = $client->post($endpoint, [
                'base_uri' => $baseUrl,
                'json' => $requestBody,
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => '*/*',
                    'Authorization' => 'Basic '.config('services.one_c.basic_auth'),
                ],
            ]);

            $statusCode = $response->getStatusCode();
            $body = $response->getBody()->getContents();

            Log::info('1C Composition Integration Response (Guzzle)', [
                'status' => $statusCode,
                'successful' => $statusCode >= 200 && $statusCode < 300,
                'body_length' => strlen($body),
            ]);

            $composition = [];

            if ($statusCode >= 200 && $statusCode < 300) {
                $clean = str_replace('﻿', '', $body);
                $items = json_decode($clean, true);

                Log::info('1C Composition Integration Parsed Data (Guzzle)', [
                    'items_count' => is_array($items) ? count($items) : 'not_array',
                ]);

                if (is_array($items)) {
                    foreach ($items as $item) {
                        $composition[] = new CompositionData(
                            account_dt: $item['СчетДт'] ?? '',
                            account_kt: $item['СчетКт'] ?? '',
                            subconto_dt1: $item['СубконтоДт1'] ?? '',
                            subconto_kt1: $item['СубконтоКт1'] ?? '',
                            subconto_kt3: $item['СубконтоКт3'] ?? '',
                            sum_turnover: $this->numberFromStringForProduct($item['СуммаОборот'] ?? '0'),
                            quantity_turnover_kt: $this->numberFromStringForProduct($item['КоличествоОборотКт'] ?? '0')
                        );
                    }
                } else {
                    Log::warning('1C Composition Integration: items is not array (Guzzle)', ['items' => $items]);
                }
            } else {
                Log::error('1C Composition Integration Failed (Guzzle)', [
                    'status' => $statusCode,
                    'body' => $body,
                ]);
                throw new \Exception('Ошибка подключения к серверу, ошибка: '.$statusCode);
            }

            Log::info('1C Composition Integration Final Result (Guzzle)', ['composition_count' => count($composition)]);

            return $composition;

        } catch (\Exception $e) {
            Log::error('1C Composition Integration Exception (Guzzle)', [
                'message' => $e->getMessage(),
                'os_code' => $osCode,
            ]);
            throw new \Exception('Ошибка подключения к серверу: '.$e->getMessage());
        }
    }

    /**
     * Tanlangan sklad qoldig'i (issue #24) — 1C ning `get_stock_wh?date=&wh_code=` metodi.
     * Eski `os/empl?m=get_stock_leftover` sklad bo'yicha filtrlamas edi, shuning uchun ro'yxat bo'sh kelardi.
     *
     * @return array<int, ProductData>
     */
    public function getProductsList(string $warehouseCode, string $warehouseTitle, ?string $date = null): array
    {
        $date = date('d.m.Y', strtotime($date ?? date('d.m.Y')));

        $baseUrl = config('services.one_c.base_url');
        $endpoint = '/base2/hs/CarData/get_stock_wh';
        $queryParams = ['date' => $date, 'wh_code' => $warehouseCode];
        $fullUrl = $baseUrl.$endpoint.'?'.http_build_query($queryParams);

        Log::info('1C Stock WH Request', ['url' => $fullUrl]);

        try {
            $response = Http::withOptions([
                'proxy' => (config('services.app.local') == 'local') ? 'socks5h://host.docker.internal:8089' : '',
                'verify' => false,
            ])
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => '*/*',
                    'Authorization' => 'Basic '.config('services.one_c.basic_auth'),
                ])
                ->connectTimeout(10)
                ->timeout(120)
                ->get($baseUrl.$endpoint, $queryParams);

            if (! $response->successful()) {
                Log::error('1C Stock WH Failed', ['status' => $response->status(), 'url' => $fullUrl]);
                throw new \Exception('Ошибка подключения к серверу, ошибка: '.$response->status());
            }

            $items = json_decode(str_replace("\xEF\xBB\xBF", '', $response->body()), true);

            if (! is_array($items)) {
                Log::warning('1C Stock WH: response is not an array', ['url' => $fullUrl]);

                return [];
            }

            $products = $this->mapStockWhItems($items, $warehouseCode, $warehouseTitle);

            Log::info('1C Stock WH Result', ['raw_count' => count($items), 'products_count' => count($products)]);

            return $products;
        } catch (\Exception $e) {
            Log::error('1C Stock WH Exception', ['message' => $e->getMessage(), 'url' => $fullUrl]);
            throw new \Exception('Ошибка подключения к серверу: '.$e->getMessage());
        }
    }

    /**
     * get_stock_wh javobini ProductData ro'yxatiga aylantiradi.
     * Bir xil tovar Субконто3 (hisob-kitob hujjati) bo'yicha bir necha qator bo'lib keladi —
     * nom bo'yicha birlashtirilib, soni va summasi qo'shiladi. Narx = summa / soni (birlik narxi).
     *
     * @param  array<int, array<string, mixed>>  $items
     * @return array<int, ProductData>
     */
    public function mapStockWhItems(array $items, string $warehouseCode, string $warehouseTitle): array
    {
        $grouped = [];

        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }

            $name = $this->cleanStockWhName((string) ($item['Субконто1'] ?? ''));
            if ($name === '') {
                continue;
            }

            $quantity = $this->parseOneCNumber($item['КоличествоОстаток'] ?? null);
            $sum = $this->parseOneCNumber($item['СуммаОстаток'] ?? null);

            if (! isset($grouped[$name])) {
                $grouped[$name] = ['quantity' => 0.0, 'sum' => 0.0];
            }
            $grouped[$name]['quantity'] += $quantity;
            $grouped[$name]['sum'] += $sum;
        }

        $products = [];
        foreach ($grouped as $name => $totals) {
            $quantity = round($totals['quantity'], 3);
            $sum = round($totals['sum'], 2);
            $unitPrice = $quantity > 0 ? round($sum / $quantity, 2) : $sum;

            $products[] = new ProductData(
                name: $name,
                warehouse: $warehouseTitle,
                measure: 'шт.',
                price: $unitPrice,
                count: $this->formatQuantity($quantity),
                nomenclature: mb_substr($name, 0, 255),
                warehouse_code: $warehouseCode,
            );
        }

        return $products;
    }

    /**
     * Субконто1 ba'zan "53030008\t\tEchoLife HG510..." ko'rinishida keladi — boshidagi kod va tab/probellar olib tashlanadi.
     */
    public function cleanStockWhName(string $name): string
    {
        $name = str_replace("\xC2\xA0", ' ', $name);
        $name = preg_replace('/^\s*\d{4,}\s*\t+\s*/u', '', $name) ?? $name;
        $name = preg_replace('/\s+/u', ' ', $name) ?? $name;

        return trim($name);
    }

    /**
     * 1C raqamlari matn ko'rinishida keladi: "201 000", "452 913,81", "1 234.5".
     * Probellar (oddiy va NBSP) olib tashlanadi, vergul kasr ajratgichi sifatida nuqtaga almashtiriladi.
     */
    public function parseOneCNumber(mixed $value): float
    {
        if ($value === null || $value === '') {
            return 0.0;
        }

        if (is_int($value) || is_float($value)) {
            return (float) $value;
        }

        $number = str_replace([' ', "\xC2\xA0", "\xE2\x80\xAF"], '', (string) $value);

        if (str_contains($number, ',') && str_contains($number, '.')) {
            $number = str_replace(',', '', $number);
        } else {
            $number = str_replace(',', '.', $number);
        }

        return is_numeric($number) ? (float) $number : 0.0;
    }

    private function formatQuantity(float $quantity): string
    {
        return rtrim(rtrim(number_format($quantity, 3, '.', ''), '0'), '.');
    }

    /**
     * Tanlangan sklad bo'yicha ОС (asosiy vositalar) qoldig'ini 1С dan olish.
     * 'Товары' modal (demontaj Место демонтажа) shu ro'yxatni ko'rsatadi.
     * Endpoint: goodsget_stock_leftover_os?whCode=<sklad kodi> (os/empl emas — u nomenklatura uchun).
     *
     * @return array<int, ProductData>
     */
    public function getWarehouseOsList(string $warehouseCode, ?string $date = null): array
    {
        $date = date('d.m.Y', strtotime($date ?? date('d.m.Y')));

        $client = new Client([
            'proxy' => (config('services.app.local') == 'local') ? 'socks5h://host.docker.internal:8089' : '',
            'timeout' => 60,
            'connect_timeout' => 10,
            'verify' => false,
        ]);

        $baseUrl = config('services.one_c.base_url');
        $endpoint = '/base2/hs/CarData/goods/goodsget_stock_leftover_os';
        $queryParams = ['whCode' => $warehouseCode, 'date' => $date];

        Log::info('1C Warehouse OS Request', ['endpoint' => $endpoint, 'query_params' => $queryParams]);

        try {
            $response = $client->get($endpoint, [
                'base_uri' => $baseUrl,
                'query' => $queryParams,
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => '*/*',
                    'Authorization' => 'Basic '.config('services.one_c.basic_auth'),
                ],
            ]);

            $statusCode = $response->getStatusCode();
            $body = $response->getBody()->getContents();

            if ($statusCode < 200 || $statusCode >= 300) {
                Log::error('1C Warehouse OS Failed', ['status' => $statusCode]);
                throw new \Exception('Ошибка подключения к серверу, ошибка: '.$statusCode);
            }

            $items = json_decode(str_replace('﻿', '', $body), true);
            if (! is_array($items)) {
                return [];
            }

            $products = [];
            foreach ($items as $value) {
                $products[] = new ProductData(
                    name: (string) ($value['ОсновноеСредство'] ?? ''),
                    warehouse: (string) ($value['Склад'] ?? ''),
                    measure: 'шт.',
                    price: $this->numberFromStringForProduct($value['СтоимостьОстаток'] ?? null),
                    count: (string) ($value['КоличествоОстаток'] ?? ''),
                    nomenclature: (string) ($value['ОсновноеСредствоКод'] ?? ''),
                );
            }

            Log::info('1C Warehouse OS Result', ['products_count' => count($products)]);

            return $products;
        } catch (\Exception $e) {
            Log::error('1C Warehouse OS Exception', ['message' => $e->getMessage()]);
            throw new \Exception('Ошибка подключения к серверу: '.$e->getMessage());
        }
    }

    public function syncBasicResources(): int
    {
        $items = $this->fetchAllBasicResourcesFromApi();

        return $this->storeBasicResources($items);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function fetchAllBasicResourcesFromApi(): array
    {
        $client = new Client([
            'proxy' => (config('services.app.local') == 'local') ? 'socks5h://host.docker.internal:8089' : '',
            'timeout' => 180,
            'connect_timeout' => 10,
            'verify' => false,
        ]);

        $baseUrl = config('services.one_c.base_url');
        $endpoint = '/base2/hs/CarData/goods/goodsget_stock_leftover_os';
        $queryParams = ['date' => date('d.m.Y')];

        Log::info('1C Basic Resources Sync Request', ['endpoint' => $endpoint, 'query_params' => $queryParams]);

        try {
            $response = $client->get($endpoint, [
                'base_uri' => $baseUrl,
                'query' => $queryParams,
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => '*/*',
                    'Authorization' => 'Basic '.config('services.one_c.basic_auth'),
                ],
            ]);

            $statusCode = $response->getStatusCode();
            $body = $response->getBody()->getContents();

            if ($statusCode < 200 || $statusCode >= 300) {
                Log::error('1C Basic Resources Sync Failed', ['status' => $statusCode]);
                throw new \Exception('Ошибка подключения к серверу, ошибка: '.$statusCode);
            }

            $clean = str_replace('﻿', '', $body);
            $items = json_decode($clean, true);

            if (! is_array($items)) {
                Log::warning('1C Basic Resources Sync: items is not array');
                throw new \Exception('Некорректный ответ от сервера 1С');
            }

            Log::info('1C Basic Resources Sync Response', ['items_count' => count($items)]);

            return $items;
        } catch (\Exception $e) {
            Log::error('1C Basic Resources Sync Exception', ['message' => $e->getMessage()]);
            throw new \Exception('Ошибка подключения к серверу: '.$e->getMessage());
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    public function storeBasicResources(array $items): int
    {
        $syncStartedAt = now();

        $rows = collect($items)
            ->filter(fn ($item) => ! empty($item['ОсновноеСредствоКод']) && ! empty($item['ОсновноеСредство']))
            ->map(fn ($item) => [
                'code' => trim((string) $item['ОсновноеСредствоКод']),
                'name' => mb_substr((string) $item['ОсновноеСредство'], 0, 500),
                'warehouse_name' => isset($item['Склад']) ? mb_substr((string) $item['Склад'], 0, 500) : null,
                'created_at' => $syncStartedAt,
                'updated_at' => $syncStartedAt,
            ])
            ->keyBy('code')
            ->values();

        $rows->chunk(500)->each(function ($chunk) {
            BasicResource::upsert($chunk->all(), ['code'], ['name', 'warehouse_name', 'updated_at']);
        });

        if ($rows->isNotEmpty()) {
            BasicResource::where('updated_at', '<', $syncStartedAt)->delete();
        }

        return $rows->count();
    }

    public function numberFromStringForProduct(?string $number): float
    {
        return round($this->parseOneCNumber($number), 2);
    }
}
