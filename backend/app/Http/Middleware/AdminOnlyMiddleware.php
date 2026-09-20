<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminOnlyMiddleware {
    public function handle(Request $request, Closure $next) {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'دسترسی غیرمجاز'], 401);
        }

        // Full access for System Admin & System Owner
        if ($user->role === 'admin' || $user->mobile === '09111273476') {
            return $next($request);
        }

        // Permitted routes for Support Staff (Tickets, Support Staff, Orders, Subscriptions)
        if ($user->role === 'support') {
            $path = $request->path();
            $allowed = str_contains($path, 'tickets') ||
                       str_contains($path, 'support-staff') ||
                       str_contains($path, 'orders') ||
                       str_contains($path, 'subscriptions') ||
                       str_contains($path, 'push/subscribers');
            if ($allowed) {
                return $next($request);
            }
        }

        return response()->json(['error' => 'دسترسی غیرمجاز: این بخش منحصراً در اختیار تیم مدیریت و پشتیبانی کارویتا می‌باشد'], 403);
    }
}
