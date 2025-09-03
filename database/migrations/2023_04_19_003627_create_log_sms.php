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
        Schema::create('log_sms', function (Blueprint $table) {
            $table->id();
            $table->string('message_id')->nullable();
            $table->string('message_id_in')->nullable()->comment('response kelgan id');
            $table->string('phone');
            $table->string('text');
            $table->text('response')->nullable();
            $table->string('query_code')->nullable();
            $table->string('query_state')->nullable();
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
        Schema::dropIfExists('log_sms');
    }
};
