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
    Warehouse::whereIn('code', ['WH-SYNC-1', 'WH-SYNC-2', 'WH-SYNC-STALE', 'WH-SYNC-NOUID'])->delete();
    WarehouseType::whereIn('title', ['Оптовый-TST', 'Розничный-TST'])->delete();
}

const SYNC_UID_1 = '00000000-0000-0000-0000-00000000a001';
const SYNC_UID_2 = '00000000-0000-0000-0000-00000000a002';
const SYNC_UID_3 = '00000000-0000-0000-0000-00000000a003';

test('storeWarehouses upserts by uid and maps code, type + is_active', function () {
    (new WarehouseService)->storeWarehouses([
        ['УИД' => SYNC_UID_1, 'Код' => 'WH-SYNC-1', 'Наименование' => 'Sklad Bir', 'ВидСклада' => 'Оптовый-TST'],
        ['УИД' => SYNC_UID_2, 'Код' => 'WH-SYNC-2', 'Наименование' => 'Sklad Ikki', 'ВидСклада' => ''],
    ]);

    $w1 = Warehouse::where('uid', SYNC_UID_1)->with('type_info')->first();
    expect($w1)->not->toBeNull();
    expect($w1->code)->toBe('WH-SYNC-1');
    expect($w1->title)->toBe('Sklad Bir');
    expect($w1->is_active)->toBeTrue();
    expect($w1->type_info->title)->toBe('Оптовый-TST');

    // ВидСклада bo'sh bo'lsa type null bo'ladi
    $w2 = Warehouse::where('uid', SYNC_UID_2)->first();
    expect($w2->is_active)->toBeTrue();
    expect($w2->type)->toBeNull();

    // ВидСклада matni bo'yicha warehouse_type yaratiladi (dublikat yo'q)
    expect(WarehouseType::where('title', 'Оптовый-TST')->count())->toBe(1);
});

test('storeWarehouses keeps different warehouses that share one 1C code', function () {
    // Real 1С javobida bitta Код turli skladlarda (turli УИД) uchraydi
    $count = (new WarehouseService)->storeWarehouses([
        ['УИД' => SYNC_UID_1, 'Код' => 'WH-SYNC-1', 'Наименование' => 'Birinchi', 'ВидСклада' => 'Оптовый-TST'],
        ['УИД' => SYNC_UID_2, 'Код' => 'WH-SYNC-1   ', 'Наименование' => 'Ikkinchi', 'ВидСклада' => 'Оптовый-TST'],
    ]);

    expect($count)->toBe(2);
    expect(Warehouse::where('code', 'WH-SYNC-1')->orderBy('uid')->pluck('title')->all())->toBe(['Birinchi', 'Ikkinchi']);
});

test('storeWarehouses dedupes a repeated uid keeping the last row', function () {
    $count = (new WarehouseService)->storeWarehouses([
        ['УИД' => SYNC_UID_1, 'Код' => 'WH-SYNC-1', 'Наименование' => 'Birinchi', 'ВидСклада' => 'Оптовый-TST'],
        ['УИД' => ' '.SYNC_UID_1.' ', 'Код' => 'WH-SYNC-1', 'Наименование' => 'Oxirgi', 'ВидСклада' => 'Оптовый-TST'],
    ]);

    expect($count)->toBe(1);
    expect(Warehouse::where('uid', SYNC_UID_1)->count())->toBe(1);
    expect(Warehouse::where('uid', SYNC_UID_1)->first()->title)->toBe('Oxirgi');
});

test('storeWarehouses updates an existing warehouse by uid, including a changed code', function () {
    (new WarehouseService)->storeWarehouses([
        ['УИД' => SYNC_UID_1, 'Код' => 'WH-SYNC-1', 'Наименование' => 'Eski nom', 'ВидСклада' => 'Оптовый-TST'],
    ]);
    $id = Warehouse::where('uid', SYNC_UID_1)->value('id');

    (new WarehouseService)->storeWarehouses([
        ['УИД' => SYNC_UID_1, 'Код' => 'WH-SYNC-2', 'Наименование' => 'Yangi nom', 'ВидСклада' => 'Оптовый-TST'],
    ]);

    $warehouse = Warehouse::where('uid', SYNC_UID_1)->sole();
    expect($warehouse->id)->toBe($id);
    expect($warehouse->code)->toBe('WH-SYNC-2');
    expect($warehouse->title)->toBe('Yangi nom');
});

test('storeWarehouses skips rows without uid', function () {
    $count = (new WarehouseService)->storeWarehouses([
        ['УИД' => '', 'Код' => 'WH-SYNC-NOUID', 'Наименование' => 'UID siz', 'ВидСклада' => 'Оптовый-TST'],
        ['Код' => 'WH-SYNC-NOUID', 'Наименование' => 'UID kaliti yo\'q', 'ВидСклада' => 'Оптовый-TST'],
    ]);

    expect($count)->toBe(0);
    expect(Warehouse::where('code', 'WH-SYNC-NOUID')->exists())->toBeFalse();
});

test('storeWarehouses deactivates warehouses missing from the 1C response', function () {
    (new WarehouseService)->storeWarehouses([
        ['УИД' => SYNC_UID_1, 'Код' => 'WH-SYNC-1', 'Наименование' => 'Sklad Bir', 'ВидСклада' => 'Оптовый-TST'],
        ['УИД' => SYNC_UID_3, 'Код' => 'WH-SYNC-STALE', 'Наименование' => 'Eskirgan', 'ВидСклада' => 'Оптовый-TST'],
    ]);

    // Keyingi sinxronda faqat bittasi keladi — ikkinchisi faolsizlanadi
    (new WarehouseService)->storeWarehouses([
        ['УИД' => SYNC_UID_1, 'Код' => 'WH-SYNC-1', 'Наименование' => 'Sklad Bir', 'ВидСклада' => 'Оптовый-TST'],
    ]);

    expect(Warehouse::where('uid', SYNC_UID_3)->first()->is_active)->toBeFalse();
    expect(Warehouse::where('uid', SYNC_UID_1)->first()->is_active)->toBeTrue();
});

test('storeWarehouses links a legacy warehouse without uid by code, preferring the same title', function () {
    // code kalit bo'lgan davrdan qolgan yozuv — id (va user_warehouse bog'lanishlari) saqlanishi kerak
    $legacy = Warehouse::create(['code' => 'WH-SYNC-1', 'title' => 'Ikkinchi', 'is_active' => true]);

    $count = (new WarehouseService)->storeWarehouses([
        ['УИД' => SYNC_UID_1, 'Код' => 'WH-SYNC-1', 'Наименование' => 'Birinchi', 'ВидСклада' => 'Оптовый-TST'],
        ['УИД' => SYNC_UID_2, 'Код' => 'WH-SYNC-1', 'Наименование' => 'Ikkinchi', 'ВидСклада' => 'Оптовый-TST'],
    ]);

    expect($count)->toBe(2);
    expect(Warehouse::where('code', 'WH-SYNC-1')->count())->toBe(2);
    expect($legacy->fresh()->uid)->toBe(SYNC_UID_2);
    expect($legacy->fresh()->is_active)->toBeTrue();
});

test('storeWarehouses links a legacy warehouse to the last same-code row when no title matches', function () {
    $legacy = Warehouse::create(['code' => 'WH-SYNC-1', 'title' => 'Eski nom', 'is_active' => true]);

    (new WarehouseService)->storeWarehouses([
        ['УИД' => SYNC_UID_1, 'Код' => 'WH-SYNC-1', 'Наименование' => 'Birinchi', 'ВидСклада' => 'Оптовый-TST'],
        ['УИД' => SYNC_UID_2, 'Код' => 'WH-SYNC-1', 'Наименование' => 'Ikkinchi', 'ВидСклада' => 'Оптовый-TST'],
    ]);

    expect($legacy->fresh()->uid)->toBe(SYNC_UID_2);
    expect($legacy->fresh()->title)->toBe('Ikkinchi');
    expect(Warehouse::where('code', 'WH-SYNC-1')->count())->toBe(2);
});
