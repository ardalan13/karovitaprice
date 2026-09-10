<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model {
    protected $fillable = [
        'user_id',
        'name',
        'company_name',
        'subdomain',
        'economic_code',
        'national_id',
        'registration_num',
        'registration_number',
        'postal_code',
        'province',
        'city',
        'industry',
        'phone',
        'address',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
