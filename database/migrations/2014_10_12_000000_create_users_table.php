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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('password');
            //frp - financially responsible persons
            $table->enum('type',['frp','header_frp','director','buxgalter','admin']);
            $table->bigInteger('phone')->unique();
            $table->string('chat_id',36)->comment('ID Telegram бота')
                ->nullable(true);
            $table->unsignedBigInteger('senior_id')->nullable(true)
                ->comment('ID руководителя');
            $table->foreign('senior_id')->references('id')->on('users')->onDelete('cascade');
            $table->rememberToken();
            $table->tinyInteger('is_active')->default(1);
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('phone')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
