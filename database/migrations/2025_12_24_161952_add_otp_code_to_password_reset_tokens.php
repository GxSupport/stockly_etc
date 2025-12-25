<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Jadval mavjud bo'lmasa, avval yaratamiz
        if (! Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('phone')->primary();
                $table->string('token');
                $table->string('otp_code', 6)->nullable();
                $table->timestamp('created_at')->nullable();
            });
        } else {
            Schema::table('password_reset_tokens', function (Blueprint $table) {
                $table->string('otp_code', 6)->nullable()->after('token');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('password_reset_tokens')) {
            if (Schema::hasColumn('password_reset_tokens', 'otp_code')) {
                Schema::table('password_reset_tokens', function (Blueprint $table) {
                    $table->dropColumn('otp_code');
                });
            }
        }
    }
};
