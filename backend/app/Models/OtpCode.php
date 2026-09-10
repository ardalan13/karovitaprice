<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtpCode extends Model {
    protected $fillable = [
        'mobile',
        'code',
        'purpose',
        'status',
        'attempts',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
}
