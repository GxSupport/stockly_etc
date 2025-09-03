<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\UserWarehouse Foydalanuvchi omborlari modeli
 * @property int $id ID raqami
 * @property int $user_id Foydalanuvchi ID raqami
 * @property int $warehouse_id Ombor ID raqami
 * @property Carbon|null $created_at Yaratilgan vaqt
 * @property Carbon|null $updated_at Yangilangan vaqt
 */
class UserWarehouse extends Model
{
    protected $table = 'user_warehouse';

    public function warehouse(){
        return $this->hasOne(Warehouse::class,'id','warehouse_id');
    }
}
