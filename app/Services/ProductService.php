<?php

namespace App\Services;

use App\Data\CompositionData;
use App\Data\ProductServiceData;
use App\Models\UserWarehouse;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Auth;
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

        $baseUrl = 'http://89.236.216.12:8083';
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
                    'Authorization' => 'Basic aHR0cGJvdDpodHRwYm90',
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
                            organization_code: $value['ПодразделениеОрганизацииКод']
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

        $baseUrl = 'http://89.236.216.12:8083';
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
                    'Authorization' => 'Basic aHR0cGJvdDpodHRwYm90',
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

    public function getProductsList(string $warehouseCode, string $warehouseTitle, ?string $date = null): array
    {
        $date = $date ?? date('d.m.Y');
        $date = date('d.m.Y', strtotime($date));

        $client = new Client([
            'proxy' => (config('services.app.local') == 'local') ? 'socks5h://host.docker.internal:8089' : '',
            'timeout' => 30,
            'connect_timeout' => 10,
            'verify' => false,
        ]);

        $baseUrl = 'http://89.236.216.12:8083';
        $endpoint = '/base2/hs/CarData/os/empl';

        $queryParams = [
            'm' => 'get_stock_leftover',
            'code' => $warehouseCode,
            'wh_name' => $warehouseTitle,
            'date' => $date,
        ];

        $fullUrl = $baseUrl.$endpoint.'?'.http_build_query($queryParams);

        Log::info('1C Products Integration Request (Guzzle)', [
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
                    'Authorization' => 'Basic aHR0cGJvdDpodHRwYm90',
                ],
            ]);

            $statusCode = $response->getStatusCode();
            $body = $response->getBody()->getContents();

            Log::info('1C Products Integration Response (Guzzle)', [
                'status' => $statusCode,
                'successful' => $statusCode >= 200 && $statusCode < 300,
                'body_length' => strlen($body),
            ]);

            $products = [];

            if ($statusCode >= 200 && $statusCode < 300) {
                $clean = str_replace('﻿', '', $body);
                $items = json_decode($clean, true);

                Log::info('1C Products Integration Parsed Data (Guzzle)', [
                    'items_count' => is_array($items) ? count($items) : 'not_array',
                ]);

                if (is_array($items)) {
                    foreach ($items as $value) {
                        $products[] = new \App\Data\ProductData(
                            name: $value['Номенклатура'],
                            warehouse: $value['Склад'],
                            measure: $value['ЕдИзм'],
                            price: $this->numberFromStringForProduct($value['СуммаОстаток']),
                            count: $value['КоличествоОстаток'],
                            nomenclature: $value['КодНоменклатуры']
                        );
                    }
                } else {
                    Log::warning('1C Products Integration: items is not array (Guzzle)', ['items' => $items]);
                }
            } else {
                Log::error('1C Products Integration Failed (Guzzle)', [
                    'status' => $statusCode,
                    'body' => $body,
                    'url' => $fullUrl,
                ]);
                throw new \Exception('Ошибка подключения к серверу, ошибка: '.$statusCode);
            }

            Log::info('1C Products Integration Final Result (Guzzle)', ['products_count' => count($products)]);

            return $products;

        } catch (\Exception $e) {
            Log::error('1C Products Integration Exception (Guzzle)', [
                'message' => $e->getMessage(),
                'url' => $fullUrl,
            ]);
            throw new \Exception('Ошибка подключения к серверу: '.$e->getMessage());
        }
    }

    public function numberFromStringForProduct(string|null $number): float
    {
        // если значение пустое или null
        if (empty($number)) {
            return 0.0;
        }

        // убираем запятые и пробелы
        $number = str_replace([',', ' '], '', $number);

        // проверяем что значение числовое
        if (!is_numeric($number)) {
            return 0.0;
        }

        // конвертируем сумму в сумы в тийины
        $number = (float) $number * 100;
        // форматируем число в float
        $number = $number / 100;

        return $number;
    }
}
