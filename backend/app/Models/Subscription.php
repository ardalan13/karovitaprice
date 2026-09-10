<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model {
    protected $fillable = [
        'user_id',
        'order_id',
        'title',
        'package_name',
        'plan_name',
        'source',
        'status',
        'billing_period',
        'user_count',
        'user_limit',
        'price',
        'total_price',
        'order_number',
        'server_instance',
        'module_ids',
        'starts_at',
        'expires_at',
    ];

    protected $casts = [
        'module_ids' => 'array',
        'expires_at' => 'datetime',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
