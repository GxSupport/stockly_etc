<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\DocumentPriorityConfig Hujjat ustuvorligi konfiguratsiyasi modeli
 * @property int $id ID raqami
 * @property int $type_id Hujjat turi ID
 * @property int $ordering Ustuvorlik tartibi
 * @property string $user_role Foydalanuvchi roli
 * @property string $options Qo'shimcha parametrlar (JSON formatida)
 * @property Carbon|null $created_at Yaratilgan vaqt
 * @property Carbon|null $updated_at Yangilangan vaqt
 */
class DocumentPriorityConfig extends Model
{
    protected $table = 'document_priority_config';
    protected $fillable = [
        'type_id',
        'ordering',
        'user_role',
        'options'
    ];
}
