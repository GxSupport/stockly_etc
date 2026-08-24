<?php

use App\Models\DocumentPriority;
use App\Models\DocumentPriorityConfig;
use App\Models\DocumentProducts;
use App\Models\Documents;
use App\Models\DocumentType;
use App\Models\User;
use App\Models\UserRoles;

beforeEach(function () {
    config([
        'database.default' => 'mysql',
        'database.connections.mysql.database' => 'stockly',
    ]);

    cleanupDocProductWarehouseFixtures();
});

afterEach(function () {
    cleanupDocProductWarehouseFixtures();
});

function cleanupDocProductWarehouseFixtures(): void
{
    $type = DocumentType::where('code', 'TST-WHP')->first();
    if ($type) {
        $documentIds = Documents::where('type', $type->id)->pluck('id');
        DocumentPriority::whereIn('document_id', $documentIds)->delete();
        DocumentProducts::whereIn('document_id', $documentIds)->delete();
        Documents::whereIn('id', $documentIds)->delete();
        DocumentPriorityConfig::where('type_id', $type->id)->delete();
        $type->delete();
    }
    User::where('phone', 998900000095)->delete();
}

function createDocProductWarehouseFixtures(): array
{
    foreach (['frp', 'header_frp', 'director', 'buxgalter'] as $role) {
        UserRoles::firstOrCreate(['title' => $role], ['name' => $role, 'is_active' => 1]);
    }

    $user = User::firstOrCreate(
        ['phone' => 998900000095],
        ['name' => 'DocWh Test', 'type' => 'frp', 'password' => bcrypt('password'), 'is_active' => 1]
    );

    $type = DocumentType::create([
        'code' => 'TST-WHP',
        'title' => 'Тестовый тип (warehouse)',
        'workflow_type' => DocumentType::WORKFLOW_SEQUENTIAL,
        'requires_deputy_approval' => false,
    ]);

    foreach ([
        ['ordering' => 1, 'user_role' => 'frp'],
        ['ordering' => 2, 'user_role' => 'header_frp'],
        ['ordering' => 3, 'user_role' => 'director'],
        ['ordering' => 4, 'user_role' => 'buxgalter'],
    ] as $config) {
        DocumentPriorityConfig::create([
            'type_id' => $type->id,
            'ordering' => $config['ordering'],
            'user_role' => $config['user_role'],
            'options' => null,
        ]);
    }

    return [$user, $type];
}

test('per-row warehouse is persisted on document products', function () {
    [$user, $type] = createDocProductWarehouseFixtures();

    $this->actingAs($user)->post(route('documents.store'), [
        'number' => '2026/9995',
        'document_type_id' => $type->id,
        'products' => [
            [
                'product_name' => 'Кабель UTP',
                'measure' => 'м',
                'quantity' => 2,
                'amount' => 200,
                'nomenclature' => 'NOM-1',
                'warehouse_code' => 'WH-A',
                'warehouse_name' => 'Склад А',
            ],
            [
                'product_name' => 'Розетка',
                'measure' => 'шт',
                'quantity' => 3,
                'amount' => 300,
                'nomenclature' => 'NOM-2',
                'warehouse_code' => 'WH-B',
                'warehouse_name' => 'Склад Б',
            ],
        ],
    ])->assertRedirect();

    $document = Documents::where('number', '2026/9995')->where('type', $type->id)->first();
    expect($document)->not->toBeNull();

    $rows = DocumentProducts::where('document_id', $document->id)->orderBy('id')->get();
    expect($rows)->toHaveCount(2);
    expect($rows[0]->warehouse_code)->toBe('WH-A');
    expect($rows[0]->warehouse_name)->toBe('Склад А');
    expect($rows[1]->warehouse_code)->toBe('WH-B');
    expect($rows[1]->warehouse_name)->toBe('Склад Б');
});

test('total_amount equals the sum of line amounts without double multiplication', function () {
    [$user, $type] = createDocProductWarehouseFixtures();

    $this->actingAs($user)->post(route('documents.store'), [
        'number' => '2026/9994',
        'document_type_id' => $type->id,
        'products' => [
            // amount — bu narx × miqdor (qator summasi), server yana ko'paytirmasligi kerak
            ['product_name' => 'Кабель UTP', 'measure' => 'м', 'quantity' => 2, 'amount' => 200],
            ['product_name' => 'Розетка', 'measure' => 'шт', 'quantity' => 3, 'amount' => 300],
        ],
    ])->assertRedirect();

    $document = Documents::where('number', '2026/9994')->where('type', $type->id)->first();

    expect((float) $document->total_amount)->toBe(500.0);
});

test('line amount is stored as submitted even when selected_product is present', function () {
    [$user, $type] = createDocProductWarehouseFixtures();

    $this->actingAs($user)->post(route('documents.store'), [
        'number' => '2026/9993',
        'document_type_id' => $type->id,
        'products' => [
            [
                'product_name' => 'Кабель UTP',
                'measure' => 'м',
                'quantity' => 4,
                'amount' => 400,
                'selected_product' => [
                    'name' => 'Кабель UTP',
                    'measure' => 'м',
                    'price' => 100,
                    'nomenclature' => 'NOM-1',
                ],
            ],
        ],
    ])->assertRedirect();

    $document = Documents::where('number', '2026/9993')->where('type', $type->id)->first();
    $row = DocumentProducts::where('document_id', $document->id)->first();

    expect((float) $row->amount)->toBe(400.0);
    expect((float) $document->total_amount)->toBe(400.0);
});
