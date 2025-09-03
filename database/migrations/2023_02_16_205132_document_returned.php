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
        Schema::create('document_returned',function (Blueprint $table){
            $table->id();
            $table->unsignedBigInteger('document_id')->index();
            $table->unsignedBigInteger('from_id')
                ->comment('Kimdan');
            $table->unsignedBigInteger('to_id')->comment('kimga');
            $table->text('note');
            $table->boolean('is_solved')->default(false);
            $table->boolean('is_delete')->default(false);
            $table->timestamps();
            $table->foreign('document_id')->references('id')
                ->on('documents')->onDelete('cascade');
            $table->foreign('from_id')->references('id')
                ->on('users')->onDelete('cascade');
            $table->foreign('to_id')->references('id')
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
        //
    }
};
