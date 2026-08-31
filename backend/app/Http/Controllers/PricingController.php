<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PricingModule;

class PricingController extends Controller {
    public function getModules() {
        $modules = PricingModule::where('is_active', true)->get();
        if ($modules->isEmpty()) {
            $defaultModules = [
                ['id' => 'crm', 'title' => 'مدیریت ارتباط با مشتریان (CRM)', 'category' => 'sales', 'price' => 290000, 'is_active' => true, 'description' => 'پایگاه اطلاعاتی مشتریان، پرونده فروش و پیگیری تعاملات'],
                ['id' => 'sales', 'title' => 'فروش و پیش‌فاکتور آنلاین', 'category' => 'sales', 'price' => 320000, 'is_active' => true, 'description' => 'صدور فاکتور و پیش‌فاکتور رسمی، لینک پرداخت آنلاین و مالیات'],
                ['id' => 'accounting', 'title' => 'حسابداری و خزانه‌داری ابری', 'category' => 'finance', 'price' => 450000, 'is_active' => true, 'description' => 'اسناد دوبل، ترازنامه، سود و زیان و گزارشات فصلی'],
                ['id' => 'warehouse', 'title' => 'انبارداری و کنترل موجودی', 'category' => 'logistics', 'price' => 380000, 'is_active' => true, 'description' => 'حواله، رسید انبار، نقطه سفارش و کاردکس کالا'],
                ['id' => 'hrm', 'title' => 'پرسنلی و حقوق و دستمزد', 'category' => 'hr', 'price' => 350000, 'is_active' => true, 'description' => 'احکام پرسنلی، تردد، فیش حقوقی و لیست بیمه'],
                ['id' => 'production', 'title' => 'برنامه‌ریزی تولید و ساخت (BOM)', 'category' => 'production', 'price' => 520000, 'is_active' => true, 'description' => 'فرمول ساخت کالا، کنترل خط تولید و بهای تمام‌شده'],
                ['id' => 'purchasing', 'title' => 'خرید و تدارکات سازمانی', 'category' => 'logistics', 'price' => 280000, 'is_active' => true, 'description' => 'درخواست خرید، استعلام قیمت، ارزیابی تامین‌کنندگان'],
                ['id' => 'tasks', 'title' => 'مدیریت وظایف و پروژه‌ها (Task)', 'category' => 'management', 'price' => 240000, 'is_active' => true, 'description' => 'بردهای کانبان، تخصیص وظیفه، ثبت تایم‌شیت و گانت‌چارت'],
            ];

            foreach ($defaultModules as $dm) {
                PricingModule::updateOrCreate(['id' => $dm['id']], $dm);
            }
            $modules = PricingModule::where('is_active', true)->get();
        }

        return response()->json(['data' => $modules]);
    }

    public function adminPricing() {
        $modules = PricingModule::all();
        return response()->json(['data' => $modules]);
    }

    public function saveAdminPricing(Request $request) {
        $modules = $request->input('modules', []);
        foreach ($modules as $m) {
            if (!empty($m['id'])) {
                PricingModule::updateOrCreate(
                    ['id' => $m['id']],
                    [
                        'title' => $m['title'] ?? '',
                        'price' => (int) ($m['price'] ?? 0),
                        'category' => $m['category'] ?? 'general',
                        'is_active' => (bool) ($m['is_active'] ?? true),
                        'description' => $m['description'] ?? '',
                    ]
                );
            }
        }
        return response()->json(['message' => 'تعرفه‌ها با موفقیت ذخیره شدند']);
    }
}
