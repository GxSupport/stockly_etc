<?php

use App\Models\User;
use App\Models\Warehouse;

/**
 * Issue #37: xodim formasidagi «Склад» qidiruvi sahifalanadi va kod bo'yicha
 * barqaror tartibda qaytadi — ro'yxat 20 tada tugab qolmaydi.
 */
beforeEach(function () {
    config([
        'database.default' => 'mysql',
        'database.connections.mysql.database' => 'stockly',
    ]);

    Warehouse::query()->where('code', 'like', 'TEWS%')->delete();
});

afterEach(function () {
    Warehouse::query()->where('code', 'like', 'TEWS%')->delete();
});

function createEmployeeSearchWarehouses(int $count): void
{
    foreach (range(1, $count) as $i) {
        Warehouse::create([
            'code' => sprintf('TEWS%03d', $i),
            'title' => "Склад для сотрудника {$i}",
            'type' => 1,
            'is_active' => true,
        ]);
    }
}

test('employee warehouse search supports paging in a stable code order', function () {
    createEmployeeSearchWarehouses(25);
    $admin = User::query()->where('type', 'admin')->first();

    $this->actingAs($admin);

    $firstPage = $this->getJson(route('employees.search-warehouses', ['search' => 'TEWS', 'limit' => 20, 'page' => 0]));
    $firstPage->assertSuccessful()->assertJsonCount(20);
    expect($firstPage->json('0.code'))->toBe('TEWS001')
        ->and($firstPage->json('19.code'))->toBe('TEWS020');

    $secondPage = $this->getJson(route('employees.search-warehouses', ['search' => 'TEWS', 'limit' => 20, 'page' => 1]));
    $secondPage->assertSuccessful()->assertJsonCount(5);
    expect($secondPage->json('0.code'))->toBe('TEWS021')
        ->and($secondPage->json('4.code'))->toBe('TEWS025');

    $thirdPage = $this->getJson(route('employees.search-warehouses', ['search' => 'TEWS', 'limit' => 20, 'page' => 2]));
    $thirdPage->assertSuccessful()->assertJsonCount(0);
});

test('employee warehouse search matches by title and skips inactive warehouses', function () {
    createEmployeeSearchWarehouses(2);
    Warehouse::create(['code' => 'TEWS999', 'title' => 'Неактивный склад для сотрудника', 'type' => 1, 'is_active' => false]);
    $admin = User::query()->where('type', 'admin')->first();

    $this->actingAs($admin);

    $response = $this->getJson(route('employees.search-warehouses', ['search' => 'для сотрудника']));

    $response->assertSuccessful();
    $response->assertJsonFragment(['code' => 'TEWS001']);
    $response->assertJsonFragment(['code' => 'TEWS002']);
    $response->assertJsonMissing(['code' => 'TEWS999']);
});

test('employee warehouse search caps the limit and ignores negative pages', function () {
    createEmployeeSearchWarehouses(3);
    $admin = User::query()->where('type', 'admin')->first();

    $this->actingAs($admin);

    $this->getJson(route('employees.search-warehouses', ['search' => 'TEWS', 'limit' => 500, 'page' => -3]))
        ->assertSuccessful()
        ->assertJsonCount(3);
});

test('employee create page no longer ships the whole warehouse list', function () {
    $admin = User::query()->where('type', 'admin')->first();

    $this->actingAs($admin);

    $this->get(route('employees.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('employees/create')
            ->has('dep_list')
            ->has('supervisors')
            ->missing('warehouses'));
});

test('employee warehouse search requires a management user', function () {
    $frp = User::query()->where('type', 'frp')->first();

    $this->actingAs($frp);

    $this->getJson(route('employees.search-warehouses', ['search' => 'TEWS']))->assertForbidden();
});
