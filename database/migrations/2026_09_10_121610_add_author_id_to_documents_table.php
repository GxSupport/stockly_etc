<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * documents.user_id workflow davomida o'zgaradi (keyingi bosqich egasiga o'tadi),
     * shuning uchun undan hujjat muallifini aniqlab bo'lmaydi. АКТ ro'yxatidagi
     * «Мои / Входящие» filtri va «Автор» ustuni uchun o'zgarmas author_id kerak.
     */
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->unsignedBigInteger('author_id')->nullable()->after('user_id')->index();
        });

        $this->backfillAuthors();
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropIndex(['author_id']);
            $table->dropColumn('author_id');
        });
    }

    /**
     * Mavjud hujjatlar uchun muallifni tiklash. Ishonchlilik tartibi:
     * 1) document_products.user_id — mahsulot hujjat yaratilayotganda qo'shiladi va keyin o'zgarmaydi;
     * 2) document_priority ordering=1 user_id — to'g'ridan-to'g'ri workflow'da yaratuvchi bosqichi;
     * 3) documents.user_id — hujjat hali birinchi bosqichdan o'tmagan bo'lsa hamon muallifni ko'rsatadi.
     */
    private function backfillAuthors(): void
    {
        $fromProducts = DB::table('document_products')
            ->select('document_id', DB::raw('MIN(user_id) as author_id'))
            ->whereNotNull('user_id')
            ->groupBy('document_id');

        $fromPriority = DB::table('document_priority')
            ->select('document_id', DB::raw('MIN(user_id) as author_id'))
            ->where('ordering', 1)
            ->whereNotNull('user_id')
            ->groupBy('document_id');

        DB::table('documents')
            ->leftJoinSub($fromProducts, 'p', 'p.document_id', '=', 'documents.id')
            ->leftJoinSub($fromPriority, 'pr', 'pr.document_id', '=', 'documents.id')
            ->update([
                'documents.author_id' => DB::raw('COALESCE(p.author_id, pr.author_id, documents.user_id)'),
            ]);
    }
};
