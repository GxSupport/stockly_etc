<?php

use App\Models\DocumentPriority;
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

    cleanupDismantlingFixtures();
});

afterEach(function () {
    cleanupDismantlingFixtures();
});

function cleanupDismantlingFixtures(): void
{
    $documentIds = Documents::whereIn('number', ['2026/9989', '2026/9988'])->pluck('id');
    DocumentPriority::whereIn('document_id', $documentIds)->delete();
    DocumentProducts::whereIn('document_id', $documentIds)->delete();
    Documents::whereIn('id', $documentIds)->delete();

    DocumentType::where('code', 'dismantling')->where('title', 'Демонтажа (test)')->delete();
    DocumentType::where('code', 'TST-DSM-OTHER')->delete();
    User::where('phone', 998900000094)->delete();
}

/**
 * @return array{0: User, 1: DocumentType}
 */
function createDismantlingFixtures(): array
{
    UserRoles::firstOrCreate(['title' => 'frp'], ['name' => 'frp', 'is_active' => 1]);

    $user = User::firstOrCreate(
        ['phone' => 998900000094],
        ['name' => 'Dismantling Test', 'type' => 'frp', 'password' => bcrypt('password'), 'is_active' => 1]
    );

    $type = DocumentType::firstOrCreate(
        ['code' => 'dismantling'],
        ['title' => 'Демонтажа (test)', 'workflow_type' => DocumentType::WORKFLOW_SEQUENTIAL, 'requires_deputy_approval' => false]
    );

    return [$user, $type];
}

function dismantlingPayload(DocumentType $type, string $number, ?string $mainTool): array
{
    return [
        'number' => $number,
        'document_type_id' => $type->id,
        'main_tool' => $mainTool,
        'products' => [
            ['product_name' => 'Кабель UTP', 'measure' => 'м', 'quantity' => 1, 'amount' => 100, 'nomenclature' => 'NOM-1'],
        ],
    ];
}

test('dismantling document cannot be saved without a warehouse in main_tool', function (?string $mainTool) {
    [$user, $type] = createDismantlingFixtures();

    $this->actingAs($user)
        ->from(route('documents.create'))
        ->post(route('documents.store'), dismantlingPayload($type, '2026/9989', $mainTool))
        ->assertRedirect(route('documents.create'))
        ->assertSessionHasErrors(['main_tool' => 'Выберите склад в поле «Место демонтажа»']);

    expect(Documents::where('number', '2026/9989')->exists())->toBeFalse();
})->with([
    'null' => null,
    'empty string' => '',
    'whitespace' => '   ',
]);

test('dismantling document with a selected warehouse passes main_tool validation', function () {
    [$user, $type] = createDismantlingFixtures();

    $this->actingAs($user)
        ->from(route('documents.create'))
        ->post(route('documents.store'), dismantlingPayload($type, '2026/9988', 'Центральный склад (технический центр)'))
        ->assertSessionDoesntHaveErrors('main_tool');
});

test('main_tool stays optional for non-dismantling document types', function () {
    [$user] = createDismantlingFixtures();
    $otherType = DocumentType::create([
        'code' => 'TST-DSM-OTHER',
        'title' => 'Другой тип (test)',
        'workflow_type' => DocumentType::WORKFLOW_SEQUENTIAL,
        'requires_deputy_approval' => false,
    ]);

    $this->actingAs($user)
        ->from(route('documents.create'))
        ->post(route('documents.store'), dismantlingPayload($otherType, '2026/9988', null))
        ->assertSessionDoesntHaveErrors('main_tool');
});
