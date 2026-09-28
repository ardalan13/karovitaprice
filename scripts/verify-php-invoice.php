<?php
require_once __DIR__ . '/../backend/taxInvoiceHelper.php';

if (!function_exists('gregorian_to_jalali')) {
    function gregorian_to_jalali($gy, $gm, $gd) { return [1405, 6, 29]; }
}
if (!function_exists('numberToWordsPersian')) {
    function numberToWordsPersian($num) { return 'یک میلیون و سیصد و بیست هزار تومان'; }
}
if (!function_exists('getDefaultModules')) {
    function getDefaultModules() {
        return [
            ['id' => 'crm', 'title' => 'مدیریت ارتباط با مشتری (CRM)', 'price' => 350000],
            ['id' => 'account', 'title' => 'حسابداری', 'price' => 300000],
            ['id' => 'contacts', 'title' => 'مخاطبان', 'price' => 0],
        ];
    }
}

$order = [
    'id' => 35,
    'order_number' => 'ORD-20260920-6412',
    'amount' => 1320000,
    'final_amount' => 1320000,
    'subtotal' => 1200000,
    'order_type' => 'resource_upgrade',
    'is_resource_addon' => 1,
    'module_ids' => '["crm"]',
    'billing_period' => 'yearly',
    'status' => 'completed',
    'is_paid' => 1
];

$tx = [
    'id' => 37,
    'order_id' => 35,
    'amount' => 1320000,
    'status' => 'successful',
    'reference_id' => 'ZBL-1789901684-4064'
];

$company = [
    'company_name' => 'شرکت توسعه ابری',
    'national_id' => '10101010101',
    'economic_code' => '4111111111'
];

$html = renderOfficialTaxInvoiceHtml($order, $tx, $company);

assert(strpos($html, '1,320,000') !== false, 'PHP invoice must have 1,320,000');
assert(strpos($html, '1,200,000') !== false, 'PHP invoice must have 1,200,000');
assert(strpos($html, '120,000') !== false, 'PHP invoice must have 120,000');
assert(strpos($html, 'مدیریت ارتباط با مشتری') !== false, 'PHP invoice must have CRM title');
assert(strpos($html, 'ORD-20260920-6412') !== false, 'PHP invoice must have order number');
assert(strpos($html, 'معماران رشد و تحول کسب و کار (کارویتا)') !== false, 'نام فروشنده باید معماران رشد و تحول کسب و کار (کارویتا) باشد');
assert(strpos($html, 'شماره رهگیری:') !== false, 'عنوان شماره رهگیری باید در مشخصات فروشنده باشد');
assert(strpos($html, '3880354536') !== false, 'شماره رهگیری فروشنده باید 3880354536 باشد');
assert(strpos($html, '10506') !== false, 'شماره ثبت باید 10506 باشد');
assert(strpos($html, '4713998571') !== false, 'کد پستی باید 4713998571 باشد');
assert(strpos($html, 'مازندران / بابل') !== false, 'استان / شهر باید مازندران / بابل باشد');
assert(strpos($html, 'خیابان نواب صفوی - اشرفی۲۷ - پلاک 5') !== false, 'نشانی باید خیابان نواب صفوی - اشرفی۲۷ - پلاک 5 باشد');
assert(strpos($html, '01132250771') !== false, 'تلفن باید 01132250771 باشد');
assert(strpos($html, 'info@karovota.ir') !== false, 'ایمیل باید info@karovota.ir باشد');
assert(strpos($html, 'کد مودیان:') === false, 'کد مودیان باید از مشخصات فروشنده حذف شده باشد');


echo "PHP INVOICE VERIFICATION PASSED 100%!\n";
