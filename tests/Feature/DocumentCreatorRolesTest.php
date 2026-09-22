<?php

use App\Models\DepList;
use App\Models\DocumentPriority;
use App\Models\DocumentPriorityConfig;
use App\Models\Documents;
use App\Models\DocumentType;
use App\Models\User;
use App\Models\UserRoles;
use App\Models\UserWarehouse;
use App\Models\Warehouse;
use App\Services\DocumentPriorityService;
use App\Services\DocumentService;
use App\Services\EmployeService;
use Illuminate\Support\Facades\Http;

/**
 * Issue #29, #30: Старший МОЛ va Зам директор ham akt yarata oladi —
 * sklad biriktiriladi, zanjir yaratuvchining o'z bosqichidan boshlanadi.
 */
beforeEach(function () {
    config([
        'database.default' => 'mysql',
        'database.connections.mysql.database' => 'stockly',
    ]);

    cleanupCreatorRolesFixtures();
});

afterEach(function () {
    cleanupCreatorRolesFixtures();
});

const CREATOR_PHONES = [
    'deputy' => 998900000301,
    'boss' => 998900000302,
    'director' => 998900000303,
    'admin' => 998900000304,
    'frp' => 998900000305,
];

function cleanupCreatorRolesFixtures(): void
{
    $type = DocumentType::where('code', 'TST-CRT')->first();
    if ($type) {
        $documentIds = Documents::where('type', $type->id)->pluck('id');
        DocumentPriority::whereIn('document_id', $documentIds)->delete();
        Documents::whereIn('id', $documentIds)->delete();
        DocumentPriorityConfig::where('type_id', $type->id)->delete();
        $type->delete();
    }

    $userIds = User::whereIn('phone', CREATOR_PHONES)->pluck('id');
    UserWarehouse::whereIn('user_id', $userIds)->delete();
    User::whereIn('id', $userIds)->delete();
    Warehouse::whereIn('code', ['WH-CRT-1', 'WH-CRT-2'])->delete();
    DepList::where('dep_code', 'TSTCRT')->delete();
}

/**
 * @return array{type: DocumentType, users: array<string, User>, warehouses: array<int, Warehouse>}
 */
function createCreatorRolesFixtures(): array
{
    foreach (['frp', 'header_frp', 'deputy_director', 'director', 'buxgalter', 'admin'] as $role) {
        UserRoles::firstOrCreate(['title' => $role], ['name' => $role, 'is_active' => 1]);
    }

    DepList::firstOrCreate(['dep_code' => 'TSTCRT'], ['title' => 'Тестовый отдел', 'is_active' => 1]);

    $users = [];
    foreach ([
        'deputy' => 'deputy_director',
        'boss' => 'header_frp',
        'director' => 'director',
        'admin' => 'admin',
        'frp' => 'frp',
    ] as $key => $role) {
        $users[$key] = User::firstOrCreate(
            ['phone' => CREATOR_PHONES[$key]],
            ['name' => 'Creator '.$key, 'type' => $role, 'password' => bcrypt('password'), 'is_active' => 1, 'dep_code' => 'TSTCRT']
        );
    }

    $warehouses = [
        Warehouse::create(['code' => 'WH-CRT-1', 'title' => 'Склад CRT 1', 'is_active' => 1]),
        Warehouse::create(['code' => 'WH-CRT-2', 'title' => 'Склад CRT 2', 'is_active' => 1]),
    ];

    $type = DocumentType::create([
        'code' => 'TST-CRT',
        'title' => 'Тестовый смонтированных CRT',
        'workflow_type' => DocumentType::WORKFLOW_SEQUENTIAL,
        'requires_deputy_approval' => false,
        'is_active' => true,
    ]);

    foreach ([1 => 'frp', 2 => 'header_frp', 3 => 'deputy_director', 4 => 'director', 5 => 'buxgalter'] as $ordering => $role) {
        DocumentPriorityConfig::create(['type_id' => $type->id, 'ordering' => $ordering, 'user_role' => $role]);
    }

    return ['type' => $type, 'users' => $users, 'warehouses' => $warehouses];
}

function storeCreatorDocument(DocumentType $type, string $number, array $extra = [])
{
    return test()->post(route('documents.store'), [
        'number' => $number,
        'document_type_id' => $type->id,
        'main_tool' => 'Тестовое место',
        'products' => [
            ['product_name' => 'Кабель UTP', 'measure' => 'м', 'quantity' => 2, 'amount' => 100],
        ],
        ...$extra,
    ]);
}

// ---------- Sklad biriktirish (#29, #30) ----------

test('admin can assign a warehouse to a header_frp employee and it survives a later edit without warehouse_id', function () {
    $fx = createCreatorRolesFixtures();
    $boss = $fx['users']['boss'];

    $this->actingAs($fx['users']['admin'])
        ->put(route('employees.update', $boss), ['type' => 'header_frp', 'warehouse_id' => $fx['warehouses'][0]->id])
        ->assertRedirect(route('employees.index'));

    expect(UserWarehouse::where('user_id', $boss->id)->value('warehouse_id'))->toBe($fx['warehouses'][0]->id);

    $this->actingAs($fx['users']['admin'])
        ->put(route('employees.update', $boss), ['name' => 'Boss renamed', 'type' => 'header_frp'])
        ->assertRedirect(route('employees.index'));

    expect(UserWarehouse::where('user_id', $boss->id)->value('warehouse_id'))->toBe($fx['warehouses'][0]->id);

    $this->actingAs($fx['users']['admin'])
        ->get(route('employees.edit', $boss))
        ->assertInertia(fn ($page) => $page->where('employee.warehouse.warehouse_id', $fx['warehouses'][0]->id));
});

test('deputy_director keeps a warehouse binding and can replace it', function () {
    $fx = createCreatorRolesFixtures();
    $deputy = $fx['users']['deputy'];
    $service = app(EmployeService::class);

    $service->updateEmployee($deputy, ['warehouse_id' => $fx['warehouses'][0]->id]);
    expect(UserWarehouse::where('user_id', $deputy->id)->value('warehouse_id'))->toBe($fx['warehouses'][0]->id);

    $service->updateEmployee($deputy, ['name' => 'Deputy renamed']);
    expect(UserWarehouse::where('user_id', $deputy->id)->value('warehouse_id'))->toBe($fx['warehouses'][0]->id);

    $service->updateEmployee($deputy, ['warehouse_id' => $fx['warehouses'][1]->id]);
    expect(UserWarehouse::where('user_id', $deputy->id)->count())->toBe(1);
    expect(UserWarehouse::where('user_id', $deputy->id)->value('warehouse_id'))->toBe($fx['warehouses'][1]->id);
});

test('changing the role to director removes the warehouse binding', function () {
    $fx = createCreatorRolesFixtures();
    $deputy = $fx['users']['deputy'];
    $service = app(EmployeService::class);

    $service->updateEmployee($deputy, ['warehouse_id' => $fx['warehouses'][0]->id]);
    $service->updateEmployee($deputy, ['type' => 'director']);

    expect(UserWarehouse::where('user_id', $deputy->id)->exists())->toBeFalse();
});

test('canCreateDocuments is true only for frp, header_frp and deputy_director', function (string $role, bool $expected) {
    expect((new User(['type' => $role]))->canCreateDocuments())->toBe($expected);
})->with([
    ['frp', true],
    ['header_frp', true],
    ['deputy_director', true],
    ['director', false],
    ['buxgalter', false],
    ['admin', false],
]);

// ---------- Zanjir yaratuvchi bosqichidan boshlanadi (#29, #30) ----------

test('header_frp creator chain drops the frp stage', function () {
    $fx = createCreatorRolesFixtures();
    $document = Documents::create([
        'user_id' => $fx['users']['boss']->id, 'author_id' => $fx['users']['boss']->id,
        'number' => '2026/30001', 'type' => $fx['type']->id, 'date_order' => date('Y-m-d'),
        'status' => 1, 'is_draft' => 1, 'requires_deputy_approval' => false,
    ]);

    (new DocumentPriorityService)->createPriority($document->id, $document->type, 'header_frp');

    $priorities = DocumentPriority::where('document_id', $document->id)->orderBy('ordering')->get();
    expect($priorities->pluck('user_role')->all())->toBe(['header_frp', 'director', 'buxgalter']);
    expect($priorities->pluck('ordering')->all())->toBe([2, 3, 4]);
});

test('deputy_director creator chain drops frp and header_frp and always keeps its own stage', function (bool $flag) {
    $fx = createCreatorRolesFixtures();
    $document = Documents::create([
        'user_id' => $fx['users']['deputy']->id, 'author_id' => $fx['users']['deputy']->id,
        'number' => '2026/30002', 'type' => $fx['type']->id, 'date_order' => date('Y-m-d'),
        'status' => 1, 'is_draft' => 1, 'requires_deputy_approval' => $flag,
    ]);

    (new DocumentPriorityService)->createPriority($document->id, $document->type, 'deputy_director');

    $priorities = DocumentPriority::where('document_id', $document->id)->orderBy('ordering')->get();
    expect($priorities->pluck('user_role')->all())->toBe(['deputy_director', 'director', 'buxgalter']);
    expect($priorities->pluck('ordering')->all())->toBe([3, 4, 5]);
    expect($priorities->where('user_role', 'deputy_director')->count())->toBe(1);
})->with(['flag on' => [true], 'flag off' => [false]]);

test('frp creator chain is unchanged', function () {
    $fx = createCreatorRolesFixtures();
    $document = Documents::create([
        'user_id' => $fx['users']['frp']->id, 'author_id' => $fx['users']['frp']->id,
        'number' => '2026/30003', 'type' => $fx['type']->id, 'date_order' => date('Y-m-d'),
        'status' => 1, 'is_draft' => 1, 'requires_deputy_approval' => false,
    ]);

    (new DocumentPriorityService)->createPriority($document->id, $document->type, 'frp');

    $priorities = DocumentPriority::where('document_id', $document->id)->orderBy('ordering')->get();
    expect($priorities->pluck('user_role')->all())->toBe(['frp', 'header_frp', 'director', 'buxgalter']);
    expect($priorities->pluck('ordering')->all())->toBe([1, 2, 3, 4]);
});

// ---------- Saqlash va yuborish (#30) ----------

test('deputy_director can store an act; it starts at its own stage and goes straight to the director when sent', function () {
    $fx = createCreatorRolesFixtures();
    $deputy = $fx['users']['deputy'];
    $director = $fx['users']['director'];

    $this->actingAs($deputy);
    storeCreatorDocument($fx['type'], '2026/30004')->assertRedirect()->assertSessionMissing('error');

    $document = Documents::where('number', '2026/30004')->where('type', $fx['type']->id)->first();
    expect($document)->not->toBeNull();
    expect($document->status)->toBe(3);
    expect($document->author_id)->toBe($deputy->id);
    expect((bool) $document->requires_deputy_approval)->toBeTrue();

    $this->postJson(route('documents.send-to-next', $document->id))->assertOk();

    $document->refresh();
    expect($document->status)->toBe(4);
    expect((int) $document->is_draft)->toBe(0);
    expect(DocumentPriority::where('document_id', $document->id)->where('user_role', 'deputy_director')->value('is_success'))->toBe(1);

    expect(DocumentPriority::query()->awaitingApprovalFor($director)->where('document_id', $document->id)->count())->toBe(1);
    expect(DocumentPriority::query()->awaitingApprovalFor($deputy)->where('document_id', $document->id)->count())->toBe(0);

    // Yaratuvchi o'z hujjatini «Входящие» da ko'rmaydi (qamrov mavjud bo'lsa ham, bo'lmasa ham)
    $props = $this->get(route('documents.index', ['status' => 'sent', 'scope' => 'incoming']))
        ->assertOk()
        ->viewData('page')['props'];
    expect($props['awaitingApprovalCount'])->toBe(0);
    if ($props['scope'] === 'incoming') {
        expect(collect($props['documents']['data'])->pluck('id'))->not->toContain($document->id);
    }

    $this->actingAs($director)
        ->get(route('documents.index', ['status' => 'sent', 'scope' => 'incoming']))
        ->assertInertia(fn ($page) => $page->where('documents.data', fn ($rows) => collect($rows)->pluck('id')->contains($document->id)));
});

test('header_frp creator act starts at stage 2 and its draft can still be edited', function () {
    $fx = createCreatorRolesFixtures();

    $this->actingAs($fx['users']['boss']);
    storeCreatorDocument($fx['type'], '2026/30005')->assertRedirect()->assertSessionMissing('error');

    $document = Documents::where('number', '2026/30005')->where('type', $fx['type']->id)->first();
    expect($document->status)->toBe(2);

    $this->put(route('documents.update', $document->id), [
        'number' => '2026/30005',
        'document_type_id' => $fx['type']->id,
        'main_tool' => 'Изменённое место',
        'products' => [['product_name' => 'Кабель UTP', 'measure' => 'м', 'quantity' => 3, 'amount' => 150]],
    ])->assertRedirect(route('documents.index'))->assertSessionMissing('error');

    $document->refresh();
    expect($document->main_tool)->toBe('Изменённое место');
    expect($document->status)->toBe(2);
    expect((int) $document->is_draft)->toBe(1);
});

test('a role outside the chain still cannot store an act', function () {
    $fx = createCreatorRolesFixtures();

    $this->actingAs($fx['users']['director']);
    storeCreatorDocument($fx['type'], '2026/30006')->assertSessionHas('error', 'Вы не можете перевести заявку на следующий этап');

    expect(Documents::where('number', '2026/30006')->where('type', $fx['type']->id)->exists())->toBeFalse();
});

test('rejected act returns to its author even when the chain has no stage 1', function () {
    $fx = createCreatorRolesFixtures();
    $boss = $fx['users']['boss'];

    $this->actingAs($boss);
    storeCreatorDocument($fx['type'], '2026/30007');
    $document = Documents::where('number', '2026/30007')->where('type', $fx['type']->id)->first();
    $this->postJson(route('documents.send-to-next', $document->id))->assertOk();

    $this->actingAs($fx['users']['director']);
    expect((new DocumentService($document->id))->getToCharge())->toBe($boss->id);
});

// ---------- Sahifalar ----------

test('deputy_director opens the create page when a warehouse is bound and lands on drafts by default', function () {
    $fx = createCreatorRolesFixtures();
    $deputy = $fx['users']['deputy'];
    Http::fake(['*' => Http::response([])]);

    $this->actingAs($deputy);

    $this->get(route('documents.create'))->assertRedirect(route('documents.index'))->assertSessionHas('error');

    UserWarehouse::create(['user_id' => $deputy->id, 'warehouse_id' => $fx['warehouses'][0]->id]);

    $this->get(route('documents.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('documents/create')->where('ownWarehouse.code', 'WH-CRT-1'));

    $this->get(route('documents.index'))
        ->assertInertia(fn ($page) => $page->where('status', 'draft'));
});
