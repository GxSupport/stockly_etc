<?php

use App\Models\BasicResource;
use App\Models\DocumentPriority;
use App\Models\DocumentPriorityConfig;
use App\Models\Documents;
use App\Models\DocumentType;
use App\Models\User;
use App\Models\UserRoles;
use App\Services\DocumentPriorityService;

beforeEach(function () {
    // Use MySQL connection for these tests since migrations use dropForeign by name (unsupported in SQLite)
    config([
        'database.default' => 'mysql',
        'database.connections.mysql.database' => 'stockly',
    ]);

    cleanupDeputyApprovalFixtures();
});

afterEach(function () {
    cleanupDeputyApprovalFixtures();
});

function cleanupDeputyApprovalFixtures(): void
{
    $type = DocumentType::where('code', 'TST-DEP')->first();
    if ($type) {
        $documentIds = Documents::where('type', $type->id)->pluck('id');
        DocumentPriority::whereIn('document_id', $documentIds)->delete();
        Documents::whereIn('id', $documentIds)->delete();
        DocumentPriorityConfig::where('type_id', $type->id)->delete();
        $type->delete();
    }
    User::where('phone', 998900000099)->delete();
    User::where('phone', 998900000098)->delete();
}

function createDeputyApprovalFixtures(bool $requiresDeputy): Documents
{
    foreach (['frp', 'header_frp', 'deputy_director', 'director', 'buxgalter'] as $role) {
        UserRoles::firstOrCreate(['title' => $role], ['name' => $role, 'is_active' => 1]);
    }
    User::firstOrCreate(
        ['phone' => 998900000099],
        ['name' => 'Deputy Test', 'type' => 'deputy_director', 'password' => bcrypt('password'), 'is_active' => 1]
    );

    $type = DocumentType::create([
        'code' => 'TST-DEP',
        'title' => 'Тестовый тип (deputy)',
        'workflow_type' => DocumentType::WORKFLOW_SEQUENTIAL,
        'requires_deputy_approval' => false,
    ]);

    foreach ([
        ['ordering' => 1, 'user_role' => 'frp'],
        ['ordering' => 2, 'user_role' => 'header_frp'],
        ['ordering' => 3, 'user_role' => 'deputy_director'],
        ['ordering' => 4, 'user_role' => 'director'],
        ['ordering' => 5, 'user_role' => 'buxgalter'],
    ] as $config) {
        DocumentPriorityConfig::create([
            'type_id' => $type->id,
            'ordering' => $config['ordering'],
            'user_role' => $config['user_role'],
            'options' => null,
        ]);
    }

    return Documents::create([
        'user_id' => User::query()->first()->id,
        'number' => '2026/9999',
        'type' => $type->id,
        'date_order' => date('Y-m-d'),
        'status' => 1,
        'is_draft' => 1,
        'requires_deputy_approval' => $requiresDeputy,
    ]);
}

test('deputy director stage is created when the document flag is checked', function () {
    $document = createDeputyApprovalFixtures(requiresDeputy: true);

    (new DocumentPriorityService)->createPriority($document->id, $document->type, 'frp');

    $roles = DocumentPriority::where('document_id', $document->id)->orderBy('ordering')->pluck('user_role');

    expect($roles->contains('deputy_director'))->toBeTrue();
    expect($roles->values()->all())->toBe(['frp', 'header_frp', 'deputy_director', 'director', 'buxgalter']);
});

test('deputy director stage is skipped when the document flag is unchecked', function () {
    $document = createDeputyApprovalFixtures(requiresDeputy: false);

    (new DocumentPriorityService)->createPriority($document->id, $document->type, 'frp');

    $priorities = DocumentPriority::where('document_id', $document->id)->orderBy('ordering')->get();

    expect($priorities->pluck('user_role')->contains('deputy_director'))->toBeFalse();
    expect($priorities->pluck('user_role')->values()->all())->toBe(['frp', 'header_frp', 'director', 'buxgalter']);
    expect($priorities->pluck('ordering')->values()->all())->toBe([1, 2, 3, 4]);
});

test('main_tool (sklad) is saved on create and returned to the act view', function () {
    $document = createDeputyApprovalFixtures(requiresDeputy: false);
    $type = $document->type;

    $frp = User::firstOrCreate(
        ['phone' => 998900000098],
        ['name' => 'Frp DocTest', 'type' => 'frp', 'password' => bcrypt('password'), 'is_active' => 1]
    );

    $this->actingAs($frp);

    $response = $this->post(route('documents.store'), [
        'number' => '2026/9998',
        'document_type_id' => $type,
        'main_tool' => 'Тестовый склад',
        'products' => [
            ['product_name' => 'Кабель UTP', 'measure' => 'м', 'quantity' => 2, 'amount' => 100],
        ],
    ]);

    $response->assertRedirect();

    $created = Documents::where('number', '2026/9998')->where('type', $type)->first();

    expect($created)->not->toBeNull();
    expect($created->main_tool)->toBe('Тестовый склад');

    $show = $this->get(route('documents.show', $created->id));

    $show->assertOk();
    $show->assertInertia(fn ($page) => $page
        ->component('documents/show')
        ->where('document.main_tool', 'Тестовый склад')
        ->where('mainToolName', 'Тестовый склад')
    );

    BasicResource::query()->where('code', 'TST-OS-01')->delete();
    BasicResource::create(['code' => 'TST-OS-01', 'name' => 'Тестовое основное средство']);
    $created->update(['main_tool' => 'TST-OS-01']);

    $showWithOs = $this->get(route('documents.show', $created->id));

    $showWithOs->assertInertia(fn ($page) => $page
        ->where('document.main_tool', 'TST-OS-01')
        ->where('mainToolName', 'Тестовое основное средство')
    );

    BasicResource::query()->where('code', 'TST-OS-01')->delete();
});

test('document flag overrides the type flag when creating priorities', function () {
    $document = createDeputyApprovalFixtures(requiresDeputy: true);
    DocumentType::where('id', $document->type)->update(['requires_deputy_approval' => false]);

    (new DocumentPriorityService)->createPriority($document->id, $document->type, 'frp');

    $roles = DocumentPriority::where('document_id', $document->id)->pluck('user_role');

    expect($roles->contains('deputy_director'))->toBeTrue();
});
