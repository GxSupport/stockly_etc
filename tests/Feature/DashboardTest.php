<?php

use App\Models\Documents;
use App\Models\DocumentType;
use App\Models\User;
use App\Services\DashboardService;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    // Use MySQL connection for these tests since migrations use dropForeign by name (unsupported in SQLite)
    config([
        'database.default' => 'mysql',
        'database.connections.mysql.database' => 'stockly',
    ]);
});

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::query()->first();

    $this->actingAs($user);

    $this->get(route('dashboard'))->assertOk();
});

test('dashboard returns stats and userRole props', function () {
    $user = User::query()->where('type', 'frp')->first();

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('stats')
        ->has('userRole')
    );
});

test('admin dashboard returns correct stats structure', function () {
    $user = User::query()->where('type', 'admin')->first();

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('userRole', 'admin')
        ->has('stats.users')
        ->has('stats.users_by_role')
        ->has('stats.users.new_this_month')
        ->has('stats.documents')
        ->has('stats.documents.this_month')
        ->has('stats.documents_by_type')
        ->has('stats.recent_users')
        ->has('stats.system')
    );
});

test('director dashboard returns correct stats structure', function () {
    $user = User::query()->where('type', 'director')->first();

    if (! $user) {
        $this->markTestSkipped('No director user found in database');
    }

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('userRole', 'director')
        ->has('roleName')
        ->has('stats.awaiting_approval')
        ->has('stats.documents_total')
        ->has('stats.documents_total.this_month')
        ->has('stats.documents_status')
        ->has('stats.documents_by_type')
        ->has('stats.recently_finished')
        ->has('stats.returned_count')
    );
});

test('deputy director dashboard returns correct stats structure', function () {
    $user = User::query()->where('type', 'deputy_director')->first();

    if (! $user) {
        $this->markTestSkipped('No deputy_director user found in database');
    }

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('userRole', 'deputy_director')
        ->has('stats.awaiting_approval')
        ->has('stats.total_approved')
        ->has('stats.approved_this_month')
        ->has('stats.approved_by_type')
        ->has('stats.recently_processed')
        ->has('stats.returned_count')
    );
});

test('buxgalter dashboard returns correct stats structure', function () {
    $user = User::query()->where('type', 'buxgalter')->first();

    if (! $user) {
        $this->markTestSkipped('No buxgalter user found in database');
    }

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('userRole', 'buxgalter')
        ->has('stats.awaiting_approval')
        ->has('stats.total_processed')
        ->has('stats.documents_status')
        ->has('stats.documents_by_type')
        ->has('stats.financial_summary')
        ->has('stats.recently_finished')
    );
});

test('header frp dashboard returns correct stats structure', function () {
    $user = User::query()->where('type', 'header_frp')->first();

    if (! $user) {
        $this->markTestSkipped('No header_frp user found in database');
    }

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('userRole', 'header_frp')
        ->has('stats.team_documents.total')
        ->has('stats.awaiting_approval')
        ->has('stats.own_documents')
        ->has('stats.team_members')
    );
});

test('frp dashboard returns correct stats structure', function () {
    $user = User::query()->where('type', 'frp')->first();

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('userRole', 'frp')
        ->has('stats.own_documents.total')
        ->has('stats.documents_by_type')
        ->has('stats.recent_documents')
        ->has('stats.pending_returns')
    );
});

test('admin dashboard status breakdown and type counts match the documents table', function () {
    $user = User::query()->where('type', 'admin')->first();

    $this->actingAs($user);

    $documents = Documents::query();

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('stats.documents.total', (clone $documents)->count())
            ->where('stats.documents.draft', (clone $documents)->where('is_draft', 1)->count())
            ->where('stats.documents.sent', (clone $documents)->where('is_draft', 0)->where('is_finished', 0)->where('is_returned', 0)->count())
            ->where('stats.documents.returned', (clone $documents)->where('is_returned', 1)->count())
            ->where('stats.documents.finished', (clone $documents)->where('is_finished', 1)->count())
            ->where('stats.documents_by_type', fn ($types) => collect($types)->sum('count') === (clone $documents)->count())
        );
});

test('admin dashboard counts users created this month', function () {
    $user = User::query()->where('type', 'admin')->first();

    $this->actingAs($user);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('stats.users.new_this_month', User::query()->where('created_at', '>=', now()->startOfMonth())->count())
        );
});

test('frp and header frp dashboards group documents by status and type', function () {
    DB::connection('mysql')->beginTransaction();

    try {
        $boss = User::query()->create(['name' => 'Dashboard Boss', 'phone' => 998900000291, 'type' => 'header_frp', 'password' => bcrypt('password'), 'is_active' => 1]);
        $worker = User::query()->create(['name' => 'Dashboard Worker', 'phone' => 998900000292, 'type' => 'frp', 'password' => bcrypt('password'), 'is_active' => 1]);
        $worker->update(['senior_id' => $boss->id]);

        $installType = DocumentType::query()->create(['code' => 'TST-DASH-A', 'title' => 'Dashboard A', 'is_active' => true]);
        $removalType = DocumentType::query()->create(['code' => 'TST-DASH-B', 'title' => 'Dashboard B', 'is_active' => true]);

        $makeDocument = fn (DocumentType $type, array $state) => Documents::query()->forceCreate([
            'user_id' => $worker->id,
            'author_id' => $worker->id,
            'number' => 'DASH/'.fake()->unique()->numberBetween(10000, 99999),
            'type' => $type->id,
            'date_order' => now()->toDateString(),
            'status' => 1,
            'is_draft' => 0,
            'is_finished' => 0,
            'is_returned' => 0,
            ...$state,
        ]);

        $makeDocument($installType, ['is_draft' => 1]);
        $makeDocument($installType, []);
        $makeDocument($installType, ['is_finished' => 1]);
        $makeDocument($removalType, ['is_returned' => 1]);

        $service = app(DashboardService::class);
        $expectedBreakdown = ['total' => 4, 'draft' => 1, 'sent' => 1, 'returned' => 1, 'finished' => 1];

        $frpStats = $service->getStatsByRole($worker);

        expect($frpStats['own_documents'])->toBe($expectedBreakdown)
            ->and($frpStats['documents_by_type'])->toBe([
                ['type' => $installType->id, 'title' => 'Dashboard A', 'count' => 3],
                ['type' => $removalType->id, 'title' => 'Dashboard B', 'count' => 1],
            ]);

        $bossStats = $service->getStatsByRole($boss);

        expect($bossStats['team_documents'])->toBe($expectedBreakdown)
            ->and($bossStats['team_members']->firstWhere('id', $worker->id)->documents_count)->toBe(4);
    } finally {
        DB::connection('mysql')->rollBack();
    }
});

test('dashboard breakdown is all zeros for a user without documents', function () {
    DB::connection('mysql')->beginTransaction();

    try {
        $user = User::query()->create(['name' => 'Dashboard Empty', 'phone' => 998900000293, 'type' => 'frp', 'password' => bcrypt('password'), 'is_active' => 1]);

        $stats = app(DashboardService::class)->getStatsByRole($user);

        expect($stats['own_documents'])->toBe(['total' => 0, 'draft' => 0, 'sent' => 0, 'returned' => 0, 'finished' => 0])
            ->and($stats['documents_by_type'])->toBe([]);
    } finally {
        DB::connection('mysql')->rollBack();
    }
});
