<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\AuthToken;
use Carbon\Carbon;

class TokenAuthMiddleware {
    public function handle(Request $request, Closure $next) {
        $header = $request->header('Authorization');
        if (!$header || !preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            return response()->json(['error' => 'احراز هویت انجام نشده است'], 401);
        }

        $tokenStr = trim($matches[1]);
        $token = AuthToken::with('user')
            ->where('token', $tokenStr)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', Carbon::now());
            })
            ->first();

        if (!$token || !$token->user) {
            return response()->json(['error' => 'توکن نامعتبر یا منقضی شده است'], 401);
        }

        if ($token->user->status === 'suspended') {
            return response()->json(['error' => 'حساب کاربری شما مسدود شده است'], 403);
        }

        // Attach user to request
        $request->setUserResolver(function () use ($token) {
            return $token->user;
        });

        return $next($request);
    }
}
