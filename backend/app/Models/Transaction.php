<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model {
    protected $fillable = [
        'order_id',
        'user_id',
        'amount',
        'tracking_code',
        'gateway',
        'status',
    ];

    protected $casts = [
        'amount' => 'integer',
    ];

    public function order() {
        return $this->belongsTo(Order::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
