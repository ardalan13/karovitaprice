<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class User extends Model {
    use HasFactory;

    protected $fillable = [
        'name',
        'mobile',
        'role',
        'status',
        'avatar',
        'email',
    ];

    public function company() {
        return $this->hasOne(Company::class);
    }

    public function subscriptions() {
        return $this->hasMany(Subscription::class);
    }

    public function orders() {
        return $this->hasMany(Order::class);
    }

    public function tickets() {
        return $this->hasMany(Ticket::class);
    }

    public function authTokens() {
        return $this->hasMany(AuthToken::class);
    }

    public function isAdmin(): bool {
        return $this->role === 'admin';
    }
}
