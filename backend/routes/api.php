<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\HealthController;

/*
|--------------------------------------------------------------------------
| Public Routes & Health Probes
|--------------------------------------------------------------------------
*/
Route::get('/health', [HealthController::class, 'check']);
Route::get('/ping', [HealthController::class, 'ping']);

Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::get('/pricing/modules', [PricingController::class, 'getModules']);
Route::get('/departments', [TicketController::class, 'getDepartments']);

/*
|--------------------------------------------------------------------------
| Protected User Routes
|--------------------------------------------------------------------------
*/
Route::middleware('token.auth')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // User Profile & Company
    Route::get('/user/profile', [UserController::class, 'getProfile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::get('/user/company', [UserController::class, 'getCompany']);
    Route::post('/user/company', [UserController::class, 'saveCompany']);
    Route::get('/user/purchased-packages', [UserController::class, 'getPurchasedPackages']);
    Route::get('/user/subscriptions', [UserController::class, 'getSubscriptions']);

    // Tickets
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::post('/tickets/{id}/reply', [TicketController::class, 'reply']);
    Route::patch('/tickets/{id}/close', [TicketController::class, 'close']);

    // Orders & Transactions
    Route::post('/orders/create', [OrderController::class, 'create']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/transactions/verify', [OrderController::class, 'verifyTransaction']);
});

/*
|--------------------------------------------------------------------------
| Protected Admin Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['token.auth', 'admin.only'])->prefix('admin')->group(function () {
    Route::get('/overview', [AdminController::class, 'overview']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);
    Route::put('/users/{id}/status', [AdminController::class, 'updateUserStatus']);

    Route::get('/tickets', [AdminController::class, 'tickets']);
    Route::get('/audit-logs', [AdminController::class, 'auditLogs']);

    Route::get('/pricing', [PricingController::class, 'adminPricing']);
    Route::post('/pricing/save', [PricingController::class, 'saveAdminPricing']);
});
