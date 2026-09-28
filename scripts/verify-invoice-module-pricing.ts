import { generateOfficialTaxInvoiceHtml, generateOfficialContractHtml } from '../server/taxInvoiceService';
import { db } from '../server/db';
import assert from 'assert';

console.log('=== بررسی صحت صدور فاکتور رسمی و قرارداد برای خرید ماژول جدید ===\n');

const user = db.users[0];
const company = db.getCompanyByUserId(user.id);
const modulesList = db.erpModules.map(m => ({ id: m.id, title: m.title, price: m.price, category: m.category }));

// شبیه‌سازی خرید ماژول جدید مشابه اسکرین‌شات کاربر (سفارش ORD-20260920-6412 به مبلغ ۱،۳۲۰،۰۰۰ تومان)
const addonOrder = {
  id: 35,
  order_number: 'ORD-20260920-6412',
  amount: 1320000,
  final_amount: 1320000,
  subtotal: 1200000,
  order_type: 'resource_upgrade',
  is_resource_addon: true,
  module_ids: ['crm'],
  billing_period: 'yearly',
  user_count: 1,
  status: 'completed',
  is_paid: true,
  tracking_code: 'ZBL-1789901684-4064',
  created_at: '2026-09-20T08:30:00.000Z'
};

const tx = {
  id: 37,
  order_id: 35,
  amount: 1320000,
  status: 'successful',
  reference_id: 'ZBL-1789901684-4064',
  tracking_code: '4797979099',
  paid_at: '2026-09-20T08:31:00.000Z'
};

// 1. تولید فاکتور رسمی
const invoiceHtml = generateOfficialTaxInvoiceHtml({
  order: addonOrder,
  tx,
  user,
  company,
  modulesList,
  isPaid: true
});

assert(invoiceHtml.includes('۱٬۳۲۰٬۰۰۰'), 'مبلغ نهایی فاکتور باید ۱٬۳۲۰٬۰۰۰ تومان باشد');
assert(invoiceHtml.includes('۱٬۲۰۰٬۰۰۰'), 'مبلغ پایه مشمول مالیات باید ۱٬۲۰۰٬۰۰۰ تومان باشد');
assert(invoiceHtml.includes('۱۲۰٬۰۰۰'), 'مالیات بر ارزش افزوده باید ۱۲۰٬۰۰۰ تومان باشد');
assert(invoiceHtml.includes('مدیریت ارتباط با مشتری'), 'عنوان ماژول خریداری‌شده باید در ردیف فاکتور وجود داشته باشد');
assert(!invoiceHtml.includes('<td style="text-align:left; font-family:monospace; font-weight:bold;">۰</td>'), 'هیچ سطری در جدول اقلام نباید قیمت ۰ داشته باشد');

assert(invoiceHtml.includes('معماران رشد و تحول کسب و کار (کارویتا)'), 'نام فروشنده باید معماران رشد و تحول کسب و کار (کارویتا) باشد');
assert(invoiceHtml.includes('شماره رهگیری:'), 'عنوان شماره رهگیری باید در مشخصات فروشنده باشد');
assert(invoiceHtml.includes('۳۸۸۰۳۵۴۵۳۶'), 'شماره رهگیری فروشنده باید ۳۸۸۰۳۵۴۵۳۶ باشد');
assert(invoiceHtml.includes('۱۰۵۰۶'), 'شماره ثبت باید ۱۰۵۰۶ باشد');
assert(invoiceHtml.includes('۴۷۱۳۹۹۸۵۷۱'), 'کد پستی باید ۴۷۱۳۹۹۸۵۷۱ باشد');
assert(invoiceHtml.includes('مازندران / بابل'), 'استان / شهر باید مازندران / بابل باشد');
assert(invoiceHtml.includes('خیابان نواب صفوی - اشرفی۲۷ - پلاک 5'), 'نشانی باید خیابان نواب صفوی - اشرفی۲۷ - پلاک 5 باشد');
assert(invoiceHtml.includes('01132250771') || invoiceHtml.includes('۰۱۱۳۲۲۵۰۷۷۱'), 'تلفن باید 01132250771 باشد');
assert(invoiceHtml.includes('info@karovota.ir'), 'ایمیل باید info@karovota.ir باشد');
assert(!invoiceHtml.includes('کد مودیان:'), 'کد مودیان باید از مشخصات فروشنده حذف شده باشد');

console.log('✅ ۱. فاکتور رسمی برای خرید ماژول جدید با موفقیت تولید شد و مبالغ ناخالص (۱٬۲۰۰٬۰۰۰)، مالیات (۱۲۰٬۰۰۰) و نهایی (۱٬۳۲۰٬۰۰۰) کاملاً دقیق است.');

// 2. تولید قرارداد رسمی
const contractHtml = generateOfficialContractHtml({
  order: addonOrder,
  tx,
  user,
  company,
  modulesList
});

assert(contractHtml.includes('۱٬۳۲۰٬۰۰۰'), 'مبلغ قرارداد باید ۱٬۳۲۰٬۰۰۰ تومان باشد');
assert(contractHtml.includes('مدیریت ارتباط با مشتری'), 'عنوان ماژول باید در قرارداد درج شده باشد');

console.log('✅ ۲. قرارداد رسمی لایسنس برای خرید ماژول با مشخصات و قیمت صحیح صادر شد.');

// 3. شبیه‌سازی خرید ماژول با module_ids به صورت استرینگ JSON (همانند دیتابیس MySQL)
const orderJsonMods = {
  ...addonOrder,
  module_ids: '["crm"]'
};
const invoiceJsonModsHtml = generateOfficialTaxInvoiceHtml({
  order: orderJsonMods,
  tx,
  user,
  company,
  modulesList,
  isPaid: true
});
assert(invoiceJsonModsHtml.includes('۱٬۳۲۰٬۰۰۰'), 'در صورت دریافت module_ids به عنوان JSON استرینگ، فاکتور نباید کرش کند و باید مبلغ درست باشد');
console.log('✅ ۳. سازگاری کامل با module_ids از جنس JSON string در دیتابیس MySQL برقرار است.');

// 4. تست خرید ماژولی که در کاتالوگ قیمت آن ۰ ثبت شده یا وابستگی دارد (مانند contacts)
const orderZeroCat = {
  ...addonOrder,
  module_ids: ['contacts']
};
const invoiceZeroCatHtml = generateOfficialTaxInvoiceHtml({
  order: orderZeroCat,
  tx,
  user,
  company,
  modulesList,
  isPaid: true
});
assert(invoiceZeroCatHtml.includes('۱٬۳۲۰٬۰۰۰'), 'فاکتور ماژول حتی اگر قیمت در کاتالوگ صفر باشد، مبلغ پرداختی کاربر را نشان می‌دهد');
assert(!invoiceZeroCatHtml.includes('<td style="text-align:left; font-family:monospace; font-weight:bold;">۰</td>'), 'سطر کالا نباید ۰ نشان دهد');
console.log('✅ ۴. ماژول‌هایی با قیمت کاتالوگی صفر در فاکتور رسمی بر اساس مبلغ واقعی پرداختی خریدار سرشکن شده و هرگز عدد صفر نشان داده نمی‌شود.');

console.log('\n🎉 کلیه تست‌های اعتبارسنجی با موفقیت ۱۰۰٪ پاس شدند!');
