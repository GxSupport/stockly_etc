<?php

use App\Data\ProductData;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\ProductService;

beforeEach(function () {
    // Use MySQL connection for these tests since migrations use dropForeign by name (unsupported in SQLite)
    config([
        'database.default' => 'mysql',
        'database.connections.mysql.database' => 'stockly',
    ]);
});

test('guests are redirected to the login page', function () {
    $warehouse = Warehouse::query()->first();

    $this->get(route('warehouses.show', $warehouse))->assertRedirect(route('login'));
});

test('management users can view the warehouse show page', function () {
    $user = User::query()->where('type', 'admin')->first();
    $warehouse = Warehouse::query()->first();

    $this->actingAs($user);

    $response = $this->get(route('warehouses.show', $warehouse));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('warehouses/show')
        ->where('warehouse.id', $warehouse->id)
        ->where('warehouse.code', $warehouse->code)
        ->has('warehouse.type_info')
    );
});

test('non-management users cannot view the warehouse show page', function () {
    $user = User::query()->where('type', 'frp')->first();
    $warehouse = Warehouse::query()->first();

    $this->actingAs($user);

    $this->get(route('warehouses.show', $warehouse))->assertForbidden();
});

test('show page returns 404 for a missing warehouse', function () {
    $user = User::query()->where('type', 'admin')->first();

    $this->actingAs($user);

    $this->get(route('warehouses.show', 999999))->assertNotFound();
});

test('warehouse products endpoint returns products from the integration', function () {
    $user = User::query()->where('type', 'admin')->first();
    $warehouse = Warehouse::query()->first();

    $this->mock(ProductService::class)
        ->shouldReceive('getProductsList')
        ->once()
        ->withArgs(fn (string $warehouseCode, string $warehouseTitle, ?string $date) => $warehouseCode === $warehouse->code && $warehouseTitle === $warehouse->title && $date === '01.07.2026')
        ->andReturn([
            new ProductData(
                name: 'Кабель UTP',
                warehouse: $warehouse->title,
                measure: 'м',
                price: 1500.0,
                count: '10',
                nomenclature: '00001'
            ),
        ]);

    $this->actingAs($user);

    $response = $this->getJson(route('warehouses.products', $warehouse).'?date=01.07.2026');

    $response->assertSuccessful();
    $response->assertJson([
        'success' => true,
        'data' => [
            [
                'name' => 'Кабель UTP',
                'measure' => 'м',
                'count' => '10',
                'nomenclature' => '00001',
            ],
        ],
    ]);
});

test('warehouse products endpoint returns error when integration fails', function () {
    $user = User::query()->where('type', 'admin')->first();
    $warehouse = Warehouse::query()->first();

    $this->mock(ProductService::class)
        ->shouldReceive('getProductsList')
        ->once()
        ->andThrow(new Exception('Ошибка подключения к серверу'));

    $this->actingAs($user);

    $response = $this->getJson(route('warehouses.products', $warehouse));

    $response->assertServerError();
    $response->assertJson([
        'success' => false,
        'message' => 'Ошибка подключения к серверу',
    ]);
});

test('warehouse products endpoint validates the date format', function () {
    $user = User::query()->where('type', 'admin')->first();
    $warehouse = Warehouse::query()->first();

    $this->actingAs($user);

    $response = $this->getJson(route('warehouses.products', $warehouse).'?date=2026-07-01');

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['date']);
});
