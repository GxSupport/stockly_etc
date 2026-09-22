<?php

use App\Models\DocumentPriority;
use App\Models\DocumentPriorityConfig;
use App\Models\DocumentReturned;
use App\Models\Documents;
use App\Models\DocumentType;
use App\Models\User;
use App\Models\UserRoles;
use App\Models\UserWarehouse;
use App\Models\Warehouse;
use App\Services\DocumentService;
use Illuminate\Support\Facades\Http;

/**
 * Issue #32: qaytarilgan akt haqida ogohlantirish — «Возврат» tabidagi raqam, o'qilgan/o'qilmagan holati,
 * rad etish sababi akt sahifasida, qayta yuborilganda «Возврат» dan chiqishi.
 */
beforeEach(function () {
    config([
        'database.default' => 'mysql',
        'database.connections.mysql.database' => 'stockly',
    ]);

    cleanupReturnedFixtures();
});

afterEach(function () {
    cleanupReturnedFixtures();
});

const RETURNED_PHONES = ['frp' => 998900000401, 'boss' => 998900000402, 'buxgalter' => 998900000403];

function cleanupReturnedFixtures(): void
{
    $type = DocumentType::where('code', 'TST-RET')->first();
    if ($type) {
        $documentIds = Documents::where('type', $type->id)->pluck('id');
        DocumentReturned::whereIn('document_id', $documentIds)->delete();
        DocumentPriority::whereIn('document_id', $documentIds)->delete();
        Documents::whereIn('id', $documentIds)->delete();
        DocumentPriorityConfig::where('type_id', $type->id)->delete();
        $type->delete();
    }
    $userIds = User::whereIn('phone', RETURNED_PHONES)->pluck('id');
    UserWarehouse::whereIn('user_id', $userIds)->delete();
    User::whereIn('id', $userIds)->delete();
    Warehouse::where('code', 'WH-RET-1')->delete();
}

/**
 * @return array{type: DocumentType, frp: User, boss: User}
 */
function createReturnedFixtures(): array
{
    foreach (['frp', 'header_frp', 'buxgalter'] as $role) {
        UserRoles::firstOrCreate(['title' => $role], ['name' => $role, 'is_active' => 1]);
    }

    $frp = User::firstOrCreate(['phone' => RETURNED_PHONES['frp']], ['name' => 'Returned Frp', 'type' => 'frp', 'password' => bcrypt('password'), 'is_active' => 1]);
    $boss = User::firstOrCreate(['phone' => RETURNED_PHONES['boss']], ['name' => 'Returned Boss', 'type' => 'header_frp', 'password' => bcrypt('password'), 'is_active' => 1]);

    $type = DocumentType::create([
        'code' => 'TST-RET',
        'title' => 'Тестовый возврат',
        'workflow_type' => DocumentType::WORKFLOW_SEQUENTIAL,
        'requires_deputy_approval' => false,
        'is_active' => true,
    ]);

    foreach ([1 => 'frp', 2 => 'header_frp', 3 => 'buxgalter'] as $ordering => $role) {
        DocumentPriorityConfig::create(['type_id' => $type->id, 'ordering' => $ordering, 'user_role' => $role]);
    }

    return ['type' => $type, 'frp' => $frp, 'boss' => $boss];
}

function returnedPayload(DocumentType $type, string $number): array
{
    return [
        'number' => $number,
        'document_type_id' => $type->id,
        'main_tool' => 'Тестовое место',
        'products' => [['product_name' => 'Кабель UTP', 'measure' => 'м', 'quantity' => 2, 'amount' => 100]],
    ];
}

/**
 * frp yaratadi → yuboradi → header_frp rad etadi. Qaytarilgan hujjat qaytariladi.
 */
function createRejectedDocument(array $fx, string $number = '2026/32001'): Documents
{
    test()->actingAs($fx['frp']);
    test()->post(route('documents.store'), returnedPayload($fx['type'], $number))->assertSessionMissing('error');
    $document = Documents::where('number', $number)->where('type', $fx['type']->id)->firstOrFail();
    test()->postJson(route('documents.send-to-next', $document->id))->assertOk();

    test()->actingAs($fx['boss']);
    (new DocumentService($document->id))->rejectDocument('Не хватает данных по товару');

    return $document->fresh();
}

test('a rejected act is counted as unread for its author and shown in the shared props and the return list', function () {
    $fx = createReturnedFixtures();
    $document = createRejectedDocument($fx);

    expect((int) $document->is_returned)->toBe(1);
    expect($document->user_id)->toBe($fx['frp']->id);
    expect(DocumentService::unreadReturnedCount($fx['frp']))->toBe(1);
    expect(DocumentService::unreadReturnedCount($fx['boss']))->toBe(0);

    $this->actingAs($fx['frp']);
    $this->get(route('documents.index'))->assertInertia(fn ($page) => $page->where('unreadReturnedCount', 1));

    $this->get(route('documents.index', ['status' => 'return']))
        ->assertInertia(fn ($page) => $page
            ->where('unreadReturnedCount', 1)
            ->where('documents.data', fn ($rows) => collect($rows)->firstWhere('id', $document->id)['unread_returns_count'] === 1));
});

test('opening the act marks it read only for the author and shows the rejection note', function () {
    $fx = createReturnedFixtures();
    $document = createRejectedDocument($fx);

    // Rad etgan boshliq ochsa — muallif uchun hali o'qilmagan
    $this->actingAs($fx['boss'])->get(route('documents.show', $document->id))->assertOk();
    expect(DocumentService::unreadReturnedCount($fx['frp']))->toBe(1);

    $this->actingAs($fx['frp']);
    $this->get(route('documents.show', $document->id))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('document.is_returned', 1)
            ->where('document.notes.0.note', 'Не хватает данных по товару')
            ->where('document.notes.0.from_info.name', 'Returned Boss'));

    expect(DocumentService::unreadReturnedCount($fx['frp']))->toBe(0);
    expect((int) DocumentReturned::where('document_id', $document->id)->value('is_solved'))->toBe(1);

    $this->get(route('documents.index', ['status' => 'return']))
        ->assertInertia(fn ($page) => $page
            ->where('unreadReturnedCount', 0)
            ->where('documents.data', fn ($rows) => collect($rows)->firstWhere('id', $document->id)['unread_returns_count'] === 0));
});

test('opening the edit page also marks the return as read', function () {
    $fx = createReturnedFixtures();
    $document = createRejectedDocument($fx);

    Http::fake(['*' => Http::response([])]);
    $warehouse = Warehouse::create(['code' => 'WH-RET-1', 'title' => 'Склад RET', 'is_active' => 1]);
    UserWarehouse::create(['user_id' => $fx['frp']->id, 'warehouse_id' => $warehouse->id]);

    $this->actingAs($fx['frp'])->get(route('documents.edit', $document->id))->assertOk();

    expect(DocumentService::unreadReturnedCount($fx['frp']))->toBe(0);
});

test('resending a returned act clears is_returned, resolves the return record and reaches the boss again', function () {
    $fx = createReturnedFixtures();
    $document = createRejectedDocument($fx);

    $this->actingAs($fx['frp']);
    $this->put(route('documents.update', $document->id), returnedPayload($fx['type'], '2026/32001'))
        ->assertRedirect(route('documents.index'))
        ->assertSessionMissing('error');
    $this->postJson(route('documents.send-to-next', $document->id))->assertOk();

    $document->refresh();
    expect((int) $document->is_returned)->toBe(0);
    expect((int) $document->is_draft)->toBe(0);
    expect($document->status)->toBe(2);
    // Tahrirlashda priority qatorlari qayta yaratiladi va qaytarish yozuvi cascade bilan o'chadi;
    // qolgan bo'lsa ham hal qilingan bo'lishi shart — o'qilmagan qaytarish qolmaydi
    expect(DocumentReturned::where('document_id', $document->id)->where('is_solved', 0)->exists())->toBeFalse();
    expect(DocumentService::unreadReturnedCount($fx['frp']))->toBe(0);
    expect(DocumentPriority::query()->awaitingApprovalFor($fx['boss'])->where('document_id', $document->id)->count())->toBe(1);

    $this->get(route('documents.index', ['status' => 'return']))
        ->assertInertia(fn ($page) => $page->where('documents.data', fn ($rows) => collect($rows)->pluck('id')->doesntContain($document->id)));
});

test('unread count is zero for a guest-free user with no returns', function () {
    $fx = createReturnedFixtures();

    expect(DocumentService::unreadReturnedCount($fx['frp']))->toBe(0);
    $this->actingAs($fx['frp'])->get(route('documents.index'))->assertInertia(fn ($page) => $page->where('unreadReturnedCount', 0));
});
