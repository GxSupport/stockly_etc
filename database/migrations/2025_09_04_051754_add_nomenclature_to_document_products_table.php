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
            $columns = Schema::getColumnListing('document_products');

            if (! in_array('nomenclature', $columns)) {
                $table->string('nomenclature')->nullable()->after('amount')->comment('Product nomenclature code');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_products', function (Blueprint $table) {
            $table->dropColumn('nomenclature');
        });
    }
};
