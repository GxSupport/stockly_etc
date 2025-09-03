<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\DocumentType Hujjat turi modeli
 * @property int $id ID raqami
 * @property string $code Hujjat kodi
 * @property string $title Hujjat nomi
 * @property Carbon|null $created_at Yaratilgan vaqt
 * @property Carbon|null $updated_at Yangilangan vaqt
 */
class DocumentType extends Model
{
    use HasFactory;
    
    protected $table = 'document_type';
    
    protected $fillable = [
        'code',
        'title'
    ];
}
