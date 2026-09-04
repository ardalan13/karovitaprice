export const DEFAULT_MODULES = [
  // ماژول‌های پرکاربرد و درخواستی کاربر (با نام‌های ساده، کوتاه و یک‌کلمه‌ای)
  {
    id: "mail",
    title: "گفتگو",
    price: 180000,
    category: "productivity",
    description: "پیام‌رسان داخلی، کانال‌های گفتگو و ارتباط بین پرسنل",
    dependencies: [],
    industries: ["full_integration", "service", "software", "commerce"],
    is_active: true
  },
  {
    id: "calendar",
    title: "گاهشمار",
    price: 160000,
    category: "productivity",
    description: "تقویم کاری، زمان‌بندی جلسات و یادآوری رویدادها",
    dependencies: [],
    industries: ["full_integration", "service", "software"],
    is_active: true
  },
  {
    id: "activities",
    title: "اقدامات و پیگیری ها",
    price: 190000,
    category: "management",
    description: "ثبت وظایف روزانه، پیگیری امور و یادآور تماس‌ها",
    dependencies: [],
    industries: ["full_integration", "service", "software", "commerce"],
    is_active: true
  },
  {
    id: "survey",
    title: "فرم ساز",
    price: 210000,
    category: "marketing",
    description: "ساخت انواع فرم‌های سفارشی، پرسشنامه و جمع‌آوری داده",
    dependencies: [],
    industries: ["full_integration", "service", "software"],
    is_active: true
  },
  {
    id: "contacts",
    title: "مخاطبان",
    price: 180000,
    category: "sales",
    description: "دفترچه تلفن یکپارچه و پرونده مشخصات اشخاص و شرکت‌ها",
    dependencies: [],
    industries: ["full_integration", "commerce", "service", "store", "software"],
    is_active: true
  },
  {
    id: "crm",
    title: "crm",
    price: 290000,
    category: "sales",
    description: "مدیریت ارتباط با مشتریان و رهگیری خط لوله فرصت‌های فروش",
    dependencies: [],
    industries: ["full_integration", "service", "commerce", "software", "store"],
    is_active: true
  },
  {
    id: "sale",
    title: "فروش",
    price: 320000,
    category: "sales",
    description: "صدور پیش‌فاکتور، سفارشات فروش، امضای الکترونیک و نرخ‌نامه",
    dependencies: ["crm"],
    industries: ["full_integration", "commerce", "store"],
    is_active: true
  },
  {
    id: "account",
    title: "حسابداری",
    price: 450000,
    category: "finance",
    description: "اسناد دوبل، تراز آزمایشی، سود و زیان، دفاتر مالی و استهلاک",
    dependencies: [],
    industries: ["full_integration", "commerce", "manufacturing", "service", "software", "store"],
    is_active: true
  },
  {
    id: "project",
    title: "پروژه",
    price: 280000,
    category: "management",
    description: "مدیریت پروژه‌ها، بردهای کانبان، نمودار گانت و مایل‌استون‌ها",
    dependencies: [],
    industries: ["full_integration", "software", "service"],
    is_active: true
  },
  {
    id: "hr",
    title: "کارمندان",
    price: 220000,
    category: "hr",
    description: "پرونده الکترونیک پرسنل، چارت سازمانی و مهارت‌های فردی",
    dependencies: [],
    industries: ["full_integration", "manufacturing", "service", "software"],
    is_active: true
  },
  {
    id: "hr_attendance",
    title: "حضور و غیاب",
    price: 210000,
    category: "hr",
    description: "ثبت ورود و خروج، محاسبه اضافه‌کاری و کسر کار پرسنل",
    dependencies: ["hr"],
    industries: ["full_integration", "manufacturing", "store"],
    is_active: true
  },
  {
    id: "hr_recruitment",
    title: "استخدام",
    price: 260000,
    category: "hr",
    description: "پایگاه کارجویان، مصاحبه‌های استخدامی و گردش جذب نیرو",
    dependencies: ["hr"],
    industries: ["full_integration", "software", "service"],
    is_active: true
  },
  {
    id: "hr_holidays",
    title: "مرخصی",
    price: 240000,
    category: "hr",
    description: "ثبت و گردش تایید مرخصی استحقاقی، استعلاجی و ماموریت",
    dependencies: ["hr"],
    industries: ["full_integration", "manufacturing", "service", "software"],
    is_active: true
  },
  {
    id: "hr_contract",
    title: "قرارداد کارمند",
    price: 230000,
    category: "hr",
    description: "احکام اداری، ثبت قراردادهای استخدامی و تاریخ‌های تمدید",
    dependencies: ["hr"],
    industries: ["full_integration", "manufacturing", "service"],
    is_active: true
  },
  {
    id: "hr_payroll",
    title: "حقوق و دستمزد",
    price: 360000,
    category: "hr",
    description: "محاسبه فیش حقوقی مطابق قانون کار، دیسکت بیمه و فایل بانکی",
    dependencies: ["hr"],
    industries: ["full_integration", "manufacturing", "service", "software"],
    is_active: true
  },
  {
    id: "barcode",
    title: "بارکد",
    price: 220000,
    category: "logistics",
    description: "اسکنر بارکدخوان پرتابل برای ورود کالا، انبارگردانی و خروج بار",
    dependencies: ["stock"],
    industries: ["full_integration", "store", "commerce", "manufacturing"],
    is_active: true
  },
  {
    id: "survey_feedback",
    title: "نظرسنجی ها",
    price: 190000,
    category: "marketing",
    description: "پرسشنامه‌های آنلاین و سنجش سطح رضایت مشتریان و پرسنل",
    dependencies: [],
    industries: ["full_integration", "service", "software"],
    is_active: true
  },
  {
    id: "appointment",
    title: "قرار ملاقات",
    price: 230000,
    category: "productivity",
    description: "لینک تقویم شخصی جهت رزرو آنلاین وقت و جلسه توسط مشتریان",
    dependencies: [],
    industries: ["full_integration", "service"],
    is_active: true
  },
  {
    id: "im_livechat",
    title: "چت انلاین",
    price: 220000,
    category: "marketing",
    description: "ابزارک گفتگوی زنده با کاربران و مشتریان روی وب‌سایت",
    dependencies: [],
    industries: ["full_integration", "commerce", "software", "store"],
    is_active: true
  },
  {
    id: "marketing_automation",
    title: "اتوماسیون بازاریابی",
    price: 330000,
    category: "marketing",
    description: "طراحی مسیر تعامل خودکار، پیام‌های مناسبتی و پیگیری سرنخ‌ها",
    dependencies: ["crm"],
    industries: ["full_integration", "commerce"],
    is_active: true
  },
  {
    id: "fleet",
    title: "ناوگان",
    price: 230000,
    category: "hr",
    description: "پرونده خودروها، سوابق بیمه، مصرف سوخت و رانندگان سازمانی",
    dependencies: [],
    industries: ["full_integration", "logistics", "service"],
    is_active: true
  },
  {
    id: "planning",
    title: "برنامه ریزی",
    price: 250000,
    category: "management",
    description: "زمان‌بندی شیفت‌های کاری، تخصیص نیروها و تقویم تیمی",
    dependencies: [],
    industries: ["full_integration", "service", "store"],
    is_active: true
  },
  {
    id: "event",
    title: "رویداد",
    price: 270000,
    category: "marketing",
    description: "مدیریت وبینارها، همایش‌ها، ثبت‌نام و بلیت‌فروشی",
    dependencies: [],
    industries: ["full_integration", "service"],
    is_active: true
  },
  {
    id: "knowledge",
    title: "دانش",
    price: 210000,
    category: "productivity",
    description: "پایگاه دانش سازمانی، راهنماهای آموزشی و ویکی مستندات تیمی",
    dependencies: [],
    industries: ["full_integration", "software", "service"],
    is_active: true
  },
  {
    id: "maintenance",
    title: "نگهداری",
    price: 290000,
    category: "production",
    description: "تعمیرات دوره‌ای پیشگیرانه (PM) و خرابی ماشین‌آلات فنی",
    dependencies: [],
    industries: ["full_integration", "manufacturing"],
    is_active: true
  },
  {
    id: "documents",
    title: "اسناد",
    price: 290000,
    category: "productivity",
    description: "آرشیو امن ابری مدارک، پوشه‌بندی سازمانی و شناسایی اسناد",
    dependencies: [],
    industries: ["full_integration", "manufacturing", "service"],
    is_active: true
  },
  {
    id: "hr_timesheet",
    title: "برگه ساعت کارکرد",
    price: 220000,
    category: "management",
    description: "ثبت کارکرد ساعتی پرسنل بر روی تسک‌ها و کنترل راندمان",
    dependencies: ["project"],
    industries: ["full_integration", "software", "service"],
    is_active: true
  },
  {
    id: "hr_expense",
    title: "هزینه ها",
    price: 220000,
    category: "finance",
    description: "ثبت فاکتورهای تنخواه، هزینه‌های جاری اداری و تاییدات مدیران",
    dependencies: ["account"],
    industries: ["full_integration", "service", "manufacturing"],
    is_active: true
  },
  {
    id: "purchase",
    title: "خرید",
    price: 280000,
    category: "logistics",
    description: "درخواست استعلام قیمت، سفارش خرید سازمانی و ارزیابی تامین‌کننده",
    dependencies: ["stock"],
    industries: ["full_integration", "manufacturing", "commerce"],
    is_active: true
  },
  {
    id: "stock",
    title: "انبار",
    price: 380000,
    category: "logistics",
    description: "کاردکس کالا، کنترل موجودی چندانباره و نقطه سفارش خودکار",
    dependencies: [],
    industries: ["full_integration", "manufacturing", "commerce", "store"],
    is_active: true
  },

  // سایر ماژول‌های تکمیلی و کاربردی با نام‌های کوتاه و روشن
  {
    id: "mrp",
    title: "تولید",
    price: 520000,
    category: "production",
    description: "فرمول ساخت کالا (BOM)، سفارشات کارگاهی و بهای تمام‌شده",
    dependencies: ["stock"],
    industries: ["full_integration", "manufacturing"],
    is_active: true
  },
  {
    id: "pos",
    title: "صندوق",
    price: 390000,
    category: "sales",
    description: "صندوق فروشگاهی لمسی، بارکدخوان، پوز بانکی و کارکرد آفلاین",
    dependencies: ["stock"],
    industries: ["full_integration", "store", "commerce"],
    is_active: true
  },
  {
    id: "account_invoicing",
    title: "فاکتور",
    price: 280000,
    category: "finance",
    description: "صدور پیش‌فاکتور و فاکتور رسمی، لینک پرداخت و مالیات",
    dependencies: [],
    industries: ["full_integration", "commerce", "store", "service"],
    is_active: true
  },
  {
    id: "account_budget",
    title: "بودجه",
    price: 260000,
    category: "finance",
    description: "بودجه‌بندی فصلی، کنترل هزینه‌های واقعی و گزارش انحراف",
    dependencies: ["account"],
    industries: ["full_integration", "manufacturing", "service"],
    is_active: true
  },
  {
    id: "website",
    title: "وب‌سایت",
    price: 260000,
    category: "marketing",
    description: "صفحه‌ساز بصری درگ‌اند‌دراپ، سئو پیشرفته و وبلاگ سازمانی",
    dependencies: [],
    industries: ["full_integration", "commerce", "store", "software"],
    is_active: true
  },
  {
    id: "website_sale",
    title: "فروشگاه",
    price: 390000,
    category: "marketing",
    description: "فروشگاه آنلاین کالا با درگاه پرداخت شاپرک و اتصال به انبار",
    dependencies: ["website", "sale", "stock"],
    industries: ["full_integration", "commerce", "store"],
    is_active: true
  },
  {
    id: "sign",
    title: "امضا",
    price: 270000,
    category: "productivity",
    description: "امضای امن دیجیتالی اسناد، فرم‌ها و قراردادهای شرکتی",
    dependencies: [],
    industries: ["full_integration", "service", "commerce"],
    is_active: true
  },
  {
    id: "helpdesk",
    title: "پشتیبانی",
    price: 320000,
    category: "management",
    description: "میز خدمت، پورتال تیکت مشتریان و زمان‌بندی پاسخگویی SLA",
    dependencies: [],
    industries: ["full_integration", "service", "software", "commerce"],
    is_active: true
  },
  {
    id: "field_service",
    title: "خدمات در محل",
    price: 390000,
    category: "management",
    description: "اعزام تکنسین فنی روی نقشه، ثبت قطعات و امضای مشتری",
    dependencies: ["project", "stock"],
    industries: ["full_integration", "service"],
    is_active: true
  },
  {
    id: "quality_control",
    title: "کنترل کیفیت",
    price: 310000,
    category: "production",
    description: "آزمون‌های استاندارد در خط تولید، انبار ورودی و گزارش عدم انطباق",
    dependencies: ["stock"],
    industries: ["full_integration", "manufacturing"],
    is_active: true
  },
  {
    id: "voip",
    title: "تلفن ابری",
    price: 340000,
    category: "productivity",
    description: "اتصال به سانترال و تلفن اینترنتی با پاپ‌آپ پرونده مشتری",
    dependencies: ["crm"],
    industries: ["full_integration", "service", "commerce"],
    is_active: true
  },
  {
    id: "iot",
    title: "اینترنت اشیا",
    price: 380000,
    category: "productivity",
    description: "اتصال سخت‌افزارهای ترازو، بارکدخوان و سنسورهای صنعتی خط تولید",
    dependencies: ["stock"],
    industries: ["full_integration", "manufacturing", "store"],
    is_active: true
  },
  {
    id: "ai_assistant",
    title: "هوش مصنوعی",
    price: 420000,
    category: "productivity",
    description: "نگارش هوشمند متون، تحلیل روند فروش و پیش‌بینی تقاضا",
    dependencies: [],
    industries: ["full_integration", "software", "service", "commerce"],
    is_active: true
  },
  {
    id: "mass_mailing",
    title: "ایمیل مارکتینگ",
    price: 220000,
    category: "marketing",
    description: "ارسال ایمیل‌های تبلیغاتی انبوه، بخش‌بندی و گزارش نرخ بازگشایی",
    dependencies: [],
    industries: ["full_integration", "commerce", "software"],
    is_active: true
  },
  {
    id: "mass_mailing_sms",
    title: "پیامک",
    price: 240000,
    category: "marketing",
    description: "سامانه ارسال پیامک انبوه اطلاع‌رسانی، تخفیف و مناسبتی",
    dependencies: [],
    industries: ["full_integration", "commerce", "store"],
    is_active: true
  },
  {
    id: "loyalty",
    title: "باشگاه مشتریان",
    price: 240000,
    category: "sales",
    description: "امتیاز خرید، بن‌های هدیه، کوپن تخفیف و کارت وفاداری",
    dependencies: ["sale"],
    industries: ["full_integration", "commerce", "store"],
    is_active: true
  },
  {
    id: "sale_subscription",
    title: "اشتراک",
    price: 310000,
    category: "sales",
    description: "صدور صورت‌حساب دوره‌ای، قراردادهای آبونمان و تمدید خودکار",
    dependencies: ["sale"],
    industries: ["full_integration", "software", "service"],
    is_active: true
  },
  {
    id: "sale_renting",
    title: "اجاره",
    price: 290000,
    category: "sales",
    description: "قراردادهای کرایه کالا، تقویم تحویل و عودت و بیمه تجهیزات",
    dependencies: ["sale"],
    industries: ["full_integration", "service"],
    is_active: true
  }
];

export const DEFAULT_PRESETS = [
  {
    id: "full_integration",
    title: "یکپارچگی جامع سازمانی",
    category: "صنف",
    description: "شامل پکیج جامع ماژول‌های حیاتی مالی، فروش، زنجیره تامین، تولید، منابع انسانی و هوش مصنوعی",
    default_modules: ["account", "crm", "sale", "stock", "purchase", "mrp", "hr", "hr_payroll", "project", "ai_assistant"],
    is_active: true
  },
  {
    id: "commerce",
    title: "بازرگانی و توزیع",
    category: "صنف",
    description: "مناسب شرکت‌های بازرگانی، عمده‌فروشی، توزیع مویرگی و صادرات/واردات",
    default_modules: ["crm", "sale", "account", "stock", "purchase", "contacts", "loyalty"],
    is_active: true
  },
  {
    id: "manufacturing",
    title: "تولیدی و صنعتی",
    category: "صنف",
    description: "مناسب کارخانجات و کارگاه‌های تولیدی با خط تولید، انبار و بهای تمام‌شده",
    default_modules: ["account", "stock", "purchase", "mrp", "maintenance", "quality_control", "hr"],
    is_active: true
  },
  {
    id: "service",
    title: "خدماتی و پروژه‌محور",
    category: "صنف",
    description: "مناسب مشاورین، پیمانکاران، خدمات پس از فروش و شرکت‌های مهندسی",
    default_modules: ["crm", "account_invoicing", "project", "hr_timesheet", "field_service", "helpdesk"],
    is_active: true
  },
  {
    id: "software",
    title: "نرم‌افزار و فناوری اطلاعات",
    category: "صنف",
    description: "مناسب شرکت‌های فناوری، پلتفرم‌های ابری و تیم‌های توسعه چابک",
    default_modules: ["crm", "sale_subscription", "project", "hr_timesheet", "helpdesk", "knowledge", "ai_assistant"],
    is_active: true
  },
  {
    id: "store",
    title: "فروشگاهی و خرده‌فروشی",
    category: "صنف",
    description: "مناسب فروشگاه‌های زنجیره‌ای، هایپرمارکت‌ها و مراکز خرده‌فروشی",
    default_modules: ["pos", "stock", "barcode", "account_invoicing", "loyalty", "website_sale"],
    is_active: true
  }
];

export function toPersianDigits(n) {
  if (n === null || n === undefined) return '';
  const str = String(n);
  const p = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, d => p[Number(d)]);
}

export function formatPrice(amount) {
  if (amount === 0) return '۰ تومان';
  if (!amount) return '۰ تومان';
  const formatted = Number(amount).toLocaleString('fa-IR');
  return `${formatted} تومان`;
}

/**
 * Given a list of directly selected IDs, recursively resolve all dependencies.
 */
export function resolveAllDependencies(selectedIds, modulesList = DEFAULT_MODULES) {
  const modMap = new Map((modulesList || []).map(m => [m.id, m]));
  const result = new Set(selectedIds);

  let added = true;
  while (added) {
    added = false;
    for (const id of Array.from(result)) {
      const mod = modMap.get(id);
      if (mod && Array.isArray(mod.dependencies)) {
        for (const depId of mod.dependencies) {
          if (!result.has(depId)) {
            result.add(depId);
            added = true;
          }
        }
      }
    }
  }

  return Array.from(result);
}

/**
 * Find which modules are locked because another active module depends on them.
 * Returns an object mapping lockedModuleId -> Array of dependent module titles
 */
export function getLockedDependenciesMap(activeIds, modulesList = DEFAULT_MODULES) {
  const modMap = new Map((modulesList || []).map(m => [m.id, m]));
  const lockedMap = {};

  for (const id of activeIds) {
    const parent = modMap.get(id);
    if (!parent || !Array.isArray(parent.dependencies)) continue;

    const queue = [...parent.dependencies];
    const visited = new Set();

    while (queue.length > 0) {
      const depId = queue.shift();
      if (visited.has(depId)) continue;
      visited.add(depId);

      if (!lockedMap[depId]) {
        lockedMap[depId] = [];
      }
      if (!lockedMap[depId].includes(parent.title)) {
        lockedMap[depId].push(parent.title);
      }

      const depMod = modMap.get(depId);
      if (depMod && Array.isArray(depMod.dependencies)) {
        queue.push(...depMod.dependencies);
      }
    }
  }

  return lockedMap;
}
