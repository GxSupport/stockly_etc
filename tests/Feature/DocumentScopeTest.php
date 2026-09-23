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

    foreach ([998900000191, 998900000192, 998900000193, 998900000194] as $phone) {
        User::where('phone', $phone)->delete();
    }
}

/**
 * Ketma-ket workflow: frp(1) → header_frp(2) → buxgalter(3).
 * Aynan shu zanjirda header_frp bosqichi user_id siz yaratiladi.
 *
 * @return array{type: DocumentType, boss: User, worker: User, otherWorker: User, accountant: User}
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

    $accountant = User::firstOrCreate(
        ['phone' => 998900000194],
        ['name' => 'Accountant Scope', 'type' => 'buxgalter', 'password' => bcrypt('password'), 'is_active' => 1]
    );

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

    return ['type' => $type, 'boss' => $boss, 'worker' => $worker, 'otherWorker' => $otherWorker, 'accountant' => $accountant];
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

// ---------- Issue #31: «Входящие» barcha tasdiqlovchi rollarda, faqat hozir kutayotganlar ----------

test('buxgalter hujjat yaratmasa ham «Входящие» va «Все» qamrovlariga ega, «Мои» yo\'q', function () {
    $fx = createScopeFixtures();

    $this->actingAs($fx['accountant']);
    $service = new DocumentService;

    expect($service->availableScopes())->toBe(['incoming', 'all']);
    // Kutayotgan hujjat yo\'q — sukut bo\'yicha «Все»
    expect($service->resolveScope(null))->toBe('all');
    expect($service->resolveScope('mine'))->toBe('all');

    // Buxgalter bosqichiga (3) yetgan akt — endi sukut bo\'yicha «Входящие»
    makeSentDocument($fx, $fx['worker'], status: 3);
    expect((new DocumentService)->resolveScope(null))->toBe('incoming');
});

test('«Входящие» da faqat hozir shu foydalanuvchi tasdig\'ini kutayotganlar, o\'tib ketganlari «Все» da', function () {
    $fx = createScopeFixtures();
    $awaiting = makeSentDocument($fx, $fx['worker'], status: 2);
    $passed = makeSentDocument($fx, $fx['otherWorker'], status: 3);
    DocumentPriority::where('document_id', $passed->id)->where('ordering', 2)->update(['is_success' => true, 'user_id' => $fx['boss']->id]);

    $this->actingAs($fx['boss']);
    $service = new DocumentService;

    $incoming = $service->list(new Request(['scope' => 'incoming']), 'sent')->pluck('id');
    expect($incoming)->toContain($awaiting->id);
    expect($incoming)->not->toContain($passed->id);
    expect($service->incomingCount())->toBe(1);

    $all = (new DocumentService)->list(new Request(['scope' => 'all']), 'sent')->pluck('id');
    expect($all)->toContain($awaiting->id);
    expect($all)->toContain($passed->id);
});

test('«Входящие» oxirgi kelgan akt tepada tartiblanadi', function () {
    $fx = createScopeFixtures();
    $older = makeSentDocument($fx, $fx['worker'], status: 2);
    $newer = makeSentDocument($fx, $fx['otherWorker'], status: 2);
    Documents::whereKey($older->id)->update(['created_at' => now()->subDay(), 'updated_at' => now()->addMinute()]);
    Documents::whereKey($newer->id)->update(['created_at' => now(), 'updated_at' => now()->subHour()]);

    $this->actingAs($fx['boss']);

    $ids = (new DocumentService)->list(new Request(['scope' => 'incoming']), 'sent')->pluck('id')->values();

    expect($ids->search($older->id))->toBeLessThan($ids->search($newer->id));
});

test('oddiy ishchida «Входящие» qamrovi hech qachon bo\'lmaydi', function () {
    $fx = createScopeFixtures();
    makeSentDocument($fx, $fx['worker']);

    $this->actingAs($fx['worker']);

    expect((new DocumentService)->availableScopes())->toBe(['mine']);
    expect((new DocumentService)->resolveScope('incoming'))->toBe('mine');
});

test('dashboard «Ожидают утверждения» soni «Входящие» ro\'yxati bilan mos keladi', function () {
    $fx = createScopeFixtures();
    makeSentDocument($fx, $fx['worker'], status: 2);
    makeSentDocument($fx, $fx['otherWorker'], status: 2);
    makeSentDocument($fx, $fx['boss'], status: 2); // o\'z akti — sanalmaydi

    $this->actingAs($fx['boss']);

    $stats = (new DashboardService)->getStatsByRole($fx['boss']);
    $listCount = (new DocumentService)->list(new Request(['scope' => 'incoming']), 'sent')->total();

    expect($stats['awaiting_approval']['count'])->toBe(2);
    expect($listCount)->toBe(2);
    expect((new DocumentService)->incomingCount())->toBe(2);
});

test('«Входящие» va «Все» da tasdiq kutayotgan akt is_awaiting_me bilan belgilanadi (issue #39)', function () {
    $fx = createScopeFixtures();
    $awaiting = makeSentDocument($fx, $fx['worker'], status: 2);
    $passed = makeSentDocument($fx, $fx['otherWorker'], status: 3);
    DocumentPriority::where('document_id', $passed->id)->where('ordering', 2)->update(['is_success' => true, 'user_id' => $fx['boss']->id]);
    $own = makeSentDocument($fx, $fx['boss'], status: 2);

    $this->actingAs($fx['boss']);

    $incoming = (new DocumentService)->list(new Request(['scope' => 'incoming']), 'sent')->getCollection()->keyBy('id');
    expect($incoming[$awaiting->id]->is_awaiting_me)->toBeTrue();

    $all = (new DocumentService)->list(new Request(['scope' => 'all']), 'sent')->getCollection()->keyBy('id');
    expect($all[$awaiting->id]->is_awaiting_me)->toBeTrue();
    expect($all[$passed->id]->is_awaiting_me)->toBeFalse();
    expect($all[$own->id]->is_awaiting_me)->toBeFalse();

    // «Входящие» yonidagi son ranglangan qatorlar soniga teng
    expect((new DocumentService)->incomingCount())->toBe($all->where('is_awaiting_me', true)->count());
});

test('«Мои» da is_awaiting_me har doim false (muallif o\'z aktini tasdiqlamaydi)', function () {
    $fx = createScopeFixtures();
    $own = makeSentDocument($fx, $fx['boss'], status: 2);

    $this->actingAs($fx['boss']);

    $mine = (new DocumentService)->list(new Request(['scope' => 'mine']), 'sent')->getCollection()->keyBy('id');

    expect($mine[$own->id]->is_awaiting_me)->toBeFalse();
});

test('belgisi aktni ochganda emas, faqat tasdiqlangandan keyin yo\'qoladi', function () {
    $fx = createScopeFixtures();
    $document = makeSentDocument($fx, $fx['worker'], status: 2);

    $this->actingAs($fx['boss']);

    $this->get(route('documents.show', $document->id))->assertOk();
    $afterOpen = (new DocumentService)->list(new Request(['scope' => 'all']), 'sent')->getCollection()->keyBy('id');
    expect($afterOpen[$document->id]->is_awaiting_me)->toBeTrue();

    expect((new DocumentService($document->id))->sendToNext())->toBeTrue();

    $afterApprove = (new DocumentService)->list(new Request(['scope' => 'all']), 'sent')->getCollection()->keyBy('id');
    expect($afterApprove[$document->id]->is_awaiting_me)->toBeFalse();
    expect((new DocumentService)->incomingCount())->toBe(0);
});

test('sent sahifasi is_awaiting_me belgisini Inertia prop sifatida yuboradi', function () {
    $fx = createScopeFixtures();
    $document = makeSentDocument($fx, $fx['worker'], status: 2);

    $this->actingAs($fx['boss']);

    $this->get(route('documents.index', ['status' => 'sent', 'scope' => 'incoming']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('documents')
            ->where('awaitingApprovalCount', 1)
            ->where('documents.data.0.id', $document->id)
            ->where('documents.data.0.is_awaiting_me', true));
});
