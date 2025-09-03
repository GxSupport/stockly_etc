<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * App\Models\DocumentReturned Qaytarilgan hujjatlar modeli
 * @property int $id ID raqami
 * @property int $document_id Hujjat ID
 * @property int $from_id Kimdan
 * @property int $to_id Kimga
 * @property string|null $note Izoh
 * @property int $is_solved Hal qilindi (0 - yo'q, 1 - ha)
 * @property int $is_deleted O'chirildi (0 - yo'q, 1 - ha)
 * @property int $priority_id Prioritet ID
 * @property Carbon|null $created_at Yaratilgan vaqt
 * @property Carbon|null $updated_at Yangilangan vaqt
 */
class DocumentReturned extends Model
{
    use HasFactory;
    protected $table = 'document_returned';
    public function fromInfo(): HasOne
    {
        return $this->hasOne(User::class,'id','from_id')
            ->select(['id','name','type','phone']);
    }
    public function toInfo(): HasOne
    {
        return $this->hasOne(User::class,'id','to_id')
            ->select(['id','name','type','phone']);
    }
}
