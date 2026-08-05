<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * warehouse.code — 1С sinxronizatsiya kaliti. Batch upsert ishlashi uchun
     * unique index kerak. Avval mavjud dublikat code larni tozalaymiz
     * (eng kichik id qoladi, user_warehouse bog'lanishlari o'sha id ga ko'chiriladi),
     * so'ng unique index qo'shamiz.
     */
    public function up(): void
    {
        $duplicates = DB::table('warehouse')
            ->select('code', DB::raw('MIN(id) as keep_id'))
            ->groupBy('code')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $dup) {
            $removeIds = DB::table('warehouse')
                ->where('code', $dup->code)
                ->where('id', '!=', $dup->keep_id)
                ->pluck('id')
                ->all();

            if (empty($removeIds)) {
                continue;
            }

            // FK (cascade) bog'lanishlarni saqlab qolgan yozuvga ko'chirish
            DB::table('user_warehouse')
                ->whereIn('warehouse_id', $removeIds)
                ->update(['warehouse_id' => $dup->keep_id]);

            DB::table('warehouse')->whereIn('id', $removeIds)->delete();
        }

        Schema::table('warehouse', function (Blueprint $table) {
            $table->unique('code');
        });
    }

    public function down(): void
    {
        Schema::table('warehouse', function (Blueprint $table) {
            $table->dropUnique(['code']);
        });
    }
};
