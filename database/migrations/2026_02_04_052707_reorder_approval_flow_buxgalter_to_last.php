<?php

use App\Models\DocumentPriorityConfig;
use App\Models\DocumentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Approval flow tartibini o'zgartirish:
     * Eski: FRP(1) → Header FRP(2) → Buxgalter(3) → Deputy Director(4) → Director(5)
     * Yangi: FRP(1) → Header FRP(2) → Deputy Director(3) → Director(4) → Buxgalter(5)
     */
    public function up(): void
    {
        $sequentialTypes = DocumentType::where('workflow_type', 1)->pluck('id');

        foreach ($sequentialTypes as $typeId) {
            // 1. document_priority_config ni yangilash
            // Vaqtinchalik ordering=99 ga o'tkazish (unique constraint uchun)
            DocumentPriorityConfig::where('type_id', $typeId)
                ->where('user_role', 'buxgalter')
                ->update(['ordering' => 99]);

            // deputy_director: 4 → 3
            DocumentPriorityConfig::where('type_id', $typeId)
                ->where('user_role', 'deputy_director')
                ->update(['ordering' => 3]);

            // director: 5 → 4
            DocumentPriorityConfig::where('type_id', $typeId)
                ->where('user_role', 'director')
                ->update(['ordering' => 4]);

            // buxgalter: 99 → 5
            DocumentPriorityConfig::where('type_id', $typeId)
                ->where('user_role', 'buxgalter')
                ->update(['ordering' => 5]);
        }

        // 2. Mavjud tugallanmagan hujjatlarning document_priority yozuvlarini yangilash
        $unfinishedDocIds = DB::table('documents')
            ->where('is_finished', 0)
            ->where('is_draft', 0)
            ->whereIn('type', function ($query) {
                $query->select('id')
                    ->from('document_type')
                    ->where('workflow_type', 1);
            })
            ->pluck('id');

        foreach ($unfinishedDocIds as $docId) {
            // Buxgalter: 3 → 99 (vaqtinchalik)
            DB::table('document_priority')
                ->where('document_id', $docId)
                ->where('user_role', 'buxgalter')
                ->where('ordering', 3)
                ->update(['ordering' => 99]);

            // Deputy director: 4 → 3
            DB::table('document_priority')
                ->where('document_id', $docId)
                ->where('user_role', 'deputy_director')
                ->where('ordering', 4)
                ->update(['ordering' => 3]);

            // Director: 5 → 4
            DB::table('document_priority')
                ->where('document_id', $docId)
                ->where('user_role', 'director')
                ->where('ordering', 5)
                ->update(['ordering' => 4]);

            // Buxgalter: 99 → 5
            DB::table('document_priority')
                ->where('document_id', $docId)
                ->where('user_role', 'buxgalter')
                ->where('ordering', 99)
                ->update(['ordering' => 5]);

            // Document status ni yangilash - eng kichik tasdiqlanmagan ordering
            $nextOrdering = DB::table('document_priority')
                ->where('document_id', $docId)
                ->where('is_active', 1)
                ->where('is_success', 0)
                ->min('ordering');

            if ($nextOrdering) {
                DB::table('documents')
                    ->where('id', $docId)
                    ->update(['status' => $nextOrdering]);
            }
        }
    }

    /**
     * Rollback: Yangi → Eski tartibga qaytarish
     * Yangi: FRP(1) → Header FRP(2) → Deputy Director(3) → Director(4) → Buxgalter(5)
     * Eski: FRP(1) → Header FRP(2) → Buxgalter(3) → Deputy Director(4) → Director(5)
     */
    public function down(): void
    {
        $sequentialTypes = DocumentType::where('workflow_type', 1)->pluck('id');

        foreach ($sequentialTypes as $typeId) {
            // Buxgalter: 5 → 99 (vaqtinchalik)
            DocumentPriorityConfig::where('type_id', $typeId)
                ->where('user_role', 'buxgalter')
                ->update(['ordering' => 99]);

            // Director: 4 → 5
            DocumentPriorityConfig::where('type_id', $typeId)
                ->where('user_role', 'director')
                ->update(['ordering' => 5]);

            // Deputy director: 3 → 4
            DocumentPriorityConfig::where('type_id', $typeId)
                ->where('user_role', 'deputy_director')
                ->update(['ordering' => 4]);

            // Buxgalter: 99 → 3
            DocumentPriorityConfig::where('type_id', $typeId)
                ->where('user_role', 'buxgalter')
                ->update(['ordering' => 3]);
        }

        // Mavjud tugallanmagan hujjatlarni qaytarish
        $unfinishedDocIds = DB::table('documents')
            ->where('is_finished', 0)
            ->where('is_draft', 0)
            ->whereIn('type', function ($query) {
                $query->select('id')
                    ->from('document_type')
                    ->where('workflow_type', 1);
            })
            ->pluck('id');

        foreach ($unfinishedDocIds as $docId) {
            // Buxgalter: 5 → 99
            DB::table('document_priority')
                ->where('document_id', $docId)
                ->where('user_role', 'buxgalter')
                ->where('ordering', 5)
                ->update(['ordering' => 99]);

            // Director: 4 → 5
            DB::table('document_priority')
                ->where('document_id', $docId)
                ->where('user_role', 'director')
                ->where('ordering', 4)
                ->update(['ordering' => 5]);

            // Deputy director: 3 → 4
            DB::table('document_priority')
                ->where('document_id', $docId)
                ->where('user_role', 'deputy_director')
                ->where('ordering', 3)
                ->update(['ordering' => 4]);

            // Buxgalter: 99 → 3
            DB::table('document_priority')
                ->where('document_id', $docId)
                ->where('user_role', 'buxgalter')
                ->where('ordering', 99)
                ->update(['ordering' => 3]);

            // Status ni qaytarish
            $nextOrdering = DB::table('document_priority')
                ->where('document_id', $docId)
                ->where('is_active', 1)
                ->where('is_success', 0)
                ->min('ordering');

            if ($nextOrdering) {
                DB::table('documents')
                    ->where('id', $docId)
                    ->update(['status' => $nextOrdering]);
            }
        }
    }
};
