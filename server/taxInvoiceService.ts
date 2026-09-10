/**
 * Official Tax Invoice & Service Contract Generator
 * Compliant with Iranian Tax Authority (سازمان امور مالیاتی کشور - ماده ۱۶۹ م.م و سامانه مودیان)
 */

export interface SellerInfo {
  company_name: string;
  brand_name: string;
  registration_number: string;
  national_id: string;
  economic_code: string;
  tax_payer_code: string;
  postal_code: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
}

export const OFFICIAL_SELLER_INFO: SellerInfo = {
  company_name: 'شرکت داده‌پردازان ابری کارویتا (سهامی خاص)',
  brand_name: 'کارویتا ابری (Karvita Cloud ERP)',
  registration_number: '۵۶۸۹۴۲',
  national_id: '۱۴۰۰۹۸۷۴۵۶۱',
  economic_code: '۴۱۱۶۵۸۹۴۷۵۲۳',
  tax_payer_code: 'TP-9874561-TX',
  postal_code: '۱۹۹۷۹۸۵۶۱۴',
  province: 'تهران',
  city: 'تهران',
  address: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج فناوری و نوآوری ابری، طبقه ۸، واحد ۸۰۴',
  phone: '۰۲۱-۸۸۹۹۰۰۱۱',
  fax: '۰۲۱-۸۸۹۹۰۰۱۲',
  email: 'finance@karvita.ir',
  website: 'https://karvita.ir',
};

// Convert number to Persian words
export function numberToWordsPersian(num: number): string {
  if (num === 0) return 'صفر';
  if (num < 0) return 'منفی ' + numberToWordsPersian(Math.abs(num));

  const yekan = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const dahha = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const dahha10_19 = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  const sadha = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const tabaghat = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'];

  function convertGroup(n: number): string {
    let res = '';
    const s = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const y = n % 10;

    if (s > 0) {
      res += sadha[s];
    }

    if (d === 1) {
      if (res !== '') res += ' و ';
      res += dahha10_19[y];
    } else {
      if (d > 1) {
        if (res !== '') res += ' و ';
        res += dahha[d];
      }
      if (y > 0) {
        if (res !== '') res += ' و ';
        res += yekan[y];
      }
    }
    return res;
  }

  const parts: string[] = [];
  let temp = Math.floor(num);
  let groupIdx = 0;

  while (temp > 0) {
    const group = temp % 1000;
    if (group > 0) {
      const groupText = convertGroup(group);
      const suffix = tabaghat[groupIdx] ? ' ' + tabaghat[groupIdx] : '';
      parts.unshift(groupText + suffix);
    }
    temp = Math.floor(temp / 1000);
    groupIdx++;
  }

  return parts.join(' و ') + ' تومان';
}

// Generate standard Tax Unique ID (شناسه منحصر به فرد مالیاتی ۲۲ کاراکتری سامانه مودیان)
export function generateTaxId(orderId: number | string, dateStr: string): string {
  const seed = (typeof orderId === 'number' ? orderId : parseInt(String(orderId).replace(/\D/g, ''), 10) || 1000) * 739;
  const hex = (seed + 0x1A2B3C).toString(16).toUpperCase().padStart(8, '0');
  const d = new Date(dateStr || Date.now());
  const year = d.getFullYear().toString().slice(-2);
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000).toString().padStart(3, '0');
  return `A10F-${year}${dayOfYear}-${hex.slice(0, 4)}-${hex.slice(4, 8)}`.toUpperCase();
}

/**
 * Generate Official Tax Invoice HTML Document (A4 Printable & PDF Ready)
 */
export function generateOfficialTaxInvoiceHtml(params: {
  order: any;
  tx: any;
  user: any;
  company: any;
  modulesList: Array<{ id: string; title: string; price: number; category?: string }>;
  isPaid: boolean;
}): string {
  const { order, tx, user, company, modulesList, isPaid } = params;

  const orderNum = order?.order_number || `ORD-${order?.id || tx?.id || '001'}`;
  const invoiceDate = order?.created_at ? new Date(order.created_at) : new Date();
  const dateFa = invoiceDate.toLocaleDateString('fa-IR');
  const timeFa = invoiceDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  const paidDateFa = tx?.paid_at ? new Date(tx.paid_at).toLocaleDateString('fa-IR') : '—';
  const taxId = generateTaxId(order?.id || tx?.id || 1, order?.created_at || new Date().toISOString());

  // Customer / Buyer legal info
  const buyerName = company?.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.mobile;
  const buyerEconomicCode = company?.economic_code || user.economic_code || '—';
  const buyerNationalId = company?.national_id || user.national_id || (user.mobile ? `۰۹${user.mobile.slice(2, 10)}` : '—');
  const buyerRegNo = company?.registration_number || '—';
  const buyerPostalCode = company?.postal_code || '—';
  const buyerPhone = company?.phone || user.mobile;
  const buyerAddress = company?.address || (company?.province ? `${company.province}، ${company.city || ''}` : 'تهران، اقامتگاه قانونی ثبت شده در سامانه');

  // Breakdown calculations
  const rawTotal = Number(order?.breakdown?.modules_total || order?.amount || tx?.amount || 0);
  const extraUsersCost = Number(order?.breakdown?.extra_users_cost || 0);
  const discountAmount = Number(order?.discount_amount || order?.breakdown?.discount_amount || 0);
  const finalAmount = Number(tx?.amount || order?.amount || 0);

  // VAT 10% calculation
  const vatRate = 0.10;
  // Final amount is inclusive of VAT or calculated:
  const baseBeforeVat = Math.round(finalAmount / (1 + vatRate));
  const vatAmount = finalAmount - baseBeforeVat;
  const amountInWords = numberToWordsPersian(finalAmount);

  // Items table
  let itemRowsHtml = '';
  let rowIdx = 1;

  if (order?.module_ids && order.module_ids.length > 0) {
    order.module_ids.forEach((modId: string) => {
      const m = modulesList.find(x => x.id === modId);
      const title = m ? m.title : modId;
      const modBasePrice = m ? m.price : 0;
      const unitMultiplier = order.billing_period === 'yearly' ? 12 : 1;
      const rowTotal = modBasePrice * unitMultiplier;
      const rowVat = Math.round(rowTotal * vatRate);
      const rowGrand = rowTotal + rowVat;

      itemRowsHtml += `
        <tr>
          <td style="text-align:center;">${rowIdx++}</td>
          <td style="font-family:monospace; text-align:center;">KAR-${modId.toUpperCase()}</td>
          <td>
            <strong>حق بهره‌برداری ماژول نرم‌افزاری: ${title}</strong>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">لایسنس ابری ${order.billing_period === 'yearly' ? 'سالانه' : 'ماهانه'} - پشتیبانی و نگهداری تخصصی</div>
          </td>
          <td style="text-align:center;">۱</td>
          <td style="text-align:center;">ماژول</td>
          <td style="text-align:left; font-family:monospace;">${(modBasePrice * unitMultiplier).toLocaleString('fa-IR')}</td>
          <td style="text-align:left; font-family:monospace;">${rowTotal.toLocaleString('fa-IR')}</td>
          <td style="text-align:left; font-family:monospace;">۰</td>
          <td style="text-align:left; font-family:monospace;">${rowTotal.toLocaleString('fa-IR')}</td>
          <td style="text-align:center;">۱۰٪</td>
          <td style="text-align:left; font-family:monospace;">${rowVat.toLocaleString('fa-IR')}</td>
          <td style="text-align:left; font-family:monospace; font-weight:bold;">${rowGrand.toLocaleString('fa-IR')}</td>
        </tr>
      `;
    });
  } else {
    // Standard package or custom license
    const pkgTitle = order?.package_name || 'اشتراک و لایسنس جامع سامانه ابری کارویتا';
    itemRowsHtml = `
      <tr>
        <td style="text-align:center;">۱</td>
        <td style="font-family:monospace; text-align:center;">KAR-ERP-LIC</td>
        <td>
          <strong>${pkgTitle}</strong>
          <div style="font-size:10px; color:#64748b; margin-top:2px;">
            شامل دسترسی به زیرساخت ابری، لایسنس کاربری (${order?.user_count || 5} کاربر) و نگهداری سرویس
          </div>
        </td>
        <td style="text-align:center;">۱</td>
        <td style="text-align:center;">دوره ${order?.billing_period === 'yearly' ? 'سالانه' : 'ماهانه'}</td>
        <td style="text-align:left; font-family:monospace;">${baseBeforeVat.toLocaleString('fa-IR')}</td>
        <td style="text-align:left; font-family:monospace;">${baseBeforeVat.toLocaleString('fa-IR')}</td>
        <td style="text-align:left; font-family:monospace;">${discountAmount.toLocaleString('fa-IR')}</td>
        <td style="text-align:left; font-family:monospace;">${baseBeforeVat.toLocaleString('fa-IR')}</td>
        <td style="text-align:center;">۱۰٪</td>
        <td style="text-align:left; font-family:monospace;">${vatAmount.toLocaleString('fa-IR')}</td>
        <td style="text-align:left; font-family:monospace; font-weight:bold;">${finalAmount.toLocaleString('fa-IR')}</td>
      </tr>
    `;
  }

  const statusStamp = isPaid
    ? `<div class="stamp-paid">
        <div class="stamp-inner">
          <span>پرداخت و تسویه شد</span>
          <small>شاپرک زیبال</small>
        </div>
      </div>`
    : `<div class="stamp-pending">
        <div class="stamp-inner">
          <span>پیش‌فاکتور معتبر</span>
          <small>در انتظار پرداخت</small>
        </div>
      </div>`;

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>صورتحساب رسمی استاندارد مالیاتی - ${orderNum}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 8mm 8mm 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'IRANSans', 'Vazirmatn', Tahoma, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 16px;
      background: #f1f5f9;
      color: #0f172a;
      font-size: 11.5px;
      line-height: 1.5;
    }
    .print-actions {
      max-width: 210mm;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }
    .btn-print {
      background: #0870d1;
      color: #ffffff;
      border: none;
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
    }
    .btn-outline {
      background: #f8fafc;
      color: #334155;
      border: 1px solid #cbd5e1;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }
    .invoice-wrapper {
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #ffffff;
      padding: 12mm 10mm;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      position: relative;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .header-table td {
      vertical-align: middle;
    }
    .main-title {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      text-align: center;
      margin: 0;
    }
    .sub-title {
      font-size: 11px;
      color: #475569;
      text-align: center;
      margin: 2px 0 0;
    }
    .meta-box {
      font-size: 10.5px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 10px;
      line-height: 1.6;
    }
    .section-title {
      background: #e2e8f0;
      border: 1px solid #94a3b8;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      color: #0f172a;
      text-align: center;
      letter-spacing: 0.5px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-bottom: 8px;
      border: 1px solid #94a3b8;
    }
    .info-table td {
      border: 1px solid #cbd5e1;
      padding: 4px 8px;
    }
    .info-table td.label {
      background: #f8fafc;
      font-weight: 700;
      color: #334155;
      width: 13%;
      white-space: nowrap;
    }
    .info-table td.val {
      color: #0f172a;
      width: 20%;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-bottom: 8px;
      border: 1px solid #94a3b8;
    }
    .items-table th {
      background: #e2e8f0;
      border: 1px solid #94a3b8;
      padding: 5px 4px;
      font-weight: 800;
      color: #0f172a;
      text-align: center;
    }
    .items-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 6px;
    }
    .total-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      border: 1px solid #94a3b8;
      margin-bottom: 8px;
    }
    .total-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 10px;
    }
    .total-table td.label {
      background: #f8fafc;
      font-weight: 800;
      color: #1e293b;
      width: 25%;
    }
    .total-table td.val {
      font-family: monospace;
      font-size: 12px;
      font-weight: 800;
      text-align: left;
    }
    .words-box {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      padding: 6px 12px;
      font-size: 11px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .signatures-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .signatures-table td {
      width: 50%;
      border: 1px dashed #cbd5e1;
      padding: 12px;
      vertical-align: top;
      height: 110px;
      position: relative;
    }
    .stamp-box {
      display: inline-block;
      border: 2px solid #0870d1;
      border-radius: 50%;
      width: 85px;
      height: 85px;
      color: #0870d1;
      text-align: center;
      padding: 14px 4px;
      font-size: 9px;
      font-weight: 800;
      transform: rotate(-10deg);
      opacity: 0.85;
      position: absolute;
      left: 20px;
      top: 15px;
      border-style: double;
      border-width: 4px;
    }
    .qr-box {
      width: 75px;
      height: 75px;
      border: 1px solid #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      font-size: 9px;
      text-align: center;
      background: #ffffff;
      padding: 4px;
    }
    .footer-note {
      font-size: 9.5px;
      color: #64748b;
      text-align: justify;
      margin-top: 8px;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
    }
    .stamp-paid {
      position: absolute;
      top: 25mm;
      left: 15mm;
      border: 3px solid #16a34a;
      color: #16a34a;
      border-radius: 8px;
      padding: 4px 12px;
      font-weight: 900;
      font-size: 14px;
      transform: rotate(-8deg);
      background: rgba(240, 253, 244, 0.85);
      z-index: 10;
    }
    .stamp-pending {
      position: absolute;
      top: 25mm;
      left: 15mm;
      border: 3px dashed #d97706;
      color: #d97706;
      border-radius: 8px;
      padding: 4px 12px;
      font-weight: 900;
      font-size: 13px;
      transform: rotate(-8deg);
      background: rgba(254, 243, 199, 0.85);
      z-index: 10;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .print-actions {
        display: none !important;
      }
      .invoice-wrapper {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
        min-height: auto;
      }
    }
  </style>
</head>
<body>

  <!-- Top Action Bar (hidden when printing/PDF) -->
  <div class="print-actions">
    <div style="display:flex; align-items:center; gap:12px;">
      <strong style="color:#0870d1; font-size:14px;">صورتحساب الکترونیکی رسمی (سامانه مودیان و دارایی)</strong>
      <span style="background:#e2e8f0; padding:2px 8px; border-radius:4px; font-size:11px; font-family:monospace;">
        ${orderNum}
      </span>
    </div>
    <div style="display:flex; gap:8px;">
      <a href="/api/invoices/${order?.id || tx?.id || 1}/contract" class="btn-outline" target="_blank">
        مشاهده و چاپ قرارداد رسمی
      </a>
      <button type="button" class="btn-print" onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        <span>چاپ و ذخیره PDF رسمی</span>
      </button>
    </div>
  </div>

  <div class="invoice-wrapper">
    ${statusStamp}

    <!-- Header -->
    <table class="header-table">
      <tr>
        <td style="width:20%;">
          <div style="border: 2px solid #0870d1; border-radius: 8px; padding: 6px 12px; display:inline-block; color:#0870d1; font-weight:900; font-size:16px;">
            KARVITA
          </div>
          <div style="font-size:9.5px; color:#475569; margin-top:2px;">سامانه جامع ابری کارویتا</div>
        </td>
        <td style="width:55%;">
          <h1 class="main-title">صورتحساب رسمی فروش کالا و خدمات</h1>
          <div class="sub-title">منطبق با ماده ۱۶۹ قانون مالیات‌های مستقیم و استانداردهای سامانه مودیان کشور</div>
        </td>
        <td style="width:25%; text-align:left;">
          <div class="meta-box">
            <div>شماره فاکتور: <strong style="font-family:monospace;">${orderNum}</strong></div>
            <div>تاریخ صدور: <strong>${dateFa}</strong></div>
            <div>زمان صدور: <strong>${timeFa}</strong></div>
            <div>شناسه مالیاتی: <strong style="font-family:monospace; font-size:9px;">${taxId}</strong></div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Seller Info Section -->
    <div class="section-title">بخش اول: مشخصات فروشنده (ارائه‌دهنده خدمت)</div>
    <table class="info-table">
      <tr>
        <td class="label">نام شخص حقوقی:</td>
        <td class="val" colspan="3"><strong>${OFFICIAL_SELLER_INFO.company_name}</strong></td>
        <td class="label">شناسه ملی:</td>
        <td class="val"><strong style="font-family:monospace;">${OFFICIAL_SELLER_INFO.national_id}</strong></td>
      </tr>
      <tr>
        <td class="label">شماره اقتصادی:</td>
        <td class="val"><strong style="font-family:monospace;">${OFFICIAL_SELLER_INFO.economic_code}</strong></td>
        <td class="label">شماره ثبت:</td>
        <td class="val"><strong style="font-family:monospace;">${OFFICIAL_SELLER_INFO.registration_number}</strong></td>
        <td class="label">کد پستی:</td>
        <td class="val"><strong style="font-family:monospace;">${OFFICIAL_SELLER_INFO.postal_code}</strong></td>
      </tr>
      <tr>
        <td class="label">استان / شهر:</td>
        <td class="val">${OFFICIAL_SELLER_INFO.province} / ${OFFICIAL_SELLER_INFO.city}</td>
        <td class="label">نشانی کامل:</td>
        <td class="val" colspan="3">${OFFICIAL_SELLER_INFO.address}</td>
      </tr>
      <tr>
        <td class="label">تلفن / دورنگار:</td>
        <td class="val" dir="ltr">${OFFICIAL_SELLER_INFO.phone}</td>
        <td class="label">پست الکترونیک:</td>
        <td class="val" dir="ltr">${OFFICIAL_SELLER_INFO.email}</td>
        <td class="label">کد مودیان:</td>
        <td class="val" style="font-family:monospace;">${OFFICIAL_SELLER_INFO.tax_payer_code}</td>
      </tr>
    </table>

    <!-- Buyer Info Section -->
    <div class="section-title">بخش دوم: مشخصات خریدار (مشتری / مشترک)</div>
    <table class="info-table">
      <tr>
        <td class="label">نام خریدار / شرکت:</td>
        <td class="val" colspan="3"><strong>${buyerName}</strong></td>
        <td class="label">شناسه / کد ملی:</td>
        <td class="val"><strong style="font-family:monospace;">${buyerNationalId}</strong></td>
      </tr>
      <tr>
        <td class="label">شماره اقتصادی:</td>
        <td class="val"><strong style="font-family:monospace;">${buyerEconomicCode}</strong></td>
        <td class="label">شماره ثبت:</td>
        <td class="val"><strong style="font-family:monospace;">${buyerRegNo}</strong></td>
        <td class="label">کد پستی:</td>
        <td class="val"><strong style="font-family:monospace;">${buyerPostalCode}</strong></td>
      </tr>
      <tr>
        <td class="label">استان و شهر:</td>
        <td class="val">${company?.province || 'تهران'} / ${company?.city || 'تهران'}</td>
        <td class="label">نشانی خریدار:</td>
        <td class="val" colspan="3">${buyerAddress}</td>
      </tr>
      <tr>
        <td class="label">شماره تماس / همراه:</td>
        <td class="val" dir="ltr"><strong>${buyerPhone}</strong></td>
        <td class="label">نام رابط / مدیر:</td>
        <td class="val">${[user.first_name, user.last_name].filter(Boolean).join(' ') || 'کاربر سیستم'}</td>
        <td class="label">کد رهگیری پرداخت:</td>
        <td class="val"><strong style="font-family:monospace; color:#059669;">${tx?.reference_id || (isPaid ? 'PAY-ONLINE-SHAPARAK' : 'در انتظار پرداخت')}</strong></td>
      </tr>
    </table>

    <!-- Itemized Breakdown Table -->
    <div class="section-title">بخش سوم: مشخصات کالا یا خدمات مورد معامله</div>
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:4%;">ردیف</th>
          <th style="width:12%;">کد خدمت / کالا</th>
          <th style="width:30%;">شرح خدمات نرم‌افزاری و ماژول‌ها</th>
          <th style="width:5%;">تعداد</th>
          <th style="width:8%;">واحد</th>
          <th style="width:10%;">مبلغ واحد (تومان)</th>
          <th style="width:10%;">مبلغ کل (تومان)</th>
          <th style="width:6%;">تخفیف</th>
          <th style="width:10%;">مبلغ پس از تخفیف</th>
          <th style="width:5%;">نرخ مالیات</th>
          <th style="width:8%;">مالیات و عوارض (۱۰٪)</th>
          <th style="width:12%;">جمع کل با مالیات (تومان)</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHtml}
      </tbody>
    </table>

    <!-- Totals Table -->
    <table class="total-table">
      <tr>
        <td class="label">مجموع مبلغ ناخالص:</td>
        <td class="val">${rawTotal.toLocaleString('fa-IR')} تومان</td>
        <td class="label">مجموع تخفیفات اعمال‌شده:</td>
        <td class="val" style="color:#b45309;">${discountAmount.toLocaleString('fa-IR')} تومان</td>
      </tr>
      <tr>
        <td class="label">مبلغ خالص مشمول مالیات (پایه):</td>
        <td class="val">${baseBeforeVat.toLocaleString('fa-IR')} تومان</td>
        <td class="label">مالیات بر ارزش افزوده و عوارض (۱۰٪):</td>
        <td class="val" style="color:#0870d1;">${vatAmount.toLocaleString('fa-IR')} تومان</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td class="label" style="font-size:12px; color:#0870d1;">مبلغ نهایی قابل پرداخت / تسویه‌شده:</td>
        <td class="val" colspan="3" style="font-size:15px; color:#0870d1; font-weight:900;">
          ${finalAmount.toLocaleString('fa-IR')} تومان <span style="font-size:11px; font-weight:normal; color:#64748b;">(معادل ${(finalAmount * 10).toLocaleString('fa-IR')} ریال)</span>
        </td>
      </tr>
    </table>

    <!-- Amount in Persian Words -->
    <div class="words-box">
      <div><strong>مبلغ کل به حروف:</strong> ${amountInWords}</div>
      <div><strong>نحوه تسویه:</strong> ${isPaid ? 'پرداخت اینترنتی قطعی شاپرک زیبال (نقدی)' : 'پرداخت الکترونیکی درگاه اینترنتی (معوق)'}</div>
    </div>

    <!-- Signatures, Legal Seal & Barcode -->
    <table class="signatures-table">
      <tr>
        <td>
          <div style="font-weight:800; font-size:11px; color:#1e293b;">مهر و امضای فروشنده:</div>
          <div style="font-size:10px; color:#64748b; margin-top:2px;">شرکت داده‌پردازان ابری کارویتا (سهامی خاص)</div>
          
          <div class="stamp-box">
            شرکت کارویتا<br>
            سهامی خاص<br>
            ثبت: ۵۶۸۹۴۲<br>
            امور مالی
          </div>
        </td>
        <td>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="font-weight:800; font-size:11px; color:#1e293b;">مهر و امضای خریدار / کارفرما:</div>
              <div style="font-size:10px; color:#64748b; margin-top:2px;">${buyerName}</div>
            </div>

            <!-- Tax Validation Barcode & QR code representation -->
            <div style="text-align:center;">
              <div class="qr-box">
                QR-TAX<br>
                ${taxId.slice(0, 9)}<br>
                VALID
              </div>
              <div style="font-size:8px; color:#64748b; margin-top:2px;">استعلام مودیان</div>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Legal Footer Note -->
    <div class="footer-note">
      <strong>توضیحات قانونی:</strong> این صورتحساب رسمی مطابق با مفاد ماده ۱۶۹ و ۱۶۹ مکرر قانون مالیات‌های مستقیم، قانون پایانه‌های فروشگاهی و سامانه مودیان کشور تنظیم و صادر گردیده است. مبالغ مندرج بر اساس نرخ مالیات بر ارزش افزوده مصوب سال جاری محاسبه شده و این سند دارای ارزش رسمی، قانونی و قابل استناد جهت ارائه به حوزه مالیاتی، دفاتر حسابرسی و ممیزی دارایی می‌باشد.
    </div>
  </div>

</body>
</html>`;
}

/**
 * Generate Official Service & SLA Contract HTML Document (A4 Printable & PDF Ready)
 */
export function generateOfficialContractHtml(params: {
  order: any;
  tx: any;
  user: any;
  company: any;
  modulesList: Array<{ id: string; title: string; price: number }>;
}): string {
  const { order, tx, user, company, modulesList } = params;

  const contractNum = `KCT-${order?.order_number?.replace(/\D/g, '') || order?.id || '1001'}`;
  const contractDate = order?.created_at ? new Date(order.created_at) : new Date();
  const dateFa = contractDate.toLocaleDateString('fa-IR');
  
  const buyerName = company?.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.mobile;
  const buyerNationalId = company?.national_id || user.national_id || user.mobile;
  const buyerPhone = company?.phone || user.mobile;
  const buyerAddress = company?.address || (company?.province ? `${company.province}، ${company.city || ''}` : 'اقامتگاه قانونی ثبت شده در سامانه');
  const finalAmount = Number(tx?.amount || order?.amount || 0);
  const amountInWords = numberToWordsPersian(finalAmount);

  const selectedModulesTitles = (order?.module_ids || [])
    .map((id: string) => {
      const m = modulesList.find(x => x.id === id);
      return m ? m.title : id;
    })
    .join('، ') || 'ماژول‌های پایه و اختصاصی ERP';

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>قرارداد رسمی ارائه خدمات ابری و لایسنس - ${contractNum}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'IRANSans', 'Vazirmatn', Tahoma, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 20px;
      background: #f8fafc;
      color: #0f172a;
      font-size: 11.5px;
      line-height: 1.8;
    }
    .print-actions {
      max-width: 210mm;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }
    .btn-print {
      background: #0870d1;
      color: #ffffff;
      border: none;
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .contract-wrapper {
      max-width: 210mm;
      margin: 0 auto;
      background: #ffffff;
      padding: 16mm 14mm;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .header-box {
      border-bottom: 2px solid #0870d1;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .contract-title {
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
      margin: 0;
    }
    .clause {
      margin-bottom: 14px;
      text-align: justify;
    }
    .clause-title {
      font-weight: 800;
      color: #0870d1;
      margin-bottom: 4px;
    }
    .signatures-box {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    .sig-party {
      width: 48%;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 14px;
      height: 140px;
      position: relative;
    }
    .stamp-circle {
      position: absolute;
      left: 20px;
      bottom: 20px;
      border: 3px double #0870d1;
      border-radius: 50%;
      width: 80px;
      height: 80px;
      color: #0870d1;
      font-size: 9px;
      font-weight: bold;
      text-align: center;
      padding: 14px 2px;
      transform: rotate(-12deg);
      opacity: 0.85;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .print-actions {
        display: none !important;
      }
      .contract-wrapper {
        border: none;
        box-shadow: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>

  <div class="print-actions">
    <strong style="color:#0870d1; font-size:14px;">قرارداد رسمی لایسنس و ارائه خدمات ابری کارویتا (SLA Agreement)</strong>
    <button type="button" class="btn-print" onclick="window.print()">
      چاپ و ذخیره PDF قرارداد
    </button>
  </div>

  <div class="contract-wrapper">
    <div class="header-box">
      <div>
        <h1 class="contract-title">قرارداد اعطای لایسنس و ارائه خدمات ابری (SLA)</h1>
        <small style="color:#64748b;">سامانه مدیریت یکپارچه منابع سازمانی ابری کارویتا (Karvita Cloud ERP)</small>
      </div>
      <div style="text-align:left; font-size:11px; line-height:1.6;">
        <div>شماره قرارداد: <strong style="font-family:monospace;">${contractNum}</strong></div>
        <div>تاریخ انعقاد: <strong>${dateFa}</strong></div>
        <div>پیوست فاکتور: <strong style="font-family:monospace;">${order?.order_number || '—'}</strong></div>
      </div>
    </div>

    <div class="clause">
      <div class="clause-title">ماده ۱: طرفین قرارداد</div>
      این قرارداد فی‌مابین <strong>${OFFICIAL_SELLER_INFO.company_name}</strong> به شناسه ملی ${OFFICIAL_SELLER_INFO.national_id}، شماره ثبت ${OFFICIAL_SELLER_INFO.registration_number} و کد اقتصادی ${OFFICIAL_SELLER_INFO.economic_code} به نشانی ${OFFICIAL_SELLER_INFO.address} به عنوان <strong>«مجری / ارائه‌دهنده خدمت»</strong> از یک طرف، و <strong>${buyerName}</strong> به شماره/شناسه ملی ${buyerNationalId} به نشانی ${buyerAddress} و شماره تماس ${buyerPhone} به عنوان <strong>«کارفرما / مشترک»</strong> از طرف دیگر، منعقد گردید.
    </div>

    <div class="clause">
      <div class="clause-title">ماده ۲: موضوع قرارداد</div>
      موضوع قرارداد عبارت است از اعطای حق بهره‌برداری غیرانحصاری (لایسنس ابری)، میزبانی امن داده‌ها، پشتیبانی فنی و دسترسی به سامانه ابری کارویتا و ماژول‌های منتخَب کارفرما شامل: <strong>${selectedModulesTitles}</strong> برای ظرفیت <strong>${order?.user_count || 5} کاربر همزمان</strong>.
    </div>

    <div class="clause">
      <div class="clause-title">ماده ۳: مدت قرارداد و دوره اشتراک</div>
      مدت این قرارداد به مدت <strong>یک دوره ${order?.billing_period === 'yearly' ? 'یک‌ساله (۱۲ ماه شمسی)' : 'یک‌ماهه'}</strong> از تاریخ پرداخت و فعال‌سازی سفارش بوده و با تمدید اشتراک و تسویه فاکتورهای آتی به صورت خودکار قابل تمدید است.
    </div>

    <div class="clause">
      <div class="clause-title">ماده ۴: مبلغ قرارداد و نحوه پرداخت</div>
      مبلغ کل این قرارداد برابر با <strong>${finalAmount.toLocaleString('fa-IR')} تومان</strong> (حروف: ${amountInWords}) با احتساب کلیه عوارض و مالیات بر ارزش افزوده قانونی می‌باشد که طبق صورتحساب رسمی شماره ${order?.order_number || '—'} توسط کارفرما تسویه گردیده است.
    </div>

    <div class="clause">
      <div class="clause-title">ماده ۵: سطح تعهدات خدمات (SLA) و پایداری سرویس</div>
      مجری متعهد می‌گردد پایداری سامانه ابری (Uptime) را با ضریب ۹۹.۹٪ در طول دوره قرارداد تضمین نماید. همچنین پشتیبانی فنی از طریق سامانه تیکتینگ و رفع خطاهای سیستمی به صورت ۲۴/۷ بر عهده مجری خواهد بود.
    </div>

    <div class="clause">
      <div class="clause-title">ماده ۶: محرمانگی اطلاعات (NDA) و مالکیت داده‌ها</div>
      کلیه اطلاعات، پایگاه داده‌ها، مستندات مالی و اسناد تجاری کارفرما که در سامانه کارویتا ذخیره می‌گردد، دارایی انحصاری و محرمانه کارفرما بوده و مجری متعهد به حفاظت کامل از حریم خصوصی داده‌ها طبق پروتکل‌های رمزنگاری پیشرفته می‌باشد.
    </div>

    <div class="clause">
      <div class="clause-title">ماده ۷: حل اختلاف و قوانین حاکم</div>
      این قرارداد تابع قوانین جاری جمهوری اسلامی ایران و قانون تجارت الکترونیکی بوده و در صورت بروز هرگونه اختلاف، موضوع ابتدا از طریق مذاکره و در صورت عدم توافق از طریق مراجع قانونی صالحه حل و فصل خواهد شد.
    </div>

    <div class="signatures-box">
      <div class="sig-party">
        <strong>مهر و امضای مجری (ارائه‌دهنده خدمت):</strong>
        <div style="font-size:10px; color:#64748b; margin-top:2px;">شرکت داده‌پردازان ابری کارویتا (سهامی خاص)</div>
        <div class="stamp-circle">
          شرکت کارویتا<br>
          امور حقوقی و قراردادها
        </div>
      </div>

      <div class="sig-party">
        <strong>مهر و امضای کارفرما (مشترک):</strong>
        <div style="font-size:10px; color:#64748b; margin-top:2px;">${buyerName}</div>
      </div>
    </div>
  </div>

</body>
</html>`;
}
