<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\DocumentPriority Hujjat ustuvorligi modeli
 *
 * @property int $id ID raqami
 * @property int $document_id Hujjat ID
 * @property int $ordering Ustuvorlik tartibi
 * @property int $user_id Foydalanuvchi ID
 * @property string $user_role Foydalanuvchi roli
 * @property User|null $user_info Foydalanuvchi haqida ma'lumot
 * @property UserRoles|null $role_info Foydalanuvchi roli haqida ma
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
        'is_active',
    ];

    public function document()
    {
        return $this->hasOne(Documents::class, 'id', 'document_id');
    }

    public function user_info()
    {
        return $this->hasOne(User::class, 'id', 'user_id');
    }

    public function role_info()
    {
        return $this->hasOne(UserRoles::class, 'title', 'user_role');
    }

    public function return_info()
    {
        return $this->hasMany(DocumentReturned::class, 'priority_id', 'id');
    }

    /**
     * Foydalanuvchi tasdig'ini kutayotgan bosqichlar — «kelgan hujjatlar».
     *
     * Hujjat aynan shu bosqichda turgan bo'lishi shart (documents.status = document_priority.ordering),
     * aks holda hujjat hali oldingi bosqichda yoki allaqachon o'tib ketgan bo'ladi.
     *
     * Bosqich egasi ikki xil belgilanadi:
     * - user_id null — bosqich rol bo'yicha (ketma-ket workflow: Смонтированных, Демонтажа, Списания),
     *   shu roldagi istalgan foydalanuvchi tasdiqlay oladi;
     * - user_id to'ldirilgan — bosqich aniq foydalanuvchiga tayinlangan (to'g'ridan-to'g'ri workflow).
     *
     * Dashboard avval faqat user_id = joriy foydalanuvchi bo'lgan bosqichlarni sanardi,
     * shuning uchun ketma-ket workflow'dagi (user_id null) hujjatlarni umuman ko'rmasdi.
     */
    public function scopeAwaitingApprovalFor(Builder $query, User $user): Builder
    {
        return $query
            ->where('is_active', 1)
            ->where('is_success', false)
            ->where(function (Builder $ownerQuery) use ($user) {
                $ownerQuery
                    ->where(function (Builder $roleQuery) use ($user) {
                        $roleQuery->where('user_role', $user->type)
                            ->where(function (Builder $assigneeQuery) use ($user) {
                                $assigneeQuery->whereNull('user_id')
                                    ->orWhere('user_id', $user->id);
                            });
                    })
                    ->orWhere(function (Builder $assignedQuery) use ($user) {
                        $assignedQuery->where('user_role', 'assigned')
                            ->where('user_id', $user->id);
                    });
            })
            ->whereHas('document', function (Builder $documentQuery) {
                $documentQuery->where('is_draft', 0)
                    ->where('is_returned', 0)
                    ->whereColumn('documents.status', 'document_priority.ordering');
            });
    }
}
