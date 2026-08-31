<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department;
use App\Models\PricingModule;

class DatabaseSeeder extends Seeder {
    public function run(): void {
        // Super Admin
        User::firstOrCreate(
            ['mobile' => '09111273476'],
            [
                'name' => 'اردلان داوودی',
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // Departments
        Department::insertOrIgnore([
            ['id' => 1, 'name' => 'پشتیبانی فنی و سامانه', 'description' => 'پاسخگویی به مشکلات عملکردی و فنی نرم‌افزار'],
            ['id' => 2, 'name' => 'واحد فروش و تمدید اشتراک', 'description' => 'مشاوره خرید، ارتقا پلن‌ها و فاکتورها'],
            ['id' => 3, 'name' => 'امور مالی و حسابداری', 'description' => 'پیگیری تراکنش‌ها، صورت‌حساب‌ها و واریزها'],
            ['id' => 4, 'name' => 'مدیریت و شکایات', 'description' => 'ارتباط مستقیم با مدیریت سامانه کارویتا'],
        ]);

        // Pricing Modules
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
    }
}
