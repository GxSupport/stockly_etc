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
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->string('title')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('document_type',function (Blueprint $table){
            $table->id();
            $table->string('code')->unique();
            $table->string('title');
            $table->timestamps();
        });
        Schema::create('document_priority_config', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('type_id');
            $table->unsignedInteger('ordering');
            $table->string('user_role');
            $table->text('options')->nullable();
            $table->timestamps();
            $table->unique(['type_id','user_role']);
            $table->foreign('type_id')
                ->references('id')
                ->on('document_type')
                ->onDelete('cascade');
            $table->foreign('user_role')
                ->references('title')
                ->on('user_roles')
                ->onDelete('cascade');
        });
        Schema::create('document_priority',function (Blueprint $table){
           $table->id();
           $table->unsignedBigInteger('document_id');
           $table->unsignedInteger('ordering');
           $table->unsignedBigInteger('user_id')->nullable();
           $table->boolean('is_success')->default(false);
           $table->boolean('is_active')->default(true);
           $table->timestamps();
           $table->foreign('document_id')
                ->references('id')
                ->on('documents')
                ->onDelete('cascade');
           $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
        Schema::table('documents',function (Blueprint $table){
            $table->dropForeign('documents_user_id_foreign');
            $table->dropForeign('documents_in_charge_foreign');
            $table->dropColumn('user_id');
            $table->dropColumn('in_charge');
            $table->dropColumn('level');
            $table->dropColumn('max_status');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('document_type');
        Schema::dropIfExists('document_priority_config');
        Schema::dropIfExists('document_priority');
    }
};
