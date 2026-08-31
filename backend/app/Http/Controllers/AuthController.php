<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\OtpCode;
use App\Models\AuthToken;
use App\Models\AuditLog;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller {
    public function sendOtp(Request $request) {
        $mobile = trim((string) $request->input('mobile', ''));
        // Normalize Persian digits to English
        $mobile = strtr($mobile, ['۰'=>'0','۱'=>'1','۲'=>'2','۳'=>'3','۴'=>'4','۵'=>'5','۶'=>'6','۷'=>'7','۸'=>'8','۹'=>'9']);

        if (!$mobile || !preg_match('/^09[0-9]{9}$/', $mobile)) {
            return response()->json(['error' => 'شماره موبایل وارد شده نامعتبر است (باید ۱۱ رقمی و با ۰۹ شروع شود)'], 400);
        }

        // Generate 5 digit code
        $code = (string) rand(10000, 99999);

        OtpCode::create([
            'mobile' => $mobile,
            'code' => $code,
            'purpose' => 'login',
            'status' => 'pending',
            'attempts' => 0,
            'expires_at' => Carbon::now()->addMinutes(2),
        ]);

        // Send via SMS.ir API if configured
        $apiKey = env('SMS_IR_API_KEY');
        $templateId = (int) env('SMS_IR_TEMPLATE_ID', 418155);
        $paramName = env('SMS_IR_PARAM_NAME', 'CODE');

        if ($apiKey && env('SMS_DRIVER') === 'sms_ir') {
            try {
                Http::withHeaders([
                    'x-api-key' => $apiKey,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])->post('https://api.sms.ir/v1/send/verify', [
                    'mobile' => $mobile,
                    'templateId' => $templateId,
                    'parameters' => [
                        [
                            'name' => $paramName,
                            'value' => $code,
                        ]
                    ]
                ]);
            } catch (\Exception $e) {
                // Log and continue gracefully
            }
        }

        return response()->json([
            'message' => 'کد تایید با موفقیت ارسال شد',
            'expires_in' => 120,
            'debug_code' => env('APP_DEBUG') ? $code : null,
        ]);
    }

    public function verifyOtp(Request $request) {
        $mobile = trim((string) $request->input('mobile', ''));
        $code = trim((string) $request->input('code', ''));
        $mobile = strtr($mobile, ['۰'=>'0','۱'=>'1','۲'=>'2','۳'=>'3','۴'=>'4','۵'=>'5','۶'=>'6','۷'=>'7','۸'=>'8','۹'=>'9']);
        $code = strtr($code, ['۰'=>'0','۱'=>'1','۲'=>'2','۳'=>'3','۴'=>'4','۵'=>'5','۶'=>'6','۷'=>'7','۸'=>'8','۹'=>'9']);

        $otp = OtpCode::where('mobile', $mobile)
            ->where('code', $code)
            ->where('status', 'pending')
            ->where('expires_at', '>', Carbon::now())
            ->latest()
            ->first();

        if (!$otp) {
            return response()->json(['error' => 'کد تایید وارد شده اشتباه است یا منقضی شده است'], 400);
        }

        $otp->update(['status' => 'verified']);

        // Find or create user
        $user = User::firstOrCreate(
            ['mobile' => $mobile],
            [
                'name' => ($mobile === '09111273476') ? 'اردلان داوودی' : ('کاربر ' . substr($mobile, -4)),
                'role' => ($mobile === '09111273476') ? 'admin' : 'user',
                'status' => 'active',
            ]
        );

        // Generate secure 64 char token
        $tokenString = Str::random(64);
        AuthToken::create([
            'user_id' => $user->id,
            'token' => $tokenString,
            'expires_at' => Carbon::now()->addDays(30),
        ]);

        // Audit Log
        AuditLog::create([
            'user_id' => $user->id,
            'action_type' => 'USER_LOGIN',
            'action_description' => "ورود کاربر با شماره {$user->mobile} به سامانه",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'token' => $tokenString,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'mobile' => $user->mobile,
                'role' => $user->role,
                'status' => $user->status,
                'avatar' => $user->avatar,
            ]
        ]);
    }

    public function me(Request $request) {
        $user = $request->user();
        return response()->json(['user' => $user]);
    }

    public function logout(Request $request) {
        $header = $request->header('Authorization');
        if ($header && preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            AuthToken::where('token', trim($matches[1]))->delete();
        }
        return response()->json(['message' => 'با موفقیت خارج شدید']);
    }
}
