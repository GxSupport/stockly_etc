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
        // Add 'assigned' role for direct workflow
        UserRoles::firstOrCreate(
            ['title' => 'assigned'],
            [
                'title' => 'assigned',
                'name' => 'Назначенный сотрудник',
                'is_active' => true,
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        UserRoles::where('title', 'assigned')->delete();
    }
};
