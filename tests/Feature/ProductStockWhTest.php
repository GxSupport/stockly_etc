<?php

use App\Services\ProductService;
use Illuminate\Support\Facades\Http;

/**
 * Issue #24: «Добавить товар» ro'yxati 1C ning get_stock_wh?date=&wh_code= metodidan olinadi.
 */
test('getProductsList calls get_stock_wh with today date and warehouse code and maps the response', function () {
    config(['services.one_c.base_url' => 'http://one-c.test:8083']);

    Http::fake([
        'one-c.test:8083/base2/hs/CarData/get_stock_wh*' => Http::response([
            [
                'Счет' => '10.80',
                'Субконто1' => 'Модем ADSL TD-8616 внешн.',
                'Субконто2' => 'МОЛ-Самарканд - Бобокулов Зохид/Менеджер региона',
                'Субконто3' => 'Документ расчетов ETC00000003 от 31.12.2012',
                'СуммаОстаток' => '201 000',
                'КоличествоОстаток' => '3',
            ],
        ]),
    ]);

    $products = app(ProductService::class)->getProductsList('1137', 'Склад Самарканд');

    Http::assertSent(function ($request) {
        parse_str(parse_url($request->url(), PHP_URL_QUERY), $query);

        return str_starts_with($request->url(), 'http://one-c.test:8083/base2/hs/CarData/get_stock_wh')
            && $query['wh_code'] === '1137'
            && $query['date'] === date('d.m.Y')
            && $request->hasHeader('Authorization', 'Basic '.config('services.one_c.basic_auth'));
    });

    expect($products)->toHaveCount(1);
    expect($products[0]->name)->toBe('Модем ADSL TD-8616 внешн.');
    expect($products[0]->count)->toBe('3');
    expect($products[0]->price)->toBe(67000.0);
    expect($products[0]->warehouse_code)->toBe('1137');
    expect($products[0]->warehouse)->toBe('Склад Самарканд');
    expect($products[0]->nomenclature)->toBe('Модем ADSL TD-8616 внешн.');
});

test('getProductsList passes the explicit date through in dd.mm.yyyy', function () {
    Http::fake(['*' => Http::response([])]);

    app(ProductService::class)->getProductsList('1137', 'Склад', '01.02.2026');

    Http::assertSent(fn ($request) => str_contains($request->url(), 'date=01.02.2026'));
});

test('mapStockWhItems cleans dirty names, parses spaced and comma numbers, and merges duplicate rows', function () {
    $service = app(ProductService::class);

    $products = $service->mapStockWhItems([
        [
            'Субконто1' => "53030008\t\tEchoLife HG510,1ADSL/ADSL2+-4LAN,230V AC вход",
            'Субконто3' => 'Документ 1',
            'СуммаОстаток' => '452 913,81',
            'КоличествоОстаток' => '2',
        ],
        [
            'Субконто1' => "53030008\t\tEchoLife HG510,1ADSL/ADSL2+-4LAN,230V AC вход",
            'Субконто3' => 'Документ 2',
            'СуммаОстаток' => '100 000',
            'КоличествоОстаток' => '1',
        ],
        [
            'Субконто1' => '',
            'СуммаОстаток' => '5',
            'КоличествоОстаток' => '5',
        ],
    ], '1137', 'Склад');

    expect($products)->toHaveCount(1);
    expect($products[0]->name)->toBe('EchoLife HG510,1ADSL/ADSL2+-4LAN,230V AC вход');
    expect($products[0]->count)->toBe('3');
    expect($products[0]->price)->toBe(184304.6);
    expect($products[0]->measure)->toBe('шт.');
});

test('parseOneCNumber handles 1C string formats', function (mixed $input, float $expected) {
    expect(app(ProductService::class)->parseOneCNumber($input))->toBe($expected);
})->with([
    'spaces' => ['201 000', 201000.0],
    'nbsp' => ["201\u{00A0}000", 201000.0],
    'comma decimal' => ['452 913,81', 452913.81],
    'dot decimal' => ['1 234.5', 1234.5],
    'thousands comma with dot decimal' => ['1,234.56', 1234.56],
    'empty' => ['', 0.0],
    'null' => [null, 0.0],
    'garbage' => ['abc', 0.0],
    'int' => [3, 3.0],
]);

test('cleanStockWhName strips leading code and tabs but keeps plain names', function () {
    $service = app(ProductService::class);

    expect($service->cleanStockWhName("53030008\t\tEchoLife HG510"))->toBe('EchoLife HG510');
    expect($service->cleanStockWhName('Модем ADSL TD-8616 внешн.'))->toBe('Модем ADSL TD-8616 внешн.');
    expect($service->cleanStockWhName("  Кабель   UTP\tcat5e "))->toBe('Кабель UTP cat5e');
});

test('getProductsList returns an empty list when 1C responds with a non-array body', function () {
    Http::fake(['*' => Http::response('null')]);

    expect(app(ProductService::class)->getProductsList('1137', 'Склад'))->toBe([]);
});

test('getProductsList throws a readable error when 1C fails', function () {
    Http::fake(['*' => Http::response('', 500)]);

    app(ProductService::class)->getProductsList('1137', 'Склад');
})->throws(Exception::class, 'Ошибка подключения к серверу');
