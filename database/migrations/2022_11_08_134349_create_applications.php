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
        Schema::create('document_status_log',function (Blueprint $table){
            $table->id();
            $table->tinyInteger('status');
            $table->tinyInteger('level');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('document_id');
            $table->tinyInteger('is_confirm');
            $table->timestamps();
            $table->foreign('document_id')->references('id')
                ->on('documents')->onDelete('cascade');
            $table->foreign('user_id')->references('id')
                ->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('applications');
    }
};
