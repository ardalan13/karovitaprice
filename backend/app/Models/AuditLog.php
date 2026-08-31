<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model {
    protected $fillable = [
        'user_id',
        'action_type',
        'action_description',
        'resource_type',
        'resource_id',
        'ip_address',
        'user_agent',
        'status',
        'details',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
