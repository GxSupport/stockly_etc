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
        ['code' => 'WH-SYNC-1', 'name' => 'Sklad Bir', 'type' => 'Оптовый-TST', 'is_active' => true],
        ['code' => 'WH-SYNC-2', 'name' => 'Sklad Ikki', 'type' => 'Розничный-TST', 'is_active' => false],
    ]);

    $w1 = Warehouse::where('code', 'WH-SYNC-1')->with('type_info')->first();
    expect($w1)->not->toBeNull();
    expect($w1->title)->toBe('Sklad Bir');
    expect($w1->is_active)->toBeTrue();
    expect($w1->type_info->title)->toBe('Оптовый-TST');

    $w2 = Warehouse::where('code', 'WH-SYNC-2')->first();
    expect($w2->is_active)->toBeFalse();

    // type matni bo'yicha warehouse_type topiladi/yaratiladi (dublikat yo'q)
    expect(WarehouseType::where('title', 'Оптовый-TST')->count())->toBe(1);
});

test('storeWarehouses updates existing warehouse by code without duplicating', function () {
    (new WarehouseService)->storeWarehouses([
        ['code' => 'WH-SYNC-1', 'name' => 'Eski nom', 'type' => 'Оптовый-TST', 'is_active' => true],
    ]);
    (new WarehouseService)->storeWarehouses([
        ['code' => 'WH-SYNC-1', 'name' => 'Yangi nom', 'type' => 'Оптовый-TST', 'is_active' => true],
    ]);

    expect(Warehouse::where('code', 'WH-SYNC-1')->count())->toBe(1);
    expect(Warehouse::where('code', 'WH-SYNC-1')->first()->title)->toBe('Yangi nom');
});

test('storeWarehouses deactivates warehouses missing from the 1C response', function () {
    (new WarehouseService)->storeWarehouses([
        ['code' => 'WH-SYNC-1', 'name' => 'Sklad Bir', 'type' => 'Оптовый-TST', 'is_active' => true],
        ['code' => 'WH-SYNC-STALE', 'name' => 'Eskirgan', 'type' => 'Оптовый-TST', 'is_active' => true],
    ]);

    // Keyingi sinxronda faqat bittasi keladi — ikkinchisi faolsizlanadi
    (new WarehouseService)->storeWarehouses([
        ['code' => 'WH-SYNC-1', 'name' => 'Sklad Bir', 'type' => 'Оптовый-TST', 'is_active' => true],
    ]);

    expect(Warehouse::where('code', 'WH-SYNC-STALE')->first()->is_active)->toBeFalse();
    expect(Warehouse::where('code', 'WH-SYNC-1')->first()->is_active)->toBeTrue();
});
