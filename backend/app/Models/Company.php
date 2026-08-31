<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model {
    protected $fillable = [
        'user_id',
        'name',
        'national_id',
        'registration_number',
        'phone',
        'address',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
