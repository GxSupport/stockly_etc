<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * App\Models\DocumentStatusLog Hujjat holatlari logi modeli
 * @property int $id ID raqami
 * @property string $status Holat nomi
 * @property int $level Holat darajasi
 * @property int $user_id Foydalanuvchi ID
 * @property int $document_id Hujjat ID
 * @property bool $is_confirm Tasdiqlanganligi
 * @property bool $is_frp FRP holati
 * @property string|null $note Izoh
 * @property Carbon|null $created_at Yaratilgan vaqt
 * @property Carbon|null $updated_at Yangilangan vaqt
 * @property-read User|null $user_info Foydalanuvchi haqida ma'lumot
 */
class DocumentStatusLog extends Model
{
    use HasFactory;
    protected $table = 'document_status_log';
    protected $fillable = [
        'status',
        'level',
        'user_id',
        'document_id',
        'is_confirm',
        'is_frp',
        'note'
    ];
    public function user_info(): HasOne
    {
        return $this->hasOne(User::class,'id','user_id')
            ->select(['id','name','type','phone']);
    }
}
