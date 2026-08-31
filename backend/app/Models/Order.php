<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model {
    protected $fillable = [
        'user_id',
        'order_number',
        'amount',
        'status',
        'module_ids',
        'user_count',
        'billing_period',
        'package_name',
    ];

    protected $casts = [
        'module_ids' => 'array',
        'amount' => 'integer',
        'user_count' => 'integer',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function transactions() {
        return $this->hasMany(Transaction::class);
    }
}
