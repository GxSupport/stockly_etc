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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->tinyInteger('type')->comment('1-смонтированных,2-демонтажа,3-списания');
            $table->string('subscriber_title');
            $table->string('address');
            $table->date('date_order');
            $table->unsignedBigInteger('in_charge');
            $table->tinyInteger('status')->default(0);
            $table->tinyInteger('level')->default(0);
            $table->tinyInteger('is_returned')->default(0);
            $table->decimal('total_amount',16)->nullable(true);
            $table->timestamps();
            $table->foreign('in_charge')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
        Schema::create('document_products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('document_id');
            $table->unsignedBigInteger('user_id');
            $table->string('title');
            $table->string('measure',16);
            $table->decimal('quantity',16);
            $table->decimal('amount',16);
            $table->string('note');
            $table->timestamps();
            $table->foreign('user_id')
                ->references('id')->on('users')
                ->onDelete('cascade');
            $table->foreign('document_id')->references('id')
                ->on('documents')->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('documents');
        Schema::dropIfExists('documents_purchase');
    }
};
