<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
/**
 * App\Models\Documents Hujjatlar modeli
 * @property int $id ID raqami
 * @property int $user_id Foydalanuvchi ID
 * @property string $number Hujjat raqami
 * @property int $type Hujjat turi
 * @property string $subscriber_title Obunachi nomi
 * @property string $address Manzil
 * @property string $date_order Buyurtma sanasi
 * @property string $in_charge Mas'ul shaxs
 * @property int $status Hujjat holati
 * @property int $level Hujjat darajasi
 * @property float $total_amount Umumiy summa
 * @property bool $is_finished Tugallanganligi
 * @property Carbon|null $created_at Yaratilgan vaqt
 * @property Carbon|null $updated_at Yangilangan vaqt
 * @property-read User $user_info Foydalanuvchi haqida ma'lumot
 * @property-read DocumentProducts[]|null $products Hujjat mahsulotlari
 * @property-read DocumentType $document_type Hujjat turi haqida ma'lumot
 * @property-read DocumentReturned[]|null $notes Hujjat qaytgan mahsulotlari
 * @property-read DocumentStatusLog[]|null $stamp Hujjat status loglari
 * @property-read DocumentPriority[]|null $priority Hujjat ustuvorligi
 */
class Documents extends Model
{
    use HasFactory;

    protected $table = 'documents';
    protected $fillable = [
        'user_id',
        'number',
        'type',
        'subscriber_title',
        'address',
        'date_order',
        'in_charge',
        'status',
        'level',
        'total_amount',
        'is_finished'
    ];
    public static array $type = [
        1 => 'смонтированных',
        2 => 'демонтажа',
        3 => 'списания'
    ];

    public function user_info(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'user_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(
            DocumentProducts::class,
            'document_id',
            'id');
    }
    public function document_type(): HasOne
    {
        return $this->hasOne(DocumentType::class,'id','type');
    }
    public function notes(): HasMany
    {
        return $this->hasMany(
            DocumentReturned::class,
            'document_id',
            'id')->with(['fromInfo', 'toInfo']);
    }

    public function stamp(): HasMany
    {
        return $this->hasMany(
            DocumentStatusLog::class,
            'document_id',
            'id')
            ->where('is_active','=', 1)
            ->with('user_info');
    }
    public function priority(){
        return $this->hasMany(DocumentPriority::class,'document_id','id')
            ->where('is_active',1)
            ->orderBy('ordering','ASC');
    }
}
