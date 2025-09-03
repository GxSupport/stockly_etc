<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use \Illuminate\Database\Eloquent\Relations\HasOne;
class Warehouse extends Model
{
    use HasFactory;
    protected $table = 'warehouse';
    protected $fillable = [
        'code',
        'title',
        'type',
        'price_type',
        'comment',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function type_info(): HasOne
    {
        return $this->hasOne(WarehouseType::class,'id','type');
    }
}
