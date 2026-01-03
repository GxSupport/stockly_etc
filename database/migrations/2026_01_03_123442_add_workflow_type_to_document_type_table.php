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
        Schema::table('document_type', function (Blueprint $table) {
            // 1 = ketma-ket (sequential), 2 = to'g'ridan-to'g'ri (direct assignment)
            $table->tinyInteger('workflow_type')->default(1)->after('title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_type', function (Blueprint $table) {
            $table->dropColumn('workflow_type');
        });
    }
};
