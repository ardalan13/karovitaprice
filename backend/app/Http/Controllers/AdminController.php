<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Models\User;
use App\Models\Company;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\Subscription;
use App\Models\Ticket;
use App\Models\AuditLog;
use App\Services\AuditLogger;
use Carbon\Carbon;

class AdminController extends Controller {
    public function overview() {
        $usersCount = User::where('role', 'user')->count();
        $companiesCount = Company::count();
        $revenue = Transaction::where('status', 'successful')->sum('amount');
        $now = Carbon::now();
        $activeSubs = Subscription::where('status', 'active')->where('expires_at', '>', $now)->count();
        $trials = Subscription::where('source', 'trial')->count();

        $transactions = Transaction::with('order')->latest()->get()->map(function ($t) {
            $pkgName = 'ماژول‌های ERP سازمانی';
            if ($t->order && !empty($t->order->module_ids)) {
                $pkgName = 'ماژول‌های ERP سازمانی (' . count($t->order->module_ids) . ' ماژول)';
            } elseif ($t->order && $t->order->package_name) {
                $pkgName = $t->order->package_name;
            }
            return [
                'id' => $t->id,
                'order_id' => $t->order_id,
                'user_id' => $t->user_id,
                'amount' => $t->amount,
                'status' => $t->status,
                'created_at' => $t->created_at->toISOString(),
                'package_name' => $pkgName,
                'user_count' => $t->order->user_count ?? 5,
                'billing_period' => $t->order->billing_period ?? 'monthly',
                'order_number' => $t->order->order_number ?? '—',
            ];
        });

        $orders = Order::latest()->get();

        return response()->json([
            'stats' => [
                'users' => $usersCount,
                'companies' => $companiesCount,
                'revenue' => (int) $revenue,
                'active_subscriptions' => $activeSubs,
                'trials' => $trials,
            ],
            'transactions' => $transactions,
            'orders' => $orders,
        ]);
    }

    public function users() {
        $users = User::with('company')->latest()->get();
        return response()->json(['data' => $users]);
    }

    public function updateUserRole(UpdateUserRoleRequest $request, $id) {
        $user = User::findOrFail($id);
        $validated = $request->validated();
        $oldRole = $user->role;
        $newRole = $validated['role'];
        
        $user->role = $newRole;
        $user->save();

        AuditLogger::logUserRoleChange($user, $oldRole, $newRole, $request->user());

        return response()->json(['message' => 'نقش کاربر با موفقیت تغییر یافت', 'data' => $user]);
    }

    public function updateUserStatus(UpdateUserStatusRequest $request, $id) {
        $user = User::findOrFail($id);
        $validated = $request->validated();
        $oldStatus = $user->status;
        $newStatus = $validated['status'];

        $user->status = $newStatus;
        $user->save();

        AuditLogger::logUserStatusChange($user, $oldStatus, $newStatus, $request->user());

        return response()->json(['message' => 'وضعیت کاربر با موفقیت تغییر یافت', 'data' => $user]);
    }

    public function tickets() {
        $tickets = Ticket::with(['department', 'user', 'messages'])->latest()->get();
        return response()->json(['data' => $tickets]);
    }

    public function auditLogs() {
        $logs = AuditLog::with('user')->latest()->take(150)->get();
        return response()->json(['data' => $logs]);
    }
}
