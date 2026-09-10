<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * «Приём-передача» hujjat turi ishlatilmaydi (issue #23). Turni o'chirib yuborib bo'lmaydi —
     * unga bog'langan mavjud aktlar tur nomini yo'qotadi, shuning uchun u faqat o'chiriladi:
     * yangi akt yaratishda va filtrlarda ko'rinmaydi, eski aktlar esa ochiladi.
     */
    public function up(): void
    {
        Schema::table('document_type', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('requires_deputy_approval');
        });

        DB::table('document_type')
            ->where('workflow_type', 2)
            ->update(['is_active' => false]);
    }

    public function down(): void
    {
        Schema::table('document_type', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};
