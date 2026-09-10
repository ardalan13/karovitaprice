<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class User extends Model {
    use HasFactory;

    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'mobile',
        'job_title',
        'avatar',
        'email',
        'onboarding_step',
        'onboarding_completed_at',
        'last_login_at',
    ];

    protected $guarded = [
        'id',
        'role',     // Protect from mass assignment
        'status',   // Protect from mass assignment
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
