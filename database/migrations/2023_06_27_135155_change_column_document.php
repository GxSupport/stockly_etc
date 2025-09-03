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
        Schema::table('document_products',function (Blueprint $table){
            $table->string('measure')->nullable()->change();
            $table->decimal('amount',16)->nullable()->change();
            $table->string('nomenclature')->nullable()->change();
            $table->string('note')->nullable()->change();
            $table->string('main_tool')->nullable()->after('nomenclature');
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
