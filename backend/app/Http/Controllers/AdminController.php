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

    public function orders() {
        $orders = Order::with(['user.company', 'transactions'])->latest()->get()->map(function ($o) {
            $user = $o->user;
            $company = $user?->company;
            $tx = $o->transactions?->first();
            $moduleNames = is_array($o->module_ids) ? $o->module_ids : [];

            return [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'amount' => (int) $o->amount,
                'status' => $o->status,
                'created_at' => $o->created_at?->toISOString(),
                'package_name' => $o->package_name ?: (count($moduleNames) > 0 ? ('اشتراک (' . count($moduleNames) . ' ماژول)') : 'سفارش خدمات کارویتا'),
                'module_ids' => $moduleNames,
                'module_names' => $moduleNames,
                'user_id' => $o->user_id,
                'user_name' => trim(($user?->first_name ?? '') . ' ' . ($user?->last_name ?? '')) ?: ($user?->mobile ?? '—'),
                'mobile' => $user?->mobile ?? '—',
                'company_name' => $company?->name ?? '—',
                'transaction_status' => $tx?->status ?? ($o->status === 'paid' ? 'successful' : 'pending'),
                'reference_id' => $tx?->reference_id ?? '—',
                'tracking_code' => $tx?->authority ?? '—',
                'paid_at' => $tx?->paid_at ?? ($o->status === 'paid' ? $o->created_at?->toISOString() : null),
                'billing_period' => $o->billing_period ?? 'monthly',
                'user_count' => (int) ($o->user_count ?? 5),
            ];
        });

        return response()->json(['data' => $orders]);
    }

    public function updateOrderStatus(Request $request, $id) {
        $order = Order::findOrFail($id);
        $status = $request->input('status', 'paid');
        $referenceId = $request->input('reference_id', 'MAN-' . rand(10000000, 99999999));
        $previousStatus = $order->status;

        $order->status = $status;
        $order->save();

        if ($status === 'paid' || $status === 'completed') {
            $period = $order->billing_period ?? 'monthly';
            $userCount = (int) ($order->user_count ?? 5);
            $expires = $period === 'yearly' ? Carbon::now()->addYear() : Carbon::now()->addMonth();

            Subscription::create([
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'package_name' => $order->package_name ?? 'اشتراک سازمانی',
                'title' => $order->package_name ?? 'اشتراک سازمانی کارویتا',
                'status' => 'active',
                'source' => 'purchase',
                'module_ids' => $order->module_ids ?? ['accounting', 'crm', 'sales', 'warehouse'],
                'user_count' => $userCount,
                'billing_period' => $period,
                'starts_at' => Carbon::now(),
                'expires_at' => $expires,
            ]);
        }

        return response()->json([
            'message' => "وضعیت سفارش #{$order->order_number} با موفقیت به {$status} تغییر یافت.",
            'data' => $order
        ]);
    }

    public function getGatewaySettings() {
        $smsConfig = [
            'apiKey' => env('SMS_IR_API_KEY', 'ocv39CACg6Vg3cg3DbY3mUwfOti7dktYUwksl3jA3Jt1qI0z'),
            'lineNumber' => env('SMS_IR_LINE_NUMBER', '30007732'),
            'provider' => 'sms_ir',
            'enabled' => true,
            'auto_reminders_enabled' => true,
            'templates' => [
                'otp' => [
                    'id' => (int) env('SMS_IR_TEMPLATE_OTP', 418155),
                    'enabled' => true,
                    'title' => 'کد احراز هویت و ورود یکبار مصرف (OTP)',
                    'description' => 'ارسال فوری کد ورود ۵ رقمی کاربر با خطوط خدماتی بدون بلک‌لیست',
                    'pattern' => 'کد ورود شما به پنل کارویتا: #CODE#',
                    'required_params' => ['CODE'],
                ],
                'invoice_issued' => [
                    'id' => (int) env('SMS_IR_TEMPLATE_INVOICE', 418155),
                    'enabled' => true,
                    'title' => 'صدور پیش‌فاکتور جدید و سفارش خرید',
                    'description' => 'اطلاع‌رسانی صدور پیش‌فاکتور جدید و لینک تسویه حساب به کاربر',
                    'pattern' => 'کاربر گرامی #CUSTOMER#، پیش‌فاکتور سفارش ##ORDER# صادر شد.',
                    'required_params' => ['CODE'],
                ],
                'payment_success' => [
                    'id' => (int) env('SMS_IR_TEMPLATE_PAYMENT', 418155),
                    'enabled' => true,
                    'title' => 'تسویه موفق فاکتور و تایید تراکنش شاپرک',
                    'description' => 'ارسال شناسه پیگیری بانکی شاپرک و تایید فعال‌سازی سرویس پس از پرداخت آنلاین',
                    'pattern' => 'کاربر گرامی #CUSTOMER#، پرداخت فاکتور با شماره پیگیری #REF# تایید شد.',
                    'required_params' => ['CODE'],
                ],
            ]
        ];

        return response()->json([
            'zibal' => [
                'merchant' => env('ZIBAL_MERCHANT', 'zibal'),
                'sandbox' => (bool) env('ZIBAL_SANDBOX', true),
                'callback_url' => env('ZIBAL_CALLBACK_URL', '/api/payments/zibal/callback'),
                'enabled' => true,
            ],
            'sms' => $smsConfig,
            'logs' => [],
        ]);
    }

    public function testSms(Request $request) {
        $mobile = $request->input('mobile');
        if (!$mobile) {
            return response()->json(['success' => false, 'error' => 'شماره موبایل وارد نشده است.'], 422);
        }
        $code = (string) rand(10000, 99999);
        $sms = new \App\Services\SmsService();
        $result = $sms->sendOtp($mobile, $code);

        return response()->json($result);
    }

    public function getGatewayHealth() {
        $sms = new \App\Services\SmsService();
        $creditRes = $sms->checkCredit();

        return response()->json([
            'zibal' => [
                'status' => 'healthy',
                'merchant' => env('ZIBAL_MERCHANT', 'zibal'),
                'sandbox' => (bool) env('ZIBAL_SANDBOX', true),
                'message' => 'درگاه پرداخت شاپرک زیبال فعال است.',
            ],
            'sms' => [
                'status' => ($creditRes['success'] ?? false) ? 'healthy' : 'degraded',
                'provider' => 'SMS.ir (Fast Send REST v1)',
                'credit' => $creditRes['credit'] ?? 0,
                'message' => ($creditRes['success'] ?? false) ? 'اتصال به وب‌سرویس SMS.ir برقرار است.' : ($creditRes['error'] ?? 'خطا در ارتباط'),
            ]
        ]);
    }

    public function getSmsLogs() {
        return response()->json([
            'logs' => [],
            'count' => 0,
        ]);
    }

    public function subscriptions() {
        $subs = Subscription::with(['user.company'])->latest()->get()->map(function ($s) {
            $user = $s->user;
            $company = $user?->company;
            $moduleIds = is_array($s->module_ids) ? $s->module_ids : [];
            $userName = trim(($user?->first_name ?? '') . ' ' . ($user?->last_name ?? '')) ?: ($user?->mobile ?? '—');

            return [
                'id' => $s->id,
                'user_id' => $s->user_id,
                'title' => $s->title ?: ($s->package_name ?: 'اشتراک کارویتا'),
                'package_name' => $s->package_name ?: ($s->title ?: 'اشتراک کارویتا'),
                'source' => $s->source ?? 'purchase',
                'status' => $s->status ?? 'active',
                'billing_period' => $s->billing_period ?? 'monthly',
                'user_count' => (int) ($s->user_count ?? 1),
                'user_limit' => (int) ($s->user_limit ?? 1),
                'module_ids' => $moduleIds,
                'module_count' => count($moduleIds),
                'expires_at' => $s->expires_at?->toISOString() ?? $s->expires_at,
                'created_at' => $s->created_at?->toISOString() ?? $s->created_at,
                'starts_at' => $s->starts_at ?? $s->created_at,
                'mobile' => $user?->mobile ?? '—',
                'user_name' => $userName,
                'company_name' => $company?->name ?? '—',
            ];
        });

        return response()->json(['data' => $subs, 'subscriptions' => $subs]);
    }

    public function updateSubscriptionStatus(Request $request, $id = null) {
        $subId = (int) ($id ?: $request->input('id'));
        $status = in_array($request->input('status'), ['active', 'expired', 'cancelled']) ? $request->input('status') : 'cancelled';

        $sub = Subscription::findOrFail($subId);
        $sub->status = $status;
        $sub->save();

        return response()->json(['success' => true, 'message' => 'وضعیت اشتراک با موفقیت بروزرسانی شد.', 'subscription' => $sub]);
    }

    public function subscriptionDetails($id) {
        $sub = Subscription::with(['user.company'])->find($id);
        if (!$sub) {
            return response()->json(['error' => true, 'message' => 'اشتراک مورد نظر یافت نشد.'], 404);
        }
        return response()->json(['subscription' => $sub, 'data' => $sub]);
    }

    public function updateSubscriptionModules(Request $request, $id) {
        $sub = Subscription::findOrFail($id);
        $modules = $request->input('module_ids', []);
        $sub->module_ids = is_array($modules) ? $modules : [];
        $sub->save();
        return response()->json(['success' => true, 'message' => 'ماژول‌های اشتراک با موفقیت بروزرسانی شد.', 'subscription' => $sub]);
    }

    public function createDirectSubscription(Request $request, $userId) {
        $user = User::findOrFail($userId);
        $days = (int) ($request->input('days', 30));
        $sub = Subscription::create([
            'user_id' => $user->id,
            'title' => $request->input('title', 'اشتراک اعطایی مدیر'),
            'package_name' => $request->input('package_name', 'اشتراک اعطایی مدیر'),
            'source' => $request->input('source', 'admin'),
            'status' => 'active',
            'billing_period' => $request->input('billing_period', 'monthly'),
            'user_count' => (int) $request->input('user_count', 5),
            'user_limit' => (int) $request->input('user_limit', 5),
            'module_ids' => $request->input('module_ids', []),
            'starts_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addDays($days),
        ]);
        return response()->json(['success' => true, 'message' => 'اشتراک با موفقیت برای کاربر ثبت گردید.', 'subscription' => $sub], 201);
    }

    public function updateUserSubscriptionModules(Request $request, $userId, $subId) {
        $sub = Subscription::where('id', $subId)->where('user_id', $userId)->firstOrFail();
        $modules = $request->input('module_ids', []);
        $sub->module_ids = is_array($modules) ? $modules : [];
        $sub->save();
        return response()->json(['success' => true, 'message' => 'ماژول‌های اشتراک کاربر با موفقیت تغییر کرد.', 'subscription' => $sub]);
    }

    public function userDetails($id) {
        $user = User::find($id);
        $company = Company::where('user_id', $id)->first();
        $subs = Subscription::where('user_id', $id)->latest()->get();
        $orders = Order::where('user_id', $id)->latest()->get();

        return response()->json([
            'user' => $user,
            'company' => $company,
            'subscriptions' => $subs,
            'orders' => $orders,
            'all_available_modules' => []
        ]);
    }
}
