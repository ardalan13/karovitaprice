<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricingModule extends Model {
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'category',
        'price',
        'is_active',
        'description',
    ];

    protected $casts = [
        'price' => 'integer',
        'is_active' => 'boolean',
    ];
}
