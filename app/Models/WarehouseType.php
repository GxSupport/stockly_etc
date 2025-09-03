<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\WarehouseType Ombor turi modeli
 * @property int $id ID raqami
 * @property string $title Ombor turi nomi
 * @property bool $is_active Ombor turi faollik holati
 * @property Carbon|null $created_at Yaratilgan vaqt
 * @property Carbon|null $updated_at Yangilangan vaqt
 */
class WarehouseType extends Model
{

    protected $table = 'warehouse_type';

    protected $fillable = [
        'title',
        'is_active'
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
