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

// Authentication & OTP Endpoints with rate limiting
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/auth/otp/request', [AuthController::class, 'sendOtp']);
    Route::post('/profile/otp/request', [AuthController::class, 'sendOtp']);

    Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/auth/otp/verify', [AuthController::class, 'verifyOtp']);
    Route::post('/profile/otp/verify', [AuthController::class, 'verifyOtp']);
});

Route::get('/pricing/modules', [PricingController::class, 'getModules']);
Route::get('/pricing', [PricingController::class, 'getModules']);
Route::get('/departments', [TicketController::class, 'getDepartments']);

// Public Logging & Vitals Receivers
Route::post('/logs/vitals', function () {
    return response()->json(['status' => 'ok', 'id' => uniqid('vit_')], 201);
});
Route::post('/logs/client-error', function () {
    return response()->json(['status' => 'ok', 'id' => uniqid('err_')], 201);
});

/*
|--------------------------------------------------------------------------
| Protected User Routes (Rate Limited)
|--------------------------------------------------------------------------
*/
Route::middleware(['token.auth', 'throttle:60,1'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Main User Dashboard
    Route::get('/dashboard', [UserController::class, 'getDashboard']);

    // User Profile & Company
    Route::get('/user/profile', [UserController::class, 'getProfile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::get('/user/company', [UserController::class, 'getCompany']);
    Route::post('/user/company', [UserController::class, 'saveCompany']);
    Route::get('/user/purchased-packages', [UserController::class, 'getPurchasedPackages']);
    Route::get('/user/subscriptions', [UserController::class, 'getSubscriptions']);

    // Tickets
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/badge', [TicketController::class, 'getBadge']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::post('/tickets/{id}/reply', [TicketController::class, 'reply']);
    Route::patch('/tickets/{id}/close', [TicketController::class, 'close']);

    // Orders & Transactions
    Route::get('/payments/pending-count', [OrderController::class, 'pendingCount']);
    Route::post('/orders/create', [OrderController::class, 'create']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/transactions/verify', [OrderController::class, 'verifyTransaction']);
});

/*
|--------------------------------------------------------------------------
| Protected Admin Routes (Higher Rate Limit)
|--------------------------------------------------------------------------
*/
Route::middleware(['token.auth', 'admin.only', 'throttle:120,1'])->prefix('admin')->group(function () {
    Route::get('/overview', [AdminController::class, 'overview']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);
    Route::put('/users/{id}/status', [AdminController::class, 'updateUserStatus']);

    Route::get('/tickets', [AdminController::class, 'tickets']);
    Route::get('/audit-logs', [AdminController::class, 'auditLogs']);

    Route::get('/orders', [AdminController::class, 'orders']);
    Route::put('/orders/{id}', [AdminController::class, 'updateOrderStatus']);

    Route::get('/subscriptions', [AdminController::class, 'subscriptions']);
    Route::put('/subscriptions', [AdminController::class, 'updateSubscriptionStatus']);
    Route::put('/subscriptions/{id}', [AdminController::class, 'updateSubscriptionStatus']);
    Route::get('/subscriptions/{id}', [AdminController::class, 'subscriptionDetails']);
    Route::put('/subscriptions/{id}/modules', [AdminController::class, 'updateSubscriptionModules']);
    Route::post('/users/{userId}/subscriptions', [AdminController::class, 'createDirectSubscription']);
    Route::put('/users/{userId}/subscriptions/{subId}/modules', [AdminController::class, 'updateUserSubscriptionModules']);
    Route::get('/users/{id}/details', [AdminController::class, 'userDetails']);

    Route::get('/pricing', [PricingController::class, 'adminPricing']);
    Route::post('/pricing/save', [PricingController::class, 'saveAdminPricing']);

    // Gateways & SMS Settings
    Route::get('/gateways/settings', [AdminController::class, 'getGatewaySettings']);
    Route::get('/admin/gateways/settings', [AdminController::class, 'getGatewaySettings']);
    Route::get('/gateways/health', [AdminController::class, 'getGatewayHealth']);
    Route::get('/admin/gateways/health', [AdminController::class, 'getGatewayHealth']);
    Route::get('/gateways/sms/logs', [AdminController::class, 'getSmsLogs']);
    Route::get('/admin/gateways/sms/logs', [AdminController::class, 'getSmsLogs']);
    Route::post('/gateways/sms/test', [AdminController::class, 'testSms']);
    Route::post('/admin/gateways/sms/test', [AdminController::class, 'testSms']);

    // Admin PWA Master Switch
    Route::post('/pwa/toggle', function (\Illuminate\Http\Request $request) {
        $enabled = $request->boolean('enabled', true);
        return response()->json([
            'success' => true,
            'enabled' => $enabled,
            'pwaSettings' => ['enabled' => $enabled, 'updated_at' => now()->toIso8601String()],
            'message' => $enabled
                ? 'سرویس PWA، سرویس‌ورکر و اعلان‌های وب با موفقیت فعال گردید.'
                : 'سرویس PWA، سرویس‌ورکر و اعلان‌های وب با موفقیت غیرفعال شد.'
        ]);
    });
});

// PWA Master Status (Public)
Route::get('/pwa/status', function () {
    return response()->json([
        'success' => true,
        'enabled' => true,
        'pwaSettings' => ['enabled' => true]
    ]);
});
Route::get('/api/pwa/status', function () {
    return response()->json([
        'success' => true,
        'enabled' => true,
        'pwaSettings' => ['enabled' => true]
    ]);
});
Route::post('/api/admin/pwa/toggle', function (\Illuminate\Http\Request $request) {
    $enabled = $request->boolean('enabled', true);
    return response()->json([
        'success' => true,
        'enabled' => $enabled,
        'pwaSettings' => ['enabled' => $enabled, 'updated_at' => now()->toIso8601String()],
        'message' => $enabled
            ? 'سرویس PWA، سرویس‌ورکر و اعلان‌های وب با موفقیت فعال گردید.'
            : 'سرویس PWA، سرویس‌ورکر و اعلان‌های وب با موفقیت غیرفعال شد.'
    ]);
})->middleware(['token.auth', 'admin.only']);

// Fallback & direct routes outside prefix to avoid any 'Route not found' in reverse proxies
Route::get('/api/health', [HealthController::class, 'check']);
Route::get('/admin/subscriptions', [AdminController::class, 'subscriptions']);
Route::put('/admin/subscriptions', [AdminController::class, 'updateSubscriptionStatus']);
Route::put('/admin/subscriptions/{id}', [AdminController::class, 'updateSubscriptionStatus']);
Route::get('/subscriptions', [AdminController::class, 'subscriptions']);
Route::put('/subscriptions', [AdminController::class, 'updateSubscriptionStatus']);

// Official Invoice and Contract routes
Route::get('/invoices/{id}/contract', function ($id) {
    if (file_exists(__DIR__ . '/../public/api/index.php')) {
        $_SERVER['REQUEST_URI'] = "/api/invoices/{$id}/contract";
        $_SERVER['REQUEST_METHOD'] = 'GET';
        require __DIR__ . '/../public/api/index.php';
        exit;
    }
    return response()->json(['message' => 'Contract endpoint not found'], 404);
});
Route::get('/api/invoices/{id}/contract', function ($id) {
    if (file_exists(__DIR__ . '/../public/api/index.php')) {
        $_SERVER['REQUEST_URI'] = "/api/invoices/{$id}/contract";
        $_SERVER['REQUEST_METHOD'] = 'GET';
        require __DIR__ . '/../public/api/index.php';
        exit;
    }
    return response()->json(['message' => 'Contract endpoint not found'], 404);
});
Route::get('/invoices/{id}', function ($id) {
    if (file_exists(__DIR__ . '/../public/api/index.php')) {
        $_SERVER['REQUEST_URI'] = "/api/invoices/{$id}";
        $_SERVER['REQUEST_METHOD'] = 'GET';
        require __DIR__ . '/../public/api/index.php';
        exit;
    }
    return response()->json(['message' => 'Invoice endpoint not found'], 404);
});
Route::get('/api/invoices/{id}', function ($id) {
    if (file_exists(__DIR__ . '/../public/api/index.php')) {
        $_SERVER['REQUEST_URI'] = "/api/invoices/{$id}";
        $_SERVER['REQUEST_METHOD'] = 'GET';
        require __DIR__ . '/../public/api/index.php';
        exit;
    }
    return response()->json(['message' => 'Invoice endpoint not found'], 404);
});


