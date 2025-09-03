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
        Schema::table('documents',function (Blueprint $t){
           $t->dropColumn('type');
        });
        Schema::table('documents',function (Blueprint $t){
            $t->unsignedBigInteger('type')
                ->after('id')
                ->nullable();
            $t->bigInteger('user_id')
                ->nullable()
                ->after('id')
                ->comment('hozirda qaysi userga biriktirilgan');
            $t->foreign('type')
                ->references('id')
                ->on('document_type')
                ->onDelete('cascade');
        });
        Schema::table('document_priority',function (Blueprint $table){
            $table->string('user_role')->after('user_id');
            $table->foreign('user_role')
                ->references('title')
                ->on('user_roles')
                ->onDelete('cascade');
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
