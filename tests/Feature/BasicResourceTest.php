<?php

use App\Models\BasicResource;
use App\Models\User;
use App\Services\ProductService;

beforeEach(function () {
    // Use MySQL connection for these tests since migrations use dropForeign by name (unsupported in SQLite)
    config([
        'database.default' => 'mysql',
        'database.connections.mysql.database' => 'stockly',
    ]);

    BasicResource::query()->where('code', 'like', 'TST-%')->delete();
});

test('guests cannot search basic resources', function () {
    $this->getJson(route('api.basic-resources.search'))->assertUnauthorized();
});

test('search returns basic resources filtered by name', function () {
    $user = User::query()->first();
    BasicResource::factory()->create(['code' => 'TST-000001', 'name' => 'РРЛ Aviation Tuzel']);
    BasicResource::factory()->create(['code' => 'TST-000002', 'name' => 'Кабельная линия Юнусабад']);

    $this->actingAs($user);

    $response = $this->getJson(route('api.basic-resources.search').'?search=Aviation');

    $response->assertSuccessful();
    $response->assertJsonCount(1);
    $response->assertJson([
        ['id' => 'TST-000001', 'code' => 'TST-000001', 'title' => 'РРЛ Aviation Tuzel'],
    ]);
});

test('search matches basic resources by code', function () {
    $user = User::query()->first();
    BasicResource::factory()->create(['code' => 'TST-778899', 'name' => 'Вышка сотовой связи']);

    $this->actingAs($user);

    $response = $this->getJson(route('api.basic-resources.search').'?search=TST-778899');

    $response->assertSuccessful();
    $response->assertJsonFragment(['code' => 'TST-778899']);
});

test('search respects the limit parameter', function () {
    $user = User::query()->first();
    foreach (range(1, 5) as $index) {
        BasicResource::factory()->create(['code' => 'TST-LIM-'.$index, 'name' => 'Лимитируемый объект №'.$index]);
    }

    $this->actingAs($user);

    $response = $this->getJson(route('api.basic-resources.search').'?'.http_build_query(['search' => 'Лимитируемый', 'limit' => 3]));

    $response->assertSuccessful();
    $response->assertJsonCount(3);
});

test('refresh syncs basic resources from the integration', function () {
    $user = User::query()->first();

    $this->mock(ProductService::class)
        ->shouldReceive('syncBasicResources')
        ->once()
        ->andReturn(17807);

    $this->actingAs($user);

    $response = $this->postJson(route('api.basic-resources.refresh'));

    $response->assertSuccessful();
    $response->assertJson([
        'success' => true,
        'count' => 17807,
    ]);
});

test('refresh returns error when integration fails', function () {
    $user = User::query()->first();

    $this->mock(ProductService::class)
        ->shouldReceive('syncBasicResources')
        ->once()
        ->andThrow(new Exception('Ошибка подключения к серверу'));

    $this->actingAs($user);

    $response = $this->postJson(route('api.basic-resources.refresh'));

    $response->assertServerError();
    $response->assertJson(['success' => false]);
});

test('storeBasicResources upserts items and removes stale records', function () {
    $stale = BasicResource::factory()->create(['code' => 'TST-STALE', 'name' => 'Старый объект', 'updated_at' => now()->subDay()]);
    BasicResource::factory()->create(['code' => 'TST-KEEP', 'name' => 'Старое название', 'updated_at' => now()->subDay()]);

    $service = app(ProductService::class);

    $count = $service->storeBasicResources([
        ['ОсновноеСредствоКод' => 'TST-KEEP', 'ОсновноеСредство' => 'Новое название', 'Склад' => 'Ташкент'],
        ['ОсновноеСредствоКод' => 'TST-NEW', 'ОсновноеСредство' => 'Новый объект'],
        ['ОсновноеСредствоКод' => '', 'ОсновноеСредство' => 'Без кода — пропускается'],
    ]);

    expect($count)->toBe(2);
    expect(BasicResource::where('code', 'TST-KEEP')->value('name'))->toBe('Новое название');
    expect(BasicResource::where('code', 'TST-NEW')->exists())->toBeTrue();
    expect(BasicResource::where('code', 'TST-STALE')->exists())->toBeFalse();
});
