<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\DocumentPriority Hujjat ustuvorligi modeli
 * @property int $id ID raqami
 * @property int $document_id Hujjat ID
 * @property int $ordering Ustuvorlik tartibi
 * @property int $user_id Foydalanuvchi ID
 * @property string $user_role Foydalanuvchi roli
 * @property bool $is_success Muvaffaqiyat holati (0 yoki 1)
 * @property bool $is_active Faollik holati (0 yoki 1)
 * @property Carbon|null $created_at Yaratilgan vaqt
 * @property Carbon|null $updated_at Yangilangan vaqt
 */
class DocumentPriority extends Model
{
    use HasFactory;
    protected $table = 'document_priority';
    protected $fillable = [
        'document_id',
        'ordering',
        'user_id',
        'user_role',
        'is_success',
        'is_active'
    ];
    public function document(){
        return $this->hasOne(Documents::class,'id','document_id');
    }
    public function user_info(){
        return $this->hasOne(User::class,'id','user_id');
    }
    public function return_info(){
        return $this->hasMany(DocumentReturned::class,'priority_id','id');
    }
}
