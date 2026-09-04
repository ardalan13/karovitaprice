<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Models\User;
use App\Models\OtpCode;
use App\Models\AuthToken;
use App\Models\AuditLog;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller {
    public function sendOtp(SendOtpRequest $request) {
        $mobile = $request->validated()['mobile'];

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

        // Send via SMS.ir API
        try {
            $smsService = new \App\Services\SmsService();
            $smsService->sendOtp($mobile, $code);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("[SMS Dispatch Warning] " . $e->getMessage());
        }

        return response()->json([
            'message' => 'کد تایید با موفقیت ارسال شد',
            'expires_in' => 120,
            'debug_code' => env('APP_DEBUG') ? $code : null,
        ]);
    }

    public function verifyOtp(VerifyOtpRequest $request) {
        $validated = $request->validated();
        $mobile = $validated['mobile'];
        $code = $validated['code'];

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
            'access_token' => $tokenString,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'first_name' => $user->first_name ?? null,
                'last_name' => $user->last_name ?? null,
                'mobile' => $user->mobile,
                'role' => $user->role,
                'status' => $user->status,
                'avatar' => $user->avatar ?? null,
                'onboarding_step' => $user->onboarding_step ?? 4,
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
