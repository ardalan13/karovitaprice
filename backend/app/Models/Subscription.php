<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model {
    protected $fillable = [
        'user_id',
        'title',
        'source',
        'status',
        'module_ids',
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
