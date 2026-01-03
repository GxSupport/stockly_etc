<?php

use App\Models\UserRoles;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add deputy_director role to user_roles table
        UserRoles::firstOrCreate(
            ['title' => 'deputy_director'],
            [
                'title' => 'deputy_director',
                'name' => 'Заместитель директора',
                'is_active' => true,
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        UserRoles::where('title', 'deputy_director')->delete();
    }
};
