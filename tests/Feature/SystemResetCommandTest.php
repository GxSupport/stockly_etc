<?php

use App\Models\DocumentPriority;
use App\Models\DocumentPriorityConfig;
use App\Models\Documents;
use App\Models\DocumentType;
use App\Models\User;
use App\Models\UserRoles;
use App\Models\Warehouse;
use App\Services\DocumentPriorityService;
use Illuminate\Support\Facades\DB;

/**
 * system:reset — aktlar va loglar o'chadi, ma'lumotnomalar (users, warehouse, ...) qoladi.
 */
beforeEach(function () {
    config([
        'database.default' => 'mysql',
        'database.connections.mysql.database' => 'stockly',
    ]);

    cleanupResetFixtures();
});

afterEach(function () {
    cleanupResetFixtures();
});

function cleanupResetFixtures(): void
{
    $type = DocumentType::where('code', 'TST-RST')->first();
    if ($type) {
        $ids = Documents::where('type', $type->id)->pluck('id');
        DocumentPriority::whereIn('document_id', $ids)->delete();
        Documents::whereIn('id', $ids)->delete();
        DocumentPriorityConfig::where('type_id', $type->id)->delete();
        $type->delete();
    }
    DB::table('log_sms')->where('text', 'reset test')->delete();
    User::where('phone', 998900000501)->delete();
    Warehouse::where('code', 'TRST01')->delete();
}

/**
 * @return array{user: User, document: Documents, warehouse: Warehouse}
 */
function createResetFixtures(): array
{
    UserRoles::firstOrCreate(['title' => 'frp'], ['name' => 'frp', 'is_active' => 1]);
    $user = User::firstOrCreate(
        ['phone' => 998900000501],
        ['name' => 'Reset User', 'type' => 'frp', 'password' => bcrypt('password'), 'is_active' => 1]
    );
    $warehouse = Warehouse::create(['code' => 'TRST01', 'title' => 'Склад RESET', 'type' => 1, 'is_active' => true]);
    $type = DocumentType::create([
        'code' => 'TST-RST',
        'title' => 'Тестовый reset',
        'workflow_type' => DocumentType::WORKFLOW_SEQUENTIAL,
        'requires_deputy_approval' => false,
        'is_active' => true,
    ]);
    DocumentPriorityConfig::create(['type_id' => $type->id, 'ordering' => 1, 'user_role' => 'frp']);

    $document = Documents::create([
        'user_id' => $user->id,
        'author_id' => $user->id,
        'number' => '2026/'.rand(10000, 99999),
        'type' => $type->id,
        'date_order' => date('Y-m-d'),
        'status' => 1,
        'is_draft' => 1,
    ]);
    (new DocumentPriorityService)->createPriority($document->id, $document->type, $user->type);
    DB::table('log_sms')->insert(['phone' => '998900000501', 'text' => 'reset test', 'created_at' => now(), 'updated_at' => now()]);

    return ['user' => $user, 'document' => $document, 'warehouse' => $warehouse];
}

test('--force siz hech narsa o\'chirilmaydi, faqat ro\'yxat ko\'rsatiladi', function () {
    $fx = createResetFixtures();

    $this->artisan('system:reset')
        ->expectsOutputToContain('faqat ko\'rish rejimi')
        ->assertSuccessful();

    expect(Documents::whereKey($fx['document']->id)->exists())->toBeTrue();
    expect(DB::table('log_sms')->where('text', 'reset test')->exists())->toBeTrue();
});

test('--force bilan aktlar va loglar o\'chadi, ma\'lumotnomalar qoladi', function () {
    $fx = createResetFixtures();
    $usersBefore = User::count();
    $warehousesBefore = Warehouse::count();
    $typesBefore = DocumentType::count();

    $this->artisan('system:reset --force')->assertSuccessful();

    expect(Documents::count())->toBe(0);
    expect(DocumentPriority::count())->toBe(0);
    expect(DB::table('log_sms')->count())->toBe(0);

    expect(User::count())->toBe($usersBefore);
    expect(Warehouse::count())->toBe($warehousesBefore);
    expect(DocumentType::count())->toBe($typesBefore);
    expect(DocumentPriorityConfig::where('type_id', DocumentType::where('code', 'TST-RST')->value('id'))->exists())->toBeTrue();
    expect(User::whereKey($fx['user']->id)->exists())->toBeTrue();
    expect(Warehouse::whereKey($fx['warehouse']->id)->exists())->toBeTrue();
});

test('--keep-logs bilan loglar saqlanadi, aktlar o\'chadi', function () {
    $fx = createResetFixtures();

    $this->artisan('system:reset --force --keep-logs')->assertSuccessful();

    expect(Documents::whereKey($fx['document']->id)->exists())->toBeFalse();
    expect(DB::table('log_sms')->where('text', 'reset test')->exists())->toBeTrue();
});
