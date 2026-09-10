<?php

$frontendUrls = array_filter(array_map('trim', explode(',', env('FRONTEND_URL', ''))));

// NEVER allow wildcard in production
if (empty($frontendUrls) && env('APP_ENV') === 'production') {
    throw new \RuntimeException('FRONTEND_URL environment variable must be set in production');
}

$defaultOrigins = env('APP_ENV') === 'local' ? [
    'http://localhost:3000',
    'http://localhost:5173',
] : [];

$allowedOrigins = !empty($frontendUrls)
    ? array_values(array_unique(array_merge($defaultOrigins, $frontendUrls)))
    : $defaultOrigins;

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Configured for seamless communication with React / Vite Single Page App.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOrigins,

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Authorization', 'X-Total-Count', 'Content-Disposition'],

    'max_age' => 86400,

    'supports_credentials' => true,

];

