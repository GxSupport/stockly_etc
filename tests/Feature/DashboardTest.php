<?php

use App\Models\User;

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
        ->has('stats.documents')
        ->has('stats.recent_users')
        ->has('stats.system')
    );
});

test('director dashboard returns correct stats structure', function () {
    $user = User::query()->where('type', 'director')->first();

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('userRole', 'director')
        ->has('stats.awaiting_approval')
        ->has('stats.documents_total')
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
        ->has('stats.recently_processed')
        ->has('stats.returned_count')
    );
});

test('buxgalter dashboard returns correct stats structure', function () {
    $user = User::query()->where('type', 'buxgalter')->first();

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('userRole', 'buxgalter')
        ->has('stats.awaiting_approval')
        ->has('stats.total_processed')
        ->has('stats.documents_by_type')
        ->has('stats.financial_summary')
        ->has('stats.recently_finished')
    );
});

test('header frp dashboard returns correct stats structure', function () {
    $user = User::query()->where('type', 'header_frp')->first();

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('userRole', 'header_frp')
        ->has('stats.team_documents')
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
        ->has('stats.own_documents')
        ->has('stats.recent_documents')
        ->has('stats.pending_returns')
    );
});
