<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
        Schema::create('warehouse_type',function (Blueprint $table){
            $table->id();
            $table->string('title');
            $table->tinyInteger('is_active')->default(1);
            $table->timestamps();
        });
        Schema::create('warehouse', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->string('title');
            $table->unsignedBigInteger('type')->nullable();
            $table->string('price_type')->nullable(true);
            $table->string('comment')->nullable(true);
            $table->tinyInteger('is_active')->default(1);
            $table->timestamps();
            $table->foreign('type')->references('id')
                ->on('warehouse_type')->onDelete('cascade');
        });
        Schema::create('user_warehouse',function (Blueprint $table){
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('warehouse_id');
            $table->timestamps();
            $table->foreign('user_id')->references('id')
                ->on('users')->onDelete('cascade');
            $table->foreign('warehouse_id')->references('id')
                ->on('warehouse')->onDelete('cascade');
        });
        DB::table('warehouse_type')->insert(
            ['title'=>'Оптовый']
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('branches');
    }
};
