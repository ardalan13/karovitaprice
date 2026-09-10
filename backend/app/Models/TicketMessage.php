<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketMessage extends Model {
    protected $fillable = [
        'ticket_id',
        'user_id',
        'message',
        'is_admin',
        'attachments',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
        'attachments' => 'array',
    ];

    public function ticket() {
        return $this->belongsTo(Ticket::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
