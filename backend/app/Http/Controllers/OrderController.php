<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\Order\CreateOrderRequest;
use App\Http\Requests\Order\VerifyTransactionRequest;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\Subscription;
use App\Models\AuditLog;
use Carbon\Carbon;

class OrderController extends Controller {
    public function create(CreateOrderRequest $request) {
        $user = $request->user();
        $validated = $request->validated();

        $amount = (int) $validated['amount'];
        $moduleIds = $validated['module_ids'] ?? [];
        $userCount = (int) ($validated['user_count'] ?? 5);
        $billingPeriod = $validated['billing_period'] ?? 'monthly';
        $packageName = $validated['package_name'] ?? 'اشتراک ماژول‌های ERP';

        $orderNumber = 'ORD-' . date('Ymd') . '-' . rand(1000, 9999);

        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => $orderNumber,
            'amount' => $amount,
            'status' => 'pending',
            'module_ids' => $moduleIds,
            'user_count' => $userCount,
            'billing_period' => $billingPeriod,
            'package_name' => $packageName,
        ]);

        return response()->json([
            'order' => $order,
            'payment_url' => "/payment/simulate/{$order->id}",
        ]);
    }

    public function show(Request $request, $id) {
        $user = $request->user();
        $order = Order::where('id', $id)
            ->when($user->role !== 'admin', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->firstOrFail();

        return response()->json(['data' => $order]);
    }

    public function pendingCount(Request $request) {
        $user = $request->user();
        $count = Order::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();
        return response()->json(['count' => $count]);
    }

    public function verifyTransaction(VerifyTransactionRequest $request) {
        $user = $request->user();
        $validated = $request->validated();
        $orderId = $validated['order_id'];

        $order = Order::where('id', $orderId)
            ->when($user->role !== 'admin', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->firstOrFail();

        $trackingCode = 'TRX-' . time() . '-' . rand(100, 999);

        $tx = Transaction::create([
            'order_id' => $order->id,
            'user_id' => $user->id,
            'amount' => $order->amount,
            'tracking_code' => $trackingCode,
            'gateway' => 'zarinpal',
            'status' => 'successful',
        ]);

        $order->status = 'successful';
        $order->save();

        // Calculate subscription expiry
        $days = ($order->billing_period === 'yearly') ? 365 : 30;
        $expiresAt = Carbon::now()->addDays($days);

        $sub = Subscription::create([
            'user_id' => $user->id,
            'title' => $order->package_name ?: 'اشتراک سازمانی کارویتا',
            'source' => 'purchase',
            'status' => 'active',
            'module_ids' => $order->module_ids,
            'expires_at' => $expiresAt,
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action_type' => 'PAYMENT_SUCCESS',
            'action_description' => "پرداخت موفق سفارش {$order->order_number} به مبلغ {$order->amount} تومان",
            'resource_type' => 'transaction',
            'resource_id' => (string) $tx->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'SUCCESS',
        ]);

        return response()->json([
            'status' => 'success',
            'transaction' => $tx,
            'subscription' => $sub,
            'message' => 'پرداخت با موفقیت تایید و اشتراک شما فعال شد',
        ]);
    }
}
