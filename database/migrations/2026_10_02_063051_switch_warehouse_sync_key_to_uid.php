<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 1С sinxronizatsiya kaliti code -> uid (УИД). 1С da bitta Код bir nechta turli skladda
     * uchraydi, shuning uchun code endi unique emas (oddiy index qoladi), uid esa unique.
     * Avval takroriy uid larni tozalaymiz (eng kichik id dagi qiymat qoladi).
     */
    public function up(): void
    {
        $duplicates = DB::table('warehouse')
            ->select('uid', DB::raw('MIN(id) as keep_id'))
            ->whereNotNull('uid')
            ->groupBy('uid')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $dup) {
            DB::table('warehouse')
                ->where('uid', $dup->uid)
                ->where('id', '!=', $dup->keep_id)
                ->update(['uid' => null]);
        }

        Schema::table('warehouse', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->index('code');
            $table->unique('uid');
        });
    }

    public function down(): void
    {
        Schema::table('warehouse', function (Blueprint $table) {
            $table->dropUnique(['uid']);
            $table->dropIndex(['code']);
            $table->unique('code');
        });
    }
};
