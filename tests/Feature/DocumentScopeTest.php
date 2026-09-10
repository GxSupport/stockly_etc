<?php

use App\Models\DocumentPriority;
use App\Models\DocumentPriorityConfig;
use App\Models\Documents;
use App\Models\DocumentType;
use App\Models\User;
use App\Models\UserRoles;
use App\Services\DashboardService;
use App\Services\DocumentPriorityService;
use App\Services\DocumentService;
use Illuminate\Http\Request;

beforeEach(function () {
    // dropForeign by name migratsiyalari SQLite'da ishlamaydi, shuning uchun MySQL
    config([
        'database.default' => 'mysql',
        'database.connections.mysql.database' => 'stockly',
    ]);

    cleanupScopeFixtures();
});

afterEach(function () {
    cleanupScopeFixtures();
});

function cleanupScopeFixtures(): void
{
    foreach (['TST-SEQ', 'TST-OFF'] as $code) {
        $type = DocumentType::where('code', $code)->first();
        if (! $type) {
            continue;
        }

        $documentIds = Documents::where('type', $type->id)->pluck('id');
        DocumentPriority::whereIn('document_id', $documentIds)->delete();
        Documents::whereIn('id', $documentIds)->delete();
        DocumentPriorityConfig::where('type_id', $type->id)->delete();
        $type->delete();
    }

    foreach ([998900000191, 998900000192, 998900000193] as $phone) {
        User::where('phone', $phone)->delete();
    }
}

/**
 * Ketma-ket workflow: frp(1) → header_frp(2) → buxgalter(3).
 * Aynan shu zanjirda header_frp bosqichi user_id siz yaratiladi.
 *
 * @return array{type: DocumentType, boss: User, worker: User, otherWorker: User}
 */
function createScopeFixtures(): array
{
    foreach (['frp', 'header_frp', 'buxgalter', 'assigned'] as $role) {
        UserRoles::firstOrCreate(['title' => $role], ['name' => $role, 'is_active' => 1]);
    }

    $boss = User::firstOrCreate(
        ['phone' => 998900000191],
        ['name' => 'Boss Scope', 'type' => 'header_frp', 'password' => bcrypt('password'), 'is_active' => 1]
    );

    $worker = User::firstOrCreate(
        ['phone' => 998900000192],
        ['name' => 'Worker Scope', 'type' => 'frp', 'password' => bcrypt('password'), 'is_active' => 1]
    );
    $worker->update(['senior_id' => $boss->id]);

    $otherWorker = User::firstOrCreate(
        ['phone' => 998900000193],
        ['name' => 'Other Worker Scope', 'type' => 'frp', 'password' => bcrypt('password'), 'is_active' => 1]
    );
    $otherWorker->update(['senior_id' => $boss->id]);

    $type = DocumentType::create([
        'code' => 'TST-SEQ',
        'title' => 'Тестовый смонтированных',
        'workflow_type' => DocumentType::WORKFLOW_SEQUENTIAL,
        'requires_deputy_approval' => false,
        'is_active' => true,
    ]);

    foreach ([1 => 'frp', 2 => 'header_frp', 3 => 'buxgalter'] as $ordering => $role) {
        DocumentPriorityConfig::create([
            'type_id' => $type->id,
            'ordering' => $ordering,
            'user_role' => $role,
        ]);
    }

    return ['type' => $type, 'boss' => $boss, 'worker' => $worker, 'otherWorker' => $otherWorker];
}

/**
 * Yuborilgan (is_draft=0) va header_frp tasdig'ini kutayotgan akt.
 */
function makeSentDocument(array $fx, User $author, int $status = 2): Documents
{
    $document = Documents::create([
        'user_id' => $author->id,
        'author_id' => $author->id,
        'number' => '2026/'.rand(10000, 99999),
        'type' => $fx['type']->id,
        'date_order' => date('Y-m-d'),
        'status' => 1,
        'is_draft' => 1,
    ]);

    (new DocumentPriorityService)->createPriority($document->id, $document->type, $author->type);

    $document->update(['is_draft' => 0, 'status' => $status]);

    return $document->fresh();
}

test('ketma-ket workflow akti boshliq dashboardida tasdiq kutayotganlar orasida ko\'rinadi', function () {
    $fx = createScopeFixtures();
    $document = makeSentDocument($fx, $fx['worker']);

    // Bosqich rol bo'yicha yaratiladi — user_id to'ldirilmaydi.
    $priority = DocumentPriority::where('document_id', $document->id)->where('ordering', 2)->first();
    expect($priority->user_role)->toBe('header_frp');
    expect($priority->user_id)->toBeNull();

    $stats = (new DashboardService)->getStatsByRole($fx['boss']);

    expect($stats['awaiting_approval']['count'])->toBe(1);
    expect(collect($stats['awaiting_approval']['documents'])->pluck('id'))->toContain($document->id);
});

test('hujjat boshqa bosqichda turganda tasdiq kutayotganlar orasida bo\'lmaydi', function () {
    $fx = createScopeFixtures();
    // status=1 — hali frp bosqichida, boshliqqa yetib kelmagan
    $document = makeSentDocument($fx, $fx['worker'], status: 1);

    $stats = (new DashboardService)->getStatsByRole($fx['boss']);

    expect($stats['awaiting_approval']['count'])->toBe(0);
    expect(collect($stats['awaiting_approval']['documents'])->pluck('id'))->not->toContain($document->id);
});

test('scope=mine faqat foydalanuvchining o\'z aktlarini qaytaradi', function () {
    $fx = createScopeFixtures();
    $ownDocument = makeSentDocument($fx, $fx['boss']);
    $incomingDocument = makeSentDocument($fx, $fx['worker']);

    $this->actingAs($fx['boss']);

    $ids = (new DocumentService)->list(new Request(['scope' => 'mine']), 'sent')->pluck('id');

    expect($ids)->toContain($ownDocument->id);
    expect($ids)->not->toContain($incomingDocument->id);
});

test('scope=incoming da boshliqning o\'z aktlari ko\'rinmaydi', function () {
    $fx = createScopeFixtures();
    $ownDocument = makeSentDocument($fx, $fx['boss']);
    $incomingDocument = makeSentDocument($fx, $fx['worker']);

    $this->actingAs($fx['boss']);

    $ids = (new DocumentService)->list(new Request(['scope' => 'incoming']), 'sent')->pluck('id');

    expect($ids)->toContain($incomingDocument->id);
    expect($ids)->not->toContain($ownDocument->id);
});

test('scope=all ikkala guruhni ham qaytaradi', function () {
    $fx = createScopeFixtures();
    $ownDocument = makeSentDocument($fx, $fx['boss']);
    $incomingDocument = makeSentDocument($fx, $fx['worker']);

    $this->actingAs($fx['boss']);

    $ids = (new DocumentService)->list(new Request(['scope' => 'all']), 'sent')->pluck('id');

    expect($ids)->toContain($ownDocument->id);
    expect($ids)->toContain($incomingDocument->id);
});

test('author filtri kelgan aktlarni muallif bo\'yicha toraytiradi', function () {
    $fx = createScopeFixtures();
    $fromWorker = makeSentDocument($fx, $fx['worker']);
    $fromOtherWorker = makeSentDocument($fx, $fx['otherWorker']);

    $this->actingAs($fx['boss']);

    $ids = (new DocumentService)->list(
        new Request(['scope' => 'incoming', 'author' => $fx['worker']->id]),
        'sent'
    )->pluck('id');

    expect($ids)->toContain($fromWorker->id);
    expect($ids)->not->toContain($fromOtherWorker->id);
});

test('ro\'yxatda muallif ma\'lumoti yuklanadi', function () {
    $fx = createScopeFixtures();
    makeSentDocument($fx, $fx['worker']);

    $this->actingAs($fx['boss']);

    $document = (new DocumentService)->list(new Request(['scope' => 'incoming']), 'sent')->first();

    expect($document->author)->not->toBeNull();
    expect($document->author->name)->toBe('Worker Scope');
});

test('oddiy ishchida qamrov filtri ko\'rsatilmaydi', function () {
    $fx = createScopeFixtures();
    makeSentDocument($fx, $fx['worker']);

    $this->actingAs($fx['worker']);

    // Ishchida faqat o'z aktlari bor — segment filtri ma'nosiz
    expect((new DocumentService)->availableScopes())->toBe(['mine']);
});

test('boshliqda ikkala qamrov ham mavjud va sukut bo\'yicha «Входящие» tanlanadi', function () {
    $fx = createScopeFixtures();
    makeSentDocument($fx, $fx['boss']);
    makeSentDocument($fx, $fx['worker']);

    $this->actingAs($fx['boss']);

    $service = new DocumentService;

    expect($service->availableScopes())->toBe(['mine', 'incoming', 'all']);
    expect($service->resolveScope(null))->toBe('incoming');
    expect($service->resolveScope('mine'))->toBe('mine');
    // Ruxsat etilmagan qiymat default'ga qaytadi
    expect($service->resolveScope('everything'))->toBe('incoming');
});

test('o\'chirilgan hujjat turida akt yaratib bo\'lmaydi', function () {
    $fx = createScopeFixtures();

    $disabledType = DocumentType::create([
        'code' => 'TST-OFF',
        'title' => 'Тестовый приём-передача',
        'workflow_type' => DocumentType::WORKFLOW_DIRECT,
        'requires_deputy_approval' => false,
        'is_active' => false,
    ]);

    $this->actingAs($fx['worker']);

    $payload = [
        'number' => '2026/99999',
        'document_type_id' => $disabledType->id,
        'products' => [[
            'product_name' => 'Тестовый товар',
            'measure' => 'шт.',
            'quantity' => 1,
            'amount' => 1000,
        ]],
    ];

    $this->post(route('documents.store'), $payload)
        ->assertSessionHasErrors('document_type_id');

    // Amaldagi tur bilan bir xil so'rov shu tekshiruvdan o'tadi
    $this->post(route('documents.store'), [...$payload, 'document_type_id' => $fx['type']->id])
        ->assertSessionDoesntHaveErrors('document_type_id');
});

test('o\'chirilgan tur АКТ ro\'yxati filtrida ko\'rsatilmaydi', function () {
    $fx = createScopeFixtures();

    DocumentType::create([
        'code' => 'TST-OFF',
        'title' => 'Тестовый приём-передача',
        'workflow_type' => DocumentType::WORKFLOW_DIRECT,
        'requires_deputy_approval' => false,
        'is_active' => false,
    ]);

    $this->actingAs($fx['boss']);

    $this->get('/documents/sent')->assertInertia(fn ($page) => $page
        ->component('documents')
        ->where('documentTypes', fn ($types) => collect($types)->pluck('title')->doesntContain('Тестовый приём-передача'))
    );
});
