<?php

use App\Models\DocumentPriority;
use App\Models\Documents;
use App\Models\DocumentType;
use App\Models\User;
use App\Models\UserRoles;
use App\Services\DocumentPriorityService;
use App\Services\DocumentService;
use Illuminate\Http\Request;

beforeEach(function () {
    // dropForeign by name migratsiyalari SQLite'da ishlamaydi, shuning uchun MySQL
    config([
        'database.default' => 'mysql',
        'database.connections.mysql.database' => 'stockly',
    ]);

    cleanupTransferApprovalFixtures();
});

afterEach(function () {
    cleanupTransferApprovalFixtures();
});

function cleanupTransferApprovalFixtures(): void
{
    $type = DocumentType::where('code', 'TST-TRF')->first();
    if ($type) {
        $documentIds = Documents::where('type', $type->id)->pluck('id');
        DocumentPriority::whereIn('document_id', $documentIds)->delete();
        Documents::whereIn('id', $documentIds)->delete();
        $type->delete();
    }

    foreach ([998900000091, 998900000092, 998900000093] as $phone) {
        User::where('phone', $phone)->delete();
    }
}

/**
 * @return array{type: DocumentType, boss: User, worker: User, receiver: User}
 */
function createTransferFixtures(): array
{
    foreach (['frp', 'header_frp', 'buxgalter', 'assigned'] as $role) {
        UserRoles::firstOrCreate(['title' => $role], ['name' => $role, 'is_active' => 1]);
    }

    $boss = User::firstOrCreate(
        ['phone' => 998900000091],
        ['name' => 'Boss Transfer', 'type' => 'header_frp', 'password' => bcrypt('password'), 'is_active' => 1]
    );

    $worker = User::firstOrCreate(
        ['phone' => 998900000092],
        ['name' => 'Worker Transfer', 'type' => 'frp', 'password' => bcrypt('password'), 'is_active' => 1, 'senior_id' => $boss->id]
    );
    $worker->update(['senior_id' => $boss->id]);

    $receiver = User::firstOrCreate(
        ['phone' => 998900000093],
        ['name' => 'Receiver Transfer', 'type' => 'frp', 'password' => bcrypt('password'), 'is_active' => 1]
    );

    $type = DocumentType::create([
        'code' => 'TST-TRF',
        'title' => 'Тестовый приём-передача',
        'workflow_type' => DocumentType::WORKFLOW_DIRECT,
        'requires_deputy_approval' => false,
    ]);

    return ['type' => $type, 'boss' => $boss, 'worker' => $worker, 'receiver' => $receiver];
}

function makeTransferDocument(array $fx, User $creator): Documents
{
    return Documents::create([
        'user_id' => $creator->id,
        'number' => '2026/'.rand(10000, 99999),
        'type' => $fx['type']->id,
        'date_order' => date('Y-m-d'),
        'status' => 1,
        'is_draft' => 1,
        'assigned_user_id' => $fx['receiver']->id,
    ]);
}

test('frp yaratgan aktda boshliq (senior) bosqichi qo\'shiladi', function () {
    $fx = createTransferFixtures();
    $document = makeTransferDocument($fx, $fx['worker']);

    (new DocumentPriorityService)->createPriority($document->id, $document->type, 'frp');

    $priorities = DocumentPriority::where('document_id', $document->id)->orderBy('ordering')->get();

    expect($priorities->pluck('user_role')->all())->toBe(['frp', 'header_frp', 'assigned', 'buxgalter']);
    expect($priorities->pluck('ordering')->all())->toBe([1, 2, 3, 4]);

    // Boshliq bosqichi aynan yaratuvchining senior_id'siga bog'langan
    $boss = $priorities->firstWhere('user_role', 'header_frp');
    expect($boss->user_id)->toBe($fx['boss']->id);
});

test('header_frp o\'zi yaratsa boshliq bosqichi qo\'shilmaydi', function () {
    $fx = createTransferFixtures();
    // Boshliq o'zi yaratadi
    $document = makeTransferDocument($fx, $fx['boss']);

    (new DocumentPriorityService)->createPriority($document->id, $document->type, 'header_frp');

    $priorities = DocumentPriority::where('document_id', $document->id)->orderBy('ordering')->get();

    expect($priorities->pluck('user_role')->all())->toBe(['header_frp', 'assigned', 'buxgalter']);
    expect($priorities->pluck('ordering')->all())->toBe([1, 2, 3]);
});

test('senior_id yo\'q frp yaratsa boshliq bosqichi qo\'shilmaydi', function () {
    $fx = createTransferFixtures();
    // receiver — senior_id yo'q frp
    $document = makeTransferDocument($fx, $fx['receiver']);

    (new DocumentPriorityService)->createPriority($document->id, $document->type, 'frp');

    $priorities = DocumentPriority::where('document_id', $document->id)->orderBy('ordering')->get();

    expect($priorities->pluck('user_role')->all())->toBe(['frp', 'assigned', 'buxgalter']);
    expect($priorities->pluck('ordering')->all())->toBe([1, 2, 3]);
});

test('qabul qiluvchi aktni boshliq tasdiqlamaguncha ko\'rmaydi', function () {
    $fx = createTransferFixtures();
    $document = makeTransferDocument($fx, $fx['worker']);
    (new DocumentPriorityService)->createPriority($document->id, $document->type, 'frp');

    // Akt yuborildi, hozir boshliq bosqichida (status=2, assigned esa ordering=3)
    $document->update(['is_draft' => 0, 'status' => 2]);

    $this->actingAs($fx['receiver']);
    $incomingBefore = (new DocumentService)->list(new Request, 'incoming');
    expect($incomingBefore->pluck('id')->contains($document->id))->toBeFalse();

    // Boshliq tasdiqladi — status qabul qiluvchi bosqichiga o'tdi (ordering=3)
    $document->update(['status' => 3]);

    $incomingAfter = (new DocumentService)->list(new Request, 'incoming');
    expect($incomingAfter->pluck('id')->contains($document->id))->toBeTrue();
});
