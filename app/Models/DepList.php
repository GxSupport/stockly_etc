<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\DepList Bo'limlar ro'yxati modeli
 * @property int $id ID raqami
 * @property string $dep_code Bo'lim kodi
 * @property string $title Bo'lim nomi
 * @property bool $is_active Bo'lim faollik holati
 * @property Carbon|null $created_at Yaratilgan vaqt
 * @property Carbon|null $updated_at Yangilangan vaqt
 */
class DepList extends Model
{
    protected $table = 'dep_list';
    
    protected $fillable = [
        'dep_code',
        'title',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
