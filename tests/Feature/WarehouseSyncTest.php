<?php

use App\Models\Warehouse;
use App\Models\WarehouseType;
use App\Services\WarehouseService;

beforeEach(function () {
    config([
        'database.default' => 'mysql',
        'database.connections.mysql.database' => 'stockly',
    ]);

    cleanupWarehouseSyncFixtures();
});

afterEach(function () {
    cleanupWarehouseSyncFixtures();
});

function cleanupWarehouseSyncFixtures(): void
{
    Warehouse::whereIn('code', ['WH-SYNC-1', 'WH-SYNC-2', 'WH-SYNC-STALE'])->delete();
    WarehouseType::whereIn('title', ['Оптовый-TST', 'Розничный-TST'])->delete();
}

test('storeWarehouses upserts by code and maps type + is_active', function () {
    (new WarehouseService)->storeWarehouses([
        ['Код' => 'WH-SYNC-1', 'Наименование' => 'Sklad Bir', 'ВидСклада' => 'Оптовый-TST'],
        ['Код' => 'WH-SYNC-2', 'Наименование' => 'Sklad Ikki', 'ВидСклада' => ''],
    ]);

    $w1 = Warehouse::where('code', 'WH-SYNC-1')->with('type_info')->first();
    expect($w1)->not->toBeNull();
    expect($w1->title)->toBe('Sklad Bir');
    expect($w1->is_active)->toBeTrue();
    expect($w1->type_info->title)->toBe('Оптовый-TST');

    // ВидСклада bo'sh bo'lsa type null bo'ladi
    $w2 = Warehouse::where('code', 'WH-SYNC-2')->first();
    expect($w2->is_active)->toBeTrue();
    expect($w2->type)->toBeNull();

    // ВидСклада matni bo'yicha warehouse_type yaratiladi (dublikat yo'q)
    expect(WarehouseType::where('title', 'Оптовый-TST')->count())->toBe(1);
});

test('storeWarehouses trims and dedupes duplicate codes keeping the last', function () {
    // Real 1С javobida ba'zi kodlar ortiqcha probel va takror bilan keladi
    $count = (new WarehouseService)->storeWarehouses([
        ['Код' => 'WH-SYNC-1', 'Наименование' => 'Birinchi', 'ВидСклада' => 'Оптовый-TST'],
        ['Код' => 'WH-SYNC-1   ', 'Наименование' => 'Oxirgi', 'ВидСклада' => 'Оптовый-TST'],
    ]);

    expect($count)->toBe(1);
    expect(Warehouse::where('code', 'WH-SYNC-1')->count())->toBe(1);
    expect(Warehouse::where('code', 'WH-SYNC-1')->first()->title)->toBe('Oxirgi');
});

test('storeWarehouses updates existing warehouse by code without duplicating', function () {
    (new WarehouseService)->storeWarehouses([
        ['Код' => 'WH-SYNC-1', 'Наименование' => 'Eski nom', 'ВидСклада' => 'Оптовый-TST'],
    ]);
    (new WarehouseService)->storeWarehouses([
        ['Код' => 'WH-SYNC-1', 'Наименование' => 'Yangi nom', 'ВидСклада' => 'Оптовый-TST'],
    ]);

    expect(Warehouse::where('code', 'WH-SYNC-1')->count())->toBe(1);
    expect(Warehouse::where('code', 'WH-SYNC-1')->first()->title)->toBe('Yangi nom');
});

test('storeWarehouses deactivates warehouses missing from the 1C response', function () {
    (new WarehouseService)->storeWarehouses([
        ['Код' => 'WH-SYNC-1', 'Наименование' => 'Sklad Bir', 'ВидСклада' => 'Оптовый-TST'],
        ['Код' => 'WH-SYNC-STALE', 'Наименование' => 'Eskirgan', 'ВидСклада' => 'Оптовый-TST'],
    ]);

    // Keyingi sinxronda faqat bittasi keladi — ikkinchisi faolsizlanadi
    (new WarehouseService)->storeWarehouses([
        ['Код' => 'WH-SYNC-1', 'Наименование' => 'Sklad Bir', 'ВидСклада' => 'Оптовый-TST'],
    ]);

    expect(Warehouse::where('code', 'WH-SYNC-STALE')->first()->is_active)->toBeFalse();
    expect(Warehouse::where('code', 'WH-SYNC-1')->first()->is_active)->toBeTrue();
});
