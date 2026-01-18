<?php

use App\Models\DocumentPriorityConfig;
use App\Models\DocumentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Standart workflow uchun deputy_director bosqichini qo'shish:
     * FRP(1) → Header FRP(2) → Buxgalter(3) → Deputy Director(4) → Director(5)
     */
    public function up(): void
    {
        // Faqat sequential workflow (workflow_type=1) uchun
        $sequentialTypes = DocumentType::where('workflow_type', 1)->pluck('id');

        foreach ($sequentialTypes as $typeId) {
            // 1. Director ordering ni 4 dan 5 ga o'zgartirish
            DocumentPriorityConfig::where('type_id', $typeId)
                ->where('user_role', 'director')
                ->update(['ordering' => 5]);

            // 2. Deputy director qo'shish (ordering=4)
            // Agar mavjud bo'lmasa
            $exists = DocumentPriorityConfig::where('type_id', $typeId)
                ->where('user_role', 'deputy_director')
                ->exists();

            if (!$exists) {
                DocumentPriorityConfig::create([
                    'type_id' => $typeId,
                    'ordering' => 4,
                    'user_role' => 'deputy_director',
                    'options' => json_encode([
                        'sms_confirm' => true,
                        'attached_head' => false,
                        'check_product' => false,
                        'check_main' => false,
                    ]),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $sequentialTypes = DocumentType::where('workflow_type', 1)->pluck('id');

        foreach ($sequentialTypes as $typeId) {
            // Deputy director ni o'chirish
            DocumentPriorityConfig::where('type_id', $typeId)
                ->where('user_role', 'deputy_director')
                ->delete();

            // Director ordering ni 5 dan 4 ga qaytarish
            DocumentPriorityConfig::where('type_id', $typeId)
                ->where('user_role', 'director')
                ->update(['ordering' => 4]);
        }
    }
};
