<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
if (file_exists(__DIR__.'/../vendor/autoload.php')) {
    require __DIR__.'/../vendor/autoload.php';

    // Bootstrap Laravel and handle the request...
    (require_once __DIR__.'/../bootstrap/app.php')
        ->handleRequest(Request::capture());
} else {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(503);
    echo json_encode([
        'status' => 'setup_required',
        'message' => 'Laravel 11 backend files are ready. Please execute `composer install` on your server to generate the vendor directory.',
        'environment' => [
            'php_version' => PHP_VERSION,
            'laravel' => '11.x'
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

