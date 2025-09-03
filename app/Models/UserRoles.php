<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\UserRoles Foydalanuvchi rollari modeli
 * @property int $id Roll ID raqami
 * @property string $title Roll nomi (inglizcha)
 * @property string $name Roll nomi
 * @property bool $is_active Roll faollik holati
 * @property Carbon|null $created_at Yaratilgan vaqt
 * @property Carbon|null $updated_at Yangilangan vaqt
 */
class UserRoles extends Model
{
    protected $table = 'user_roles';
    protected $fillable = [
      'title',
      'is_active'
    ];
}
