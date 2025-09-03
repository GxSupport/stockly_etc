<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\DocumentProducts Hujjat mahsulotlari modeli
 * @property int $id ID raqami
 * @property int $document_id Hujjat ID
 * @property string $title Mahsulot nomi
 * @property string $measure O'lchov birligi
 * @property float $quantity Miqdor
 * @property float $amount Narxi
 * @property string|null $note Izoh
 * @property Carbon|null $created_at Yaratilgan vaqt
 * @property Carbon|null $updated_at Yangilangan vaqt
 */
class DocumentProducts extends Model
{
    use HasFactory;
    protected $table = 'document_products';
    protected $fillable = [
        'document_id',
        'user_id',
        'title',
        'measure',
        'quantity',
        'amount',
        'nomenclature',
        'note'
    ];
}
