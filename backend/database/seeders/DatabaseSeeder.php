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

        // Pricing Modules - Full Suite of Odoo 18 Modules with simple single-term Persian names
        $odoo18Modules = [
            ['id' => 'mail', 'title' => 'گفتگو', 'category' => 'productivity', 'price' => 180000, 'is_active' => true, 'description' => 'پیام‌رسان داخلی، کانال‌های گفتگو و ارتباط بین پرسنل'],
            ['id' => 'calendar', 'title' => 'گاهشمار', 'category' => 'productivity', 'price' => 160000, 'is_active' => true, 'description' => 'تقویم کاری، زمان‌بندی جلسات و یادآوری رویدادها'],
            ['id' => 'activities', 'title' => 'اقدامات و پیگیری ها', 'category' => 'management', 'price' => 190000, 'is_active' => true, 'description' => 'ثبت وظایف روزانه، پیگیری امور و یادآور تماس‌ها'],
            ['id' => 'survey', 'title' => 'فرم ساز', 'category' => 'marketing', 'price' => 210000, 'is_active' => true, 'description' => 'ساخت انواع فرم‌های سفارشی، پرسشنامه و جمع‌آوری داده'],
            ['id' => 'contacts', 'title' => 'مخاطبان', 'category' => 'sales', 'price' => 180000, 'is_active' => true, 'description' => 'دفترچه تلفن یکپارچه و پرونده مشخصات اشخاص و شرکت‌ها'],
            ['id' => 'crm', 'title' => 'crm', 'category' => 'sales', 'price' => 290000, 'is_active' => true, 'description' => 'مدیریت ارتباط با مشتریان و رهگیری خط لوله فرصت‌های فروش'],
            ['id' => 'sale', 'title' => 'فروش', 'category' => 'sales', 'price' => 320000, 'is_active' => true, 'description' => 'صدور پیش‌فاکتور، سفارشات فروش، امضای الکترونیک و نرخ‌نامه'],
            ['id' => 'account', 'title' => 'حسابداری', 'category' => 'finance', 'price' => 450000, 'is_active' => true, 'description' => 'اسناد دوبل، تراز آزمایشی، سود و زیان، دفاتر مالی و استهلاک'],
            ['id' => 'project', 'title' => 'پروژه', 'category' => 'management', 'price' => 280000, 'is_active' => true, 'description' => 'مدیریت پروژه‌ها، بردهای کانبان، نمودار گانت و مایل‌استون‌ها'],
            ['id' => 'hr', 'title' => 'کارمندان', 'category' => 'hr', 'price' => 220000, 'is_active' => true, 'description' => 'پرونده الکترونیک پرسنل، چارت سازمانی و مهارت‌های فردی'],
            ['id' => 'hr_attendance', 'title' => 'حضور و غیاب', 'category' => 'hr', 'price' => 210000, 'is_active' => true, 'description' => 'ثبت ورود و خروج، محاسبه اضافه‌کاری و کسر کار پرسنل'],
            ['id' => 'hr_recruitment', 'title' => 'استخدام', 'category' => 'hr', 'price' => 260000, 'is_active' => true, 'description' => 'پایگاه کارجویان، مصاحبه‌های استخدامی و گردش جذب نیرو'],
            ['id' => 'hr_holidays', 'title' => 'مرخصی', 'category' => 'hr', 'price' => 240000, 'is_active' => true, 'description' => 'ثبت و گردش تایید مرخصی استحقاقی، استعلاجی و ماموریت'],
            ['id' => 'hr_contract', 'title' => 'قرارداد کارمند', 'category' => 'hr', 'price' => 230000, 'is_active' => true, 'description' => 'احکام اداری، ثبت قراردادهای استخدامی و تاریخ‌های تمدید'],
            ['id' => 'hr_payroll', 'title' => 'حقوق و دستمزد', 'category' => 'hr', 'price' => 360000, 'is_active' => true, 'description' => 'محاسبه فیش حقوقی مطابق قانون کار، دیسکت بیمه و فایل بانکی'],
            ['id' => 'barcode', 'title' => 'بارکد', 'category' => 'logistics', 'price' => 220000, 'is_active' => true, 'description' => 'اسکنر بارکدخوان پرتابل برای ورود کالا، انبارگردانی و خروج بار'],
            ['id' => 'survey_feedback', 'title' => 'نظرسنجی ها', 'category' => 'marketing', 'price' => 190000, 'is_active' => true, 'description' => 'پرسشنامه‌های آنلاین و سنجش سطح رضایت مشتریان و پرسنل'],
            ['id' => 'appointment', 'title' => 'قرار ملاقات', 'category' => 'productivity', 'price' => 230000, 'is_active' => true, 'description' => 'لینک تقویم شخصی جهت رزرو آنلاین وقت و جلسه توسط مشتریان'],
            ['id' => 'im_livechat', 'title' => 'چت انلاین', 'category' => 'marketing', 'price' => 220000, 'is_active' => true, 'description' => 'ابزارک گفتگوی زنده با کاربران و مشتریان روی وب‌سایت'],
            ['id' => 'marketing_automation', 'title' => 'اتوماسیون بازاریابی', 'category' => 'marketing', 'price' => 330000, 'is_active' => true, 'description' => 'طراحی مسیر تعامل خودکار، پیام‌های مناسبتی و پیگیری سرنخ‌ها'],
            ['id' => 'fleet', 'title' => 'ناوگان', 'category' => 'hr', 'price' => 230000, 'is_active' => true, 'description' => 'پرونده خودروها، سوابق بیمه، مصرف سوخت و رانندگان سازمانی'],
            ['id' => 'planning', 'title' => 'برنامه ریزی', 'category' => 'management', 'price' => 250000, 'is_active' => true, 'description' => 'زمان‌بندی شیفت‌های کاری، تخصیص نیروها و تقویم تیمی'],
            ['id' => 'event', 'title' => 'رویداد', 'category' => 'marketing', 'price' => 270000, 'is_active' => true, 'description' => 'مدیریت وبینارها، همایش‌ها، ثبت‌نام و بلیت‌فروشی'],
            ['id' => 'knowledge', 'title' => 'دانش', 'category' => 'productivity', 'price' => 210000, 'is_active' => true, 'description' => 'پایگاه دانش سازمانی، راهنماهای آموزشی و ویکی مستندات تیمی'],
            ['id' => 'maintenance', 'title' => 'نگهداری', 'category' => 'production', 'price' => 290000, 'is_active' => true, 'description' => 'تعمیرات دوره‌ای پیشگیرانه (PM) و خرابی ماشین‌آلات فنی'],
            ['id' => 'documents', 'title' => 'اسناد', 'category' => 'productivity', 'price' => 290000, 'is_active' => true, 'description' => 'آرشیو امن ابری مدارک، پوشه‌بندی سازمانی و شناسایی اسناد'],
            ['id' => 'hr_timesheet', 'title' => 'برگه ساعت کارکرد', 'category' => 'management', 'price' => 220000, 'is_active' => true, 'description' => 'ثبت کارکرد ساعتی پرسنل بر روی تسک‌ها و کنترل راندمان'],
            ['id' => 'hr_expense', 'title' => 'هزینه ها', 'category' => 'finance', 'price' => 220000, 'is_active' => true, 'description' => 'ثبت فاکتورهای تنخواه، هزینه‌های جاری اداری و تاییدات مدیران'],
            ['id' => 'purchase', 'title' => 'خرید', 'category' => 'logistics', 'price' => 280000, 'is_active' => true, 'description' => 'درخواست استعلام قیمت، سفارش خرید سازمانی و ارزیابی تامین‌کننده'],
            ['id' => 'stock', 'title' => 'انبار', 'category' => 'logistics', 'price' => 380000, 'is_active' => true, 'description' => 'کاردکس کالا، کنترل موجودی چندانباره و نقطه سفارش خودکار'],
            ['id' => 'mrp', 'title' => 'تولید', 'category' => 'production', 'price' => 520000, 'is_active' => true, 'description' => 'فرمول ساخت کالا (BOM)، سفارشات کارگاهی و بهای تمام‌شده'],
            ['id' => 'pos', 'title' => 'صندوق', 'category' => 'sales', 'price' => 390000, 'is_active' => true, 'description' => 'صندوق فروشگاهی لمسی، بارکدخوان، پوز بانکی و کارکرد آفلاین'],
            ['id' => 'account_invoicing', 'title' => 'فاکتور', 'category' => 'finance', 'price' => 280000, 'is_active' => true, 'description' => 'صدور پیش‌فاکتور و فاکتور رسمی، لینک پرداخت و مالیات'],
            ['id' => 'account_budget', 'title' => 'بودجه', 'category' => 'finance', 'price' => 260000, 'is_active' => true, 'description' => 'بودجه‌بندی فصلی، کنترل هزینه‌های واقعی و گزارش انحراف'],
            ['id' => 'website', 'title' => 'وب‌سایت', 'category' => 'marketing', 'price' => 260000, 'is_active' => true, 'description' => 'صفحه‌ساز بصری درگ‌اند‌دراپ، سئو پیشرفته و وبلاگ سازمانی'],
            ['id' => 'website_sale', 'title' => 'فروشگاه', 'category' => 'marketing', 'price' => 390000, 'is_active' => true, 'description' => 'فروشگاه آنلاین کالا با درگاه پرداخت شاپرک و اتصال به انبار'],
            ['id' => 'sign', 'title' => 'امضا', 'category' => 'productivity', 'price' => 270000, 'is_active' => true, 'description' => 'امضای امن دیجیتالی اسناد، فرم‌ها و قراردادهای شرکتی'],
            ['id' => 'helpdesk', 'title' => 'پشتیبانی', 'category' => 'management', 'price' => 320000, 'is_active' => true, 'description' => 'میز خدمت، پورتال تیکت مشتریان و زمان‌بندی پاسخگویی SLA'],
            ['id' => 'field_service', 'title' => 'خدمات در محل', 'category' => 'management', 'price' => 390000, 'is_active' => true, 'description' => 'اعزام تکنسین فنی روی نقشه، ثبت قطعات و امضای مشتری'],
            ['id' => 'quality_control', 'title' => 'کنترل کیفیت', 'category' => 'production', 'price' => 310000, 'is_active' => true, 'description' => 'آزمون‌های استاندارد در خط تولید، انبار ورودی و گزارش عدم انطباق'],
            ['id' => 'voip', 'title' => 'تلفن ابری', 'category' => 'productivity', 'price' => 340000, 'is_active' => true, 'description' => 'اتصال به سانترال و تلفن اینترنتی با پاپ‌آپ پرونده مشتری'],
            ['id' => 'iot', 'title' => 'اینترنت اشیا', 'category' => 'productivity', 'price' => 380000, 'is_active' => true, 'description' => 'اتصال سخت‌افزارهای ترازو، بارکدخوان و سنسورهای صنعتی خط تولید'],
            ['id' => 'ai_assistant', 'title' => 'هوش مصنوعی', 'category' => 'productivity', 'price' => 420000, 'is_active' => true, 'description' => 'نگارش هوشمند متون، تحلیل روند فروش و پیش‌بینی تقاضا'],
            ['id' => 'mass_mailing', 'title' => 'ایمیل مارکتینگ', 'category' => 'marketing', 'price' => 220000, 'is_active' => true, 'description' => 'ارسال ایمیل‌های تبلیغاتی انبوه، بخش‌بندی و گزارش نرخ بازگشایی'],
            ['id' => 'mass_mailing_sms', 'title' => 'پیامک', 'category' => 'marketing', 'price' => 240000, 'is_active' => true, 'description' => 'سامانه ارسال پیامک انبوه اطلاع‌رسانی، تخفیف و مناسبتی'],
            ['id' => 'loyalty', 'title' => 'باشگاه مشتریان', 'category' => 'sales', 'price' => 240000, 'is_active' => true, 'description' => 'امتیاز خرید، بن‌های هدیه، کوپن تخفیف و کارت وفاداری'],
            ['id' => 'sale_subscription', 'title' => 'اشتراک', 'category' => 'sales', 'price' => 310000, 'is_active' => true, 'description' => 'صدور صورت‌حساب دوره‌ای، قراردادهای آبونمان و تمدید خودکار'],
            ['id' => 'sale_renting', 'title' => 'اجاره', 'category' => 'sales', 'price' => 290000, 'is_active' => true, 'description' => 'قراردادهای کرایه کالا، تقویم تحویل و عودت و بیمه تجهیزات'],
        ];

        foreach ($odoo18Modules as $mod) {
            PricingModule::updateOrCreate(
                ['id' => $mod['id']],
                $mod
            );
        }
    }
}
