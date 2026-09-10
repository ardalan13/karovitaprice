<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService {
    protected string $apiKey;
    protected string $endpoint = 'https://api.sms.ir/v1';

    public function __construct() {
        $this->apiKey = env('SMS_IR_API_KEY', config('services.sms_ir.api_key', 'ocv39CACg6Vg3cg3DbY3mUwfOti7dktYUwksl3jA3Jt1qI0z'));
    }

    /**
     * Send Verify/Pattern SMS via SMS.ir (Fast Send)
     */
    public function sendVerify(string $mobile, int $templateId, array $parameters): array {
        $formattedParams = [];
        foreach ($parameters as $name => $val) {
            $formattedParams[] = [
                'name' => strtoupper($name),
                'value' => (string) $val,
            ];
        }

        $payload = [
            'mobile' => $this->normalizeMobile($mobile),
            'templateId' => $templateId,
            'parameters' => $formattedParams,
        ];

        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->timeout(8)->post("{$this->endpoint}/send/verify", $payload);

            $data = $response->json();
            $status = $response->status();

            if ($response->successful() && isset($data['status']) && $data['status'] === 1) {
                return [
                    'success' => true,
                    'messageId' => $data['data']['messageId'] ?? null,
                    'cost' => $data['data']['cost'] ?? null,
                    'message' => 'پیامک با موفقیت ارسال شد',
                    'raw' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => $data['message'] ?? "خطای وب‌سرویس پیامک (کد {$status})",
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            Log::error("[SMS.ir Error] {$e->getMessage()}");
            return [
                'success' => false,
                'error' => 'عدم دسترسی به سرور پیامک: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send OTP Verification Code
     */
    public function sendOtp(string $mobile, string $code): array {
        $templateId = (int) env('SMS_IR_TEMPLATE_OTP', config('services.sms_ir.template_otp', 418155));
        return $this->sendVerify($mobile, $templateId, [
            'CODE' => $code,
        ]);
    }

    /**
     * Check SMS.ir Account Credit
     */
    public function checkCredit(): array {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'Accept' => 'application/json',
            ])->timeout(6)->get("{$this->endpoint}/credit");

            $data = $response->json();
            if ($response->successful() && isset($data['status']) && $data['status'] === 1) {
                return [
                    'success' => true,
                    'credit' => $data['data'] ?? 0,
                    'message' => 'اعتبار با موفقیت دریافت شد',
                ];
            }
            return [
                'success' => false,
                'error' => $data['message'] ?? 'خطا در استعلام موجودی',
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Normalize Iranian Mobile Numbers
     */
    protected function normalizeMobile(string $mobile): string {
        $clean = preg_replace('/[^0-9]/', '', $mobile);
        if (str_starts_with($clean, '98') && strlen($clean) === 12) {
            return '0' . substr($clean, 2);
        }
        if (str_starts_with($clean, '9') && strlen($clean) === 10) {
            return '0' . $clean;
        }
        return $clean;
    }
}
