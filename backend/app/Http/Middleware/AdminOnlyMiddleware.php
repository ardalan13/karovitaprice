<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminOnlyMiddleware {
    public function handle(Request $request, Closure $next) {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['error' => 'دسترسی غیرمجاز: تنها مدیر ارشد مجاز است'], 403);
        }
        return $next($request);
    }
}
