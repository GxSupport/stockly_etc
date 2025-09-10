<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * App\Models\User
 *
 * @property int $id Foydalanuvchi ID raqami
 * @property string $name Foydalanuvchi ismi
 * @property string $password Foydalanuvchi paroli
 * @property string $type Foydalanuvchi turi (admin, user, etc.)
 * @property string $phone Foydalanuvchi telefon raqami
 * @property string|null $chat_id Foydalanuvchi chat ID (agar mavjud bo'lsa)
 * @property int|null $senior_id Katta foydalanuvchi ID (agar mavjud bo'lsa)
 * @property string|null $remember_token Eslab qolish tokeni
 * @property-read UserWarehouse|null $warehouse Foydalanuvchining ombori
 * @property string|null $dep_code Foydalanuvchining bo'lim kodi
 * @property Carbon|null $created_at Yaratilgan vaqt
 * @property Carbon|null $updated_at Yangilangan vaqt
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'password',
        'type',
        'phone',
        'chat_id',
        'senior_id',
        'dep_code',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function role()
    {
        return $this->hasOne(
            UserRoles::class,
            'title',
            'type')->select('id', 'title', 'name');
    }

    public function warehouse()
    {
        return $this->hasOne(
            UserWarehouse::class,
            'user_id',
            'id')->select('user_id', 'warehouse_id')->with('warehouse');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'phone' => 'string',
            'password' => 'hashed',
        ];
    }
}
