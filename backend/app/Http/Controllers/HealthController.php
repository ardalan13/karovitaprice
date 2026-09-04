<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use Throwable;

class HealthController extends Controller {
    /**
     * Comprehensive health check endpoint for monitoring systems (e.g., Prometheus, UptimeRobot, Kubernetes).
     * Reports Database status, SMS provider connectivity, Cache drivers, and server metrics.
     */
    public function check(Request $request): JsonResponse {
        $startTime = microtime(true);

        // 1. Check Database
        $databaseCheck = $this->checkDatabase();

        // 2. Check SMS Provider
        $smsCheck = $this->checkSmsProvider();

        // 3. Check Cache Driver
        $cacheCheck = $this->checkCacheDriver();

        // 4. System and Server Metrics
        $systemMetrics = $this->getSystemMetrics();

        // Overall status calculation
        $isDbHealthy = ($databaseCheck['status'] === 'healthy');
        $isCacheHealthy = ($cacheCheck['status'] === 'healthy');
        $isSmsHealthy = in_array($smsCheck['status'], ['healthy', 'degraded'], true);

        $overallStatus = ($isDbHealthy && $isCacheHealthy && $isSmsHealthy) ? 'healthy' : ($isDbHealthy ? 'degraded' : 'unhealthy');

        $totalDurationMs = round((microtime(true) - $startTime) * 1000, 2);

        $statusCode = match ($overallStatus) {
            'healthy' => 200,
            'degraded' => 200, // Still serving traffic with partial degradation
            'unhealthy' => 503, // Critical failure (e.g., DB down)
        };

        $response = [
            'status' => $overallStatus,
            'app' => 'KaroVita ERP Backend',
            'environment' => config('app.env', env('APP_ENV', 'production')),
            'timestamp' => Carbon::now('Asia/Tehran')->toIso8601String(),
            'timestamp_utc' => Carbon::now('UTC')->toIso8601String(),
            'response_time_ms' => $totalDurationMs,
            'database' => $databaseCheck,
            'sms_driver' => $smsCheck,
            'services' => [
                'database' => $databaseCheck,
                'sms_provider' => $smsCheck,
                'sms_driver' => $smsCheck,
                'cache' => $cacheCheck,
            ],
            'system' => $systemMetrics,
        ];

        return response()->json($response, $statusCode);
    }

    /**
     * Lightweight ping endpoint for fast load-balancer liveness probes.
     */
    public function ping(): JsonResponse {
        return response()->json([
            'status' => 'ok',
            'service' => 'karovita_erp',
            'timestamp' => time(),
        ], 200);
    }

    /**
     * Check Database connectivity, query latency, and connection info.
     */
    protected function checkDatabase(): array {
        $start = microtime(true);
        $defaultConn = config('database.default', 'mysql');
        $connConfig = config("database.connections.{$defaultConn}", []);

        try {
            // Test query
            $res = DB::select('SELECT 1 as ping');
            $latency = round((microtime(true) - $start) * 1000, 2);

            $databaseName = $connConfig['database'] ?? env('DB_DATABASE', 'karovita_db');
            $driver = $connConfig['driver'] ?? $defaultConn;

            return [
                'status' => 'healthy',
                'driver' => $driver,
                'connection' => $defaultConn,
                'database' => $databaseName,
                'latency_ms' => $latency,
                'message' => 'Database connection established and responding properly.',
            ];
        } catch (Throwable $e) {
            $latency = round((microtime(true) - $start) * 1000, 2);
            return [
                'status' => 'unhealthy',
                'driver' => $connConfig['driver'] ?? $defaultConn,
                'connection' => $defaultConn,
                'latency_ms' => $latency,
                'error' => $e->getMessage(),
                'message' => 'Database connection failed or query timed out.',
            ];
        }
    }

    /**
     * Check SMS provider gateway connectivity and configuration.
     */
    protected function checkSmsProvider(): array {
        $start = microtime(true);
        $driver = env('SMS_DRIVER', 'sms_ir');
        $apiKey = env('SMS_IR_API_KEY');
        $templateId = (int) env('SMS_IR_TEMPLATE_ID', 418155);

        if ($driver === 'sms_ir') {
            if (empty($apiKey)) {
                return [
                    'status' => 'degraded',
                    'provider' => 'SMS.ir (REST API v1)',
                    'driver' => 'sms_ir',
                    'configured' => false,
                    'reachable' => false,
                    'latency_ms' => 0,
                    'message' => 'کلید وب‌سرویس SMS_IR_API_KEY در فایل تنظیمات .env تعریف نشده است.',
                ];
            }

            try {
                // Probe SMS.ir API status/credit endpoint with 3.5s timeout
                $response = Http::timeout(3.5)->withHeaders([
                    'x-api-key' => $apiKey,
                    'Accept' => 'application/json',
                ])->get('https://api.sms.ir/v1/credit');

                $latency = round((microtime(true) - $start) * 1000, 2);

                if ($response->successful()) {
                    $data = $response->json();
                    return [
                        'status' => 'healthy',
                        'provider' => 'SMS.ir (REST API v1)',
                        'driver' => 'sms_ir',
                        'configured' => true,
                        'reachable' => true,
                        'latency_ms' => $latency,
                        'http_status' => $response->status(),
                        'template_id' => $templateId,
                        'credit' => $data['data'] ?? ($data['credit'] ?? null),
                        'message' => 'اتصال به درگاه پیامک SMS.ir با موفقیت برقرار است.',
                    ];
                } elseif ($response->status() === 401 || $response->status() === 403) {
                    return [
                        'status' => 'degraded',
                        'provider' => 'SMS.ir (REST API v1)',
                        'driver' => 'sms_ir',
                        'configured' => true,
                        'reachable' => true,
                        'latency_ms' => $latency,
                        'http_status' => $response->status(),
                        'message' => 'درگاه پیامک در دسترس است اما کلید API نامعتبر است یا منقضی شده است.',
                    ];
                } else {
                    return [
                        'status' => 'degraded',
                        'provider' => 'SMS.ir (REST API v1)',
                        'driver' => 'sms_ir',
                        'configured' => true,
                        'reachable' => true,
                        'latency_ms' => $latency,
                        'http_status' => $response->status(),
                        'message' => 'سرویس‌دهنده پیامک کد وضعیت ' . $response->status() . ' بازگرداند.',
                    ];
                }
            } catch (Throwable $e) {
                $latency = round((microtime(true) - $start) * 1000, 2);
                return [
                    'status' => 'unhealthy',
                    'provider' => 'SMS.ir (REST API v1)',
                    'driver' => 'sms_ir',
                    'configured' => true,
                    'reachable' => false,
                    'latency_ms' => $latency,
                    'error' => $e->getMessage(),
                    'message' => 'ارتباط با سرور پیامک SMS.ir به دلیل خطا یا اتمام مهلت زمانی برقرار نشد.',
                ];
            }
        }

        // Mock / Log / Alternative driver
        return [
            'status' => 'healthy',
            'provider' => strtoupper($driver),
            'driver' => $driver,
            'configured' => true,
            'reachable' => true,
            'latency_ms' => 1,
            'message' => "درایور پیامک بر روی حالت {$driver} تنظیم شده است.",
        ];
    }

    /**
     * Check Cache Driver roundtrip (Put, Get, Forget) and latency.
     */
    protected function checkCacheDriver(): array {
        $start = microtime(true);
        $driver = config('cache.default', env('CACHE_DRIVER', 'file'));

        try {
            $probeKey = 'health_check_probe_' . uniqid();
            $probeValue = time();

            // 1. Write
            Cache::put($probeKey, $probeValue, 10);

            // 2. Read
            $retrieved = Cache::get($probeKey);

            // 3. Delete
            Cache::forget($probeKey);

            $latency = round((microtime(true) - $start) * 1000, 2);

            if ($retrieved != $probeValue) {
                return [
                    'status' => 'unhealthy',
                    'driver' => $driver,
                    'latency_ms' => $latency,
                    'message' => 'عملیات اعتبارسنجی کش با عدم تطابق مقدار بازگشتی مواجه شد.',
                ];
            }

            return [
                'status' => 'healthy',
                'driver' => $driver,
                'latency_ms' => $latency,
                'message' => "درایور کش ({$driver}) عملیات خواندن و نوشتن را با موفقیت انجام داد.",
            ];
        } catch (Throwable $e) {
            $latency = round((microtime(true) - $start) * 1000, 2);
            return [
                'status' => 'unhealthy',
                'driver' => $driver,
                'latency_ms' => $latency,
                'error' => $e->getMessage(),
                'message' => 'خطا در دسترسی یا برقراری ارتباط با درایور کش.',
            ];
        }
    }

    /**
     * Collect system and resource usage metrics.
     */
    protected function getSystemMetrics(): array {
        $memoryUsage = memory_get_usage(true);
        $peakMemoryUsage = memory_get_peak_usage(true);

        $storagePath = storage_path();
        $freeDisk = disk_free_space($storagePath);
        $totalDisk = disk_total_space($storagePath);

        return [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'server_os' => PHP_OS,
            'memory_used' => $this->formatBytes($memoryUsage),
            'memory_peak' => $this->formatBytes($peakMemoryUsage),
            'disk_free' => ($freeDisk !== false) ? $this->formatBytes((int)$freeDisk) : 'N/A',
            'disk_total' => ($totalDisk !== false) ? $this->formatBytes((int)$totalDisk) : 'N/A',
            'disk_usage_percent' => ($freeDisk !== false && $totalDisk !== false && $totalDisk > 0)
                ? round((($totalDisk - $freeDisk) / $totalDisk) * 100, 1) . '%'
                : 'N/A',
        ];
    }

    /**
     * Format bytes into readable format.
     */
    protected function formatBytes(int $bytes, int $precision = 2): string {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
