<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model {
    protected $fillable = [
        'user_id',
        'department_id',
        'subject',
        'service_name',
        'priority',
        'status',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function department() {
        return $this->belongsTo(Department::class);
    }

    public function messages() {
        return $this->hasMany(TicketMessage::class);
    }
}
