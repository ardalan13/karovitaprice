<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\AdminController;

Route::get('/', function () {
    return response()->json([
        'app' => 'KaroVita Cloud ERP API',
        'status' => 'online',
        'version' => '2.0.0',
        'laravel_version' => app()->version(),
    ]);
});

// Direct Web mappings for Health & Diagnostics
Route::get('/health', [HealthController::class, 'check']);
Route::get('/api/health', [HealthController::class, 'check']);
Route::get('/ping', [HealthController::class, 'ping']);

// Direct Web mappings for Admin Subscriptions
Route::get('/admin/subscriptions', [AdminController::class, 'subscriptions']);
Route::put('/admin/subscriptions', [AdminController::class, 'updateSubscriptionStatus']);
Route::put('/admin/subscriptions/{id}', [AdminController::class, 'updateSubscriptionStatus']);
Route::get('/api/admin/subscriptions', [AdminController::class, 'subscriptions']);
Route::put('/api/admin/subscriptions', [AdminController::class, 'updateSubscriptionStatus']);
Route::put('/api/admin/subscriptions/{id}', [AdminController::class, 'updateSubscriptionStatus']);
