<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * documents.note («Причина списания») — DocumentService::update() va Списания formasi ishlatadi,
 * lekin ustun hech qaysi migratsiyada yaratilmagan. Bor bo'lsa tegilmaydi.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('documents', 'note')) {
            return;
        }

        Schema::table('documents', function (Blueprint $table) {
            $table->text('note')->nullable()->after('total_amount');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('documents', 'note')) {
            return;
        }

        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('note');
        });
    }
};
