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
        Schema::table('document_products', function (Blueprint $table) {
            $table->string('warehouse_code', 50)->nullable()->after('nomenclature');
            $table->string('warehouse_name', 255)->nullable()->after('warehouse_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_products', function (Blueprint $table) {
            $table->dropColumn(['warehouse_code', 'warehouse_name']);
        });
    }
};
