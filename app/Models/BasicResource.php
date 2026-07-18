<?php

namespace App\Models;

use Database\Factories\BasicResourceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BasicResource extends Model
{
    /** @use HasFactory<BasicResourceFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'warehouse_name',
    ];
}
