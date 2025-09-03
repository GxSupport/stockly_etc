<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('document_send_telegram', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('document_id');
            $table->unsignedBigInteger('chat_id');
            $table->unsignedBigInteger('message_id')->nullable();
            $table->string('message');
            $table->string('token')->nullable();
            $table->string('code',6);
            $table->dateTime('expire');
            $table->enum('type',['confirm','cancel']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('document_send_telegram');
    }
};
