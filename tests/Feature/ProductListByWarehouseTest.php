<?php

use App\Models\User;
use App\Models\UserRoles;
use App\Models\UserWarehouse;
use App\Models\Warehouse;
use App\Services\ProductService;

beforeEach(function () {
    config([
        'database.default' => 'mysql',
        'database.connections.mysql.database' => 'stockly',
    ]);

    cleanupProductListFixtures();
});

afterEach(function () {
    cleanupProductListFixtures();
});

function cleanupProductListFixtures(): void
{
    $user = User::where('phone', 998900000096)->first();
    if ($user) {
        UserWarehouse::where('user_id', $user->id)->delete();
        $user->delete();
    }
    Warehouse::whereIn('code', ['WH-PLT-1', 'WH-PLT-2', 'WH-PLT-3'])->delete();
}

function createProductListFixtures(bool $withOwnWarehouse = true): User
{
    UserRoles::firstOrCreate(['title' => 'frp'], ['name' => 'frp', 'is_active' => 1]);

    $user = User::firstOrCreate(
        ['phone' => 998900000096],
        ['name' => 'ProductList Test', 'type' => 'frp', 'password' => bcrypt('password'), 'is_active' => 1]
    );

    $own = Warehouse::create(['code' => 'WH-PLT-1', 'title' => 'Собственный склад TST', 'is_active' => 1]);
    Warehouse::create(['code' => 'WH-PLT-2', 'title' => 'Другой склад TST', 'is_active' => 1]);

    if ($withOwnWarehouse) {
        UserWarehouse::create(['user_id' => $user->id, 'warehouse_id' => $own->id]);
    }

    return $user;
}

test('list with warehouse_code loads products for the selected warehouse', function () {
    $user = createProductListFixtures();

    $this->mock(ProductService::class)
        ->shouldReceive('getProductsList')
        ->once()
        ->withArgs(fn ($code, $title) => $code === 'WH-PLT-2' && $title === 'Другой склад TST')
        ->andReturn([]);

    $this->actingAs($user)
        ->getJson('/api/product/list?warehouse_code=WH-PLT-2')
        ->assertOk()
        ->assertJson(['success' => true]);
});

test('list without warehouse_code keeps using the own user warehouse', function () {
    $user = createProductListFixtures();

    $this->mock(ProductService::class)
        ->shouldReceive('getProductsList')
        ->once()
        ->withArgs(fn ($code, $title) => $code === 'WH-PLT-1' && $title === 'Собственный склад TST')
        ->andReturn([]);

    $this->actingAs($user)
        ->getJson('/api/product/list')
        ->assertOk()
        ->assertJson(['success' => true]);
});

test('list rejects an unknown warehouse_code', function () {
    $user = createProductListFixtures();

    $this->actingAs($user)
        ->getJson('/api/product/list?warehouse_code=WH-PLT-NOPE')
        ->assertUnprocessable();
});

test('list without warehouse_code fails when the user has no warehouse', function () {
    $user = createProductListFixtures(withOwnWarehouse: false);

    $this->actingAs($user)
        ->getJson('/api/product/list')
        ->assertBadRequest()
        ->assertJson(['success' => false, 'message' => 'Вам не назначен склад, обратитесь к администратору']);
});

test('list without warehouse_code merges products from every warehouse assigned to the user', function () {
    $user = createProductListFixtures();
    $second = Warehouse::create(['code' => 'WH-PLT-3', 'title' => 'Второй собственный склад TST', 'is_active' => 1]);
    UserWarehouse::create(['user_id' => $user->id, 'warehouse_id' => $second->id]);

    $mock = $this->mock(ProductService::class);
    $mock->shouldReceive('getProductsList')
        ->once()
        ->withArgs(fn ($code) => $code === 'WH-PLT-1')
        ->andReturn([['nomenclature' => 'A', 'warehouse' => 'Собственный склад TST']]);
    $mock->shouldReceive('getProductsList')
        ->once()
        ->withArgs(fn ($code) => $code === 'WH-PLT-3')
        ->andReturn([['nomenclature' => 'B', 'warehouse' => 'Второй собственный склад TST']]);

    $this->actingAs($user)
        ->getJson('/api/product/list')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.nomenclature', 'A')
        ->assertJsonPath('data.1.nomenclature', 'B');
});
