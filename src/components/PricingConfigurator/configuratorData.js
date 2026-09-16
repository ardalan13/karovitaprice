export const DEFAULT_MODULES = [
  {
    "id": "mail",
    "title": "گفتگو",
    "price": 250000,
    "category": "productivity",
    "description": "پیام‌رسان داخلی، کانال‌های گفتگو و ارتباط بین پرسنل",
    "dependencies": [
      "contacts"
    ],
    "industries": [
      "manufacturing",
      "commerce_trade",
      "distribution_logistics",
      "contracting_projects",
      "real_estate",
      "healthcare_clinic",
      "medical_pharma",
      "it_software",
      "education_academy",
      "legal_law",
      "immigration",
      "advertising_marketing",
      "insurance_agency",
      "consulting_finance",
      "services_maintenance"
    ],
    "is_active": true
  },
  {
    "id": "calendar",
    "title": "گاهشمار و کارکرد",
    "price": 250000,
    "category": "productivity",
    "description": "تقویم کاری، زمان‌بندی جلسات و یادآوری رویدادها",
    "dependencies": [
      "mail",
      "contacts"
    ],
    "industries": [
      "manufacturing",
      "commerce_trade",
      "distribution_logistics",
      "contracting_projects",
      "real_estate",
      "healthcare_clinic",
      "medical_pharma",
      "it_software",
      "education_academy",
      "legal_law",
      "immigration",
      "advertising_marketing",
      "insurance_agency",
      "consulting_finance",
      "services_maintenance"
    ],
    "is_active": true
  },
  {
    "id": "activities",
    "title": "اقدامات و پیگیری‌ها",
    "price": 250000,
    "category": "management",
    "description": "ثبت وظایف روزانه، پیگیری امور و یادآور تماس‌ها",
    "dependencies": [
      "mail",
      "calendar"
    ],
    "industries": [
      "legal_law",
      "immigration",
      "advertising_marketing",
      "insurance_agency",
      "consulting_finance"
    ],
    "is_active": true
  },
  {
    "id": "survey",
    "title": "فرم‌ساز و فرآیندها",
    "price": 250000,
    "category": "marketing",
    "description": "ساخت انواع فرم‌های سفارشی، پرسشنامه و جمع‌آوری داده",
    "dependencies": [
      "contacts",
      "crm"
    ],
    "industries": [
      "real_estate",
      "healthcare_clinic",
      "it_software",
      "education_academy",
      "legal_law",
      "immigration",
      "advertising_marketing",
      "insurance_agency"
    ],
    "is_active": true
  },
  {
    "id": "contacts",
    "title": "مخاطبان و اشخاص",
    "price": 0,
    "category": "sales",
    "description": "دفترچه تلفن یکپارچه و پرونده مشخصات اشخاص و شرکت‌ها",
    "dependencies": [],
    "industries": [
      "manufacturing",
      "commerce_trade",
      "distribution_logistics",
      "contracting_projects",
      "real_estate",
      "healthcare_clinic",
      "medical_pharma",
      "it_software",
      "education_academy",
      "legal_law",
      "immigration",
      "advertising_marketing",
      "insurance_agency",
      "consulting_finance",
      "services_maintenance"
    ],
    "is_active": true
  },
  {
    "id": "crm",
    "title": "مدیریت ارتباط با مشتری (CRM)",
    "price": 800000,
    "category": "sales",
    "description": "مدیریت ارتباط با مشتریان و رهگیری خط لوله فرصت‌های فروش",
    "dependencies": [
      "mail",
      "calendar",
      "contacts",
      "activities"
    ],
    "industries": [
      "real_estate",
      "healthcare_clinic",
      "medical_pharma",
      "it_software",
      "education_academy",
      "legal_law",
      "immigration",
      "advertising_marketing",
      "insurance_agency",
      "consulting_finance",
      "services_maintenance"
    ],
    "is_active": true
  },
  {
    "id": "sale",
    "title": "فروش و پیش‌فاکتور",
    "price": 250000,
    "category": "sales",
    "description": "صدور پیش‌فاکتور، سفارشات فروش، امضای الکترونیک و نرخ‌نامه",
    "dependencies": [
      "crm",
      "account",
      "mail",
      "contacts",
      "activities"
    ],
    "industries": [
      "manufacturing",
      "commerce_trade",
      "distribution_logistics",
      "real_estate",
      "medical_pharma",
      "services_maintenance"
    ],
    "is_active": true
  },
  {
    "id": "account",
    "title": "حسابداری پایه",
    "price": 250000,
    "category": "finance",
    "description": "اسناد دوبل، تراز آزمایشی، سود و زیان، دفاتر مالی و استهلاک",
    "dependencies": [
      "mail",
      "contacts"
    ],
    "industries": [
      "manufacturing",
      "commerce_trade",
      "distribution_logistics",
      "contracting_projects",
      "real_estate",
      "healthcare_clinic",
      "medical_pharma",
      "it_software",
      "education_academy",
      "legal_law",
      "immigration",
      "advertising_marketing",
      "insurance_agency",
      "consulting_finance",
      "services_maintenance"
    ],
    "is_active": true
  },
  {
    "id": "project",
    "title": "پروژه",
    "price": 1000000,
    "category": "management",
    "description": "مدیریت پروژه‌ها، بردهای کانبان، نمودار گانت و مایل‌استون‌ها",
    "dependencies": [
      "mail",
      "contacts",
      "activities",
      "hr"
    ],
    "industries": [
      "contracting_projects",
      "it_software",
      "advertising_marketing",
      "consulting_finance",
      "services_maintenance"
    ],
    "is_active": true
  },
  {
    "id": "hr",
    "title": "کارمندان پایه",
    "price": 250000,
    "category": "hr",
    "description": "پرونده الکترونیک پرسنل، چارت سازمانی و مهارت‌های فردی",
    "dependencies": [
      "mail",
      "contacts"
    ],
    "industries": [
      "manufacturing",
      "commerce_trade",
      "distribution_logistics",
      "contracting_projects",
      "real_estate",
      "healthcare_clinic",
      "medical_pharma",
      "it_software",
      "education_academy",
      "legal_law",
      "immigration",
      "advertising_marketing",
      "insurance_agency",
      "consulting_finance",
      "services_maintenance"
    ],
    "is_active": true
  },
  {
    "id": "hr_attendance",
    "title": "حضور و غیاب پرسنل",
    "price": 250000,
    "category": "hr",
    "description": "ثبت ورود و خروج، محاسبه اضافه‌کاری و کسر کار پرسنل",
    "dependencies": [
      "hr"
    ],
    "industries": [
      "manufacturing",
      "distribution_logistics",
      "healthcare_clinic",
      "education_academy",
      "services_maintenance"
    ],
    "is_active": true
  },
  {
    "id": "hr_recruitment",
    "title": "استخدام و جذب نیرو",
    "price": 250000,
    "category": "hr",
    "description": "پایگاه کارجویان، مصاحبه‌های استخدامی و گردش جذب نیرو",
    "dependencies": [
      "hr",
      "survey",
      "mail",
      "calendar",
      "contacts"
    ],
    "industries": [
      "manufacturing",
      "it_software",
      "education_academy",
      "advertising_marketing"
    ],
    "is_active": true
  },
  {
    "id": "hr_holidays",
    "title": "مرخصی و ماموریت",
    "price": 250000,
    "category": "hr",
    "description": "ثبت و گردش تایید مرخصی استحقاقی، استعلاجی و ماموریت",
    "dependencies": [
      "hr",
      "contacts",
      "calendar",
      "activities"
    ],
    "industries": [
      "manufacturing",
      "distribution_logistics",
      "healthcare_clinic",
      "it_software",
      "education_academy"
    ],
    "is_active": true
  },
  {
    "id": "hr_contract",
    "title": "قرارداد کارمند",
    "price": 250000,
    "category": "hr",
    "description": "احکام اداری، ثبت قراردادهای استخدامی و تاریخ‌های تمدید",
    "dependencies": [
      "hr"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "hr_payroll",
    "title": "حقوق و دستمزد",
    "price": 250000,
    "category": "hr",
    "description": "محاسبه فیش حقوقی مطابق قانون کار، دیسکت بیمه و فایل بانکی",
    "dependencies": [
      "hr"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "barcode",
    "title": "بارکد",
    "price": 250000,
    "category": "logistics",
    "description": "اسکنر بارکدخوان پرتابل برای ورود کالا، انبارگردانی و خروج بار",
    "dependencies": [
      "stock"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "survey_feedback",
    "title": "نظرسنجی ها",
    "price": 250000,
    "category": "marketing",
    "description": "پرسشنامه‌های آنلاین و سنجش سطح رضایت مشتریان و پرسنل",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "appointment",
    "title": "قرار ملاقات",
    "price": 250000,
    "category": "productivity",
    "description": "لینک تقویم شخصی جهت رزرو آنلاین وقت و جلسه توسط مشتریان",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "im_livechat",
    "title": "چت انلاین",
    "price": 250000,
    "category": "marketing",
    "description": "ابزارک گفتگوی زنده با کاربران و مشتریان روی وب‌سایت",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "marketing_automation",
    "title": "اتوماسیون بازاریابی",
    "price": 250000,
    "category": "marketing",
    "description": "طراحی مسیر تعامل خودکار، پیام‌های مناسبتی و پیگیری سرنخ‌ها",
    "dependencies": [
      "crm"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "fleet",
    "title": "ناوگان",
    "price": 250000,
    "category": "hr",
    "description": "پرونده خودروها، سوابق بیمه، مصرف سوخت و رانندگان سازمانی",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "planning",
    "title": "برنامه ریزی",
    "price": 250000,
    "category": "management",
    "description": "زمان‌بندی شیفت‌های کاری، تخصیص نیروها و تقویم تیمی",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "event",
    "title": "رویداد",
    "price": 250000,
    "category": "marketing",
    "description": "مدیریت وبینارها، همایش‌ها، ثبت‌نام و بلیت‌فروشی",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "knowledge",
    "title": "دانش",
    "price": 250000,
    "category": "productivity",
    "description": "پایگاه دانش سازمانی، راهنماهای آموزشی و ویکی مستندات تیمی",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "maintenance",
    "title": "نگهداری و تعمیرات",
    "price": 250000,
    "category": "production",
    "description": "تعمیرات دوره‌ای پیشگیرانه (PM) و خرابی ماشین‌آلات فنی",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "documents",
    "title": "اسناد",
    "price": 250000,
    "category": "productivity",
    "description": "آرشیو امن ابری مدارک، پوشه‌بندی سازمانی و شناسایی اسناد",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "hr_timesheet",
    "title": "برگه ساعت کارکرد",
    "price": 250000,
    "category": "management",
    "description": "ثبت کارکرد ساعتی پرسنل بر روی تسک‌ها و کنترل راندمان",
    "dependencies": [
      "project"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "hr_expense",
    "title": "هزینه ها",
    "price": 250000,
    "category": "finance",
    "description": "ثبت فاکتورهای تنخواه، هزینه‌های جاری اداری و تاییدات مدیران",
    "dependencies": [
      "account"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "purchase",
    "title": "خرید و تدارکات",
    "price": 250000,
    "category": "logistics",
    "description": "درخواست استعلام قیمت، سفارش خرید سازمانی و ارزیابی تامین‌کننده",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "stock",
    "title": "انبار و کالا",
    "price": 250000,
    "category": "logistics",
    "description": "کاردکس کالا، کنترل موجودی چندانباره و نقطه سفارش خودکار",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "mrp",
    "title": "تولید",
    "price": 250000,
    "category": "production",
    "description": "فرمول ساخت کالا (BOM)، سفارشات کارگاهی و بهای تمام‌شده",
    "dependencies": [
      "stock"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "pos",
    "title": "صندوق",
    "price": 250000,
    "category": "sales",
    "description": "صندوق فروشگاهی لمسی، بارکدخوان، پوز بانکی و کارکرد آفلاین",
    "dependencies": [
      "stock"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "account_invoicing",
    "title": "فاکتور",
    "price": 250000,
    "category": "finance",
    "description": "صدور پیش‌فاکتور و فاکتور رسمی، لینک پرداخت و مالیات",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "account_budget",
    "title": "بودجه",
    "price": 250000,
    "category": "finance",
    "description": "بودجه‌بندی فصلی، کنترل هزینه‌های واقعی و گزارش انحراف",
    "dependencies": [
      "account"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "website",
    "title": "وب‌سایت",
    "price": 250000,
    "category": "marketing",
    "description": "صفحه‌ساز بصری درگ‌اند‌دراپ، سئو پیشرفته و وبلاگ سازمانی",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "website_sale",
    "title": "فروشگاه",
    "price": 250000,
    "category": "marketing",
    "description": "فروشگاه آنلاین کالا با درگاه پرداخت شاپرک و اتصال به انبار",
    "dependencies": [
      "website",
      "sale",
      "stock"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "sign",
    "title": "امضا",
    "price": 250000,
    "category": "productivity",
    "description": "امضای امن دیجیتالی اسناد، فرم‌ها و قراردادهای شرکتی",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "helpdesk",
    "title": "پشتیبانی",
    "price": 250000,
    "category": "management",
    "description": "میز خدمت، پورتال تیکت مشتریان و زمان‌بندی پاسخگویی SLA",
    "dependencies": [],
    "industries": [
      "it_software",
      "services_maintenance"
    ],
    "is_active": true
  },
  {
    "id": "field_service",
    "title": "خدمات در محل",
    "price": 250000,
    "category": "management",
    "description": "اعزام تکنسین فنی روی نقشه، ثبت قطعات و امضای مشتری",
    "dependencies": [
      "project",
      "stock"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "quality_control",
    "title": "کنترل کیفیت",
    "price": 250000,
    "category": "production",
    "description": "آزمون‌های استاندارد در خط تولید، انبار ورودی و گزارش عدم انطباق",
    "dependencies": [
      "stock"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "voip",
    "title": "تلفن ابری",
    "price": 250000,
    "category": "productivity",
    "description": "اتصال به سانترال و تلفن اینترنتی با پاپ‌آپ پرونده مشتری",
    "dependencies": [
      "crm"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "iot",
    "title": "اینترنت اشیا",
    "price": 250000,
    "category": "productivity",
    "description": "اتصال سخت‌افزارهای ترازو، بارکدخوان و سنسورهای صنعتی خط تولید",
    "dependencies": [
      "stock"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "ai_assistant",
    "title": "هوش مصنوعی",
    "price": 250000,
    "category": "productivity",
    "description": "نگارش هوشمند متون، تحلیل روند فروش و پیش‌بینی تقاضا",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "mass_mailing",
    "title": "ایمیل مارکتینگ",
    "price": 250000,
    "category": "marketing",
    "description": "ارسال ایمیل‌های تبلیغاتی انبوه، بخش‌بندی و گزارش نرخ بازگشایی",
    "dependencies": [],
    "industries": [],
    "is_active": false
  },
  {
    "id": "mass_mailing_sms",
    "title": "پیامک",
    "price": 250000,
    "category": "marketing",
    "description": "سامانه ارسال پیامک انبوه اطلاع‌رسانی، تخفیف و مناسبتی",
    "dependencies": [],
    "industries": [
      "healthcare_clinic",
      "education_academy",
      "advertising_marketing",
      "insurance_agency"
    ],
    "is_active": true
  },
  {
    "id": "loyalty",
    "title": "باشگاه مشتریان",
    "price": 250000,
    "category": "sales",
    "description": "امتیاز خرید، بن‌های هدیه، کوپن تخفیف و کارت وفاداری",
    "dependencies": [
      "sale"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "sale_subscription",
    "title": "اشتراک",
    "price": 250000,
    "category": "sales",
    "description": "صدور صورت‌حساب دوره‌ای، قراردادهای آبونمان و تمدید خودکار",
    "dependencies": [
      "sale"
    ],
    "industries": [],
    "is_active": false
  },
  {
    "id": "sale_renting",
    "title": "اجاره",
    "price": 250000,
    "category": "sales",
    "description": "قراردادهای کرایه کالا، تقویم تحویل و عودت و بیمه تجهیزات",
    "dependencies": [
      "sale"
    ],
    "industries": [],
    "is_active": false
  }
];

export const DEFAULT_PRESETS = [
  {
    "id": "advertising_marketing",
    "title": "تبلیغات، مارکتینگ و روابط عمومی",
    "icon": "Megaphone",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [],
    "default_modules": [
      "contacts",
      "mail",
      "crm",
      "project",
      "sale",
      "hr",
      "calendar",
      "survey",
      "hr_recruitment"
    ],
    "popular": false,
    "is_active": true
  },
  {
    "id": "commerce_trade",
    "title": "بازرگانی، واردات و صادرات",
    "icon": "Ship",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [],
    "default_modules": [
      "sale",
      "contacts",
      "crm",
      "mail",
      "hr",
      "calendar",
      "survey"
    ],
    "popular": false,
    "is_active": true
  },
  {
    "id": "consulting_finance",
    "title": "مشاوره مدیریت و خدمات مالی",
    "icon": "BarChart3",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [
      "account",
      "hr"
    ],
    "default_modules": [
      "contacts",
      "mail",
      "crm",
      "sale",
      "project",
      "calendar",
      "survey",
      "hr_recruitment"
    ],
    "popular": false,
    "is_active": true
  },
  {
    "id": "contracting_projects",
    "title": "پیمانکاری و پروژهمحور",
    "icon": "Building2",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [],
    "default_modules": [
      "contacts",
      "sale",
      "crm",
      "project",
      "hr",
      "mail",
      "hr_attendance",
      "calendar",
      "survey",
      "hr_recruitment"
    ],
    "popular": false,
    "is_active": true
  },
  {
    "id": "distribution_logistics",
    "title": "پخش، انبارداری و توزیع",
    "icon": "Truck",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [],
    "default_modules": [
      "sale",
      "contacts",
      "crm",
      "hr",
      "mail",
      "calendar",
      "survey",
      "activities"
    ],
    "popular": false,
    "is_active": true
  },
  {
    "id": "education_academy",
    "title": "آموزشگاهها و مراکز علمی",
    "icon": "GraduationCap",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [],
    "default_modules": [
      "contacts",
      "mail",
      "crm",
      "sale",
      "hr",
      "hr_attendance",
      "calendar",
      "survey",
      "activities",
      "hr_recruitment"
    ],
    "popular": false,
    "is_active": true
  },
  {
    "id": "healthcare_clinic",
    "title": "کلینیک، سلامت و درمان",
    "icon": "Stethoscope",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [],
    "default_modules": [
      "contacts",
      "mail",
      "crm",
      "hr",
      "hr_attendance",
      "calendar",
      "survey",
      "hr_holidays"
    ],
    "popular": false,
    "is_active": true
  },
  {
    "id": "immigration",
    "title": "مؤسسات مهاجرتی",
    "icon": "Plane",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [],
    "default_modules": [
      "contacts",
      "mail",
      "crm",
      "sale",
      "project",
      "hr",
      "calendar",
      "survey",
      "activities",
      "hr_holidays"
    ],
    "popular": false,
    "is_active": true
  },
  {
    "id": "insurance_agency",
    "title": "بیمه و نمایندگیها",
    "icon": "ShieldCheck",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [],
    "default_modules": [
      "contacts",
      "mail",
      "crm",
      "sale",
      "hr",
      "calendar",
      "survey",
      "hr_holidays"
    ],
    "popular": false,
    "is_active": true
  },
  {
    "id": "it_software",
    "title": "فناوری اطلاعات و نرمافزار",
    "icon": "Laptop",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [
      "calendar"
    ],
    "default_modules": [
      "contacts",
      "mail",
      "sale",
      "crm",
      "project",
      "hr",
      "hr_attendance",
      "calendar",
      "survey"
    ],
    "popular": false,
    "is_active": true
  },
  {
    "id": "legal_law",
    "title": "مؤسسات حقوقی و داوری",
    "icon": "Scale",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [],
    "default_modules": [
      "contacts",
      "mail",
      "crm",
      "project",
      "hr",
      "calendar",
      "survey",
      "hr_holidays"
    ],
    "popular": false,
    "is_active": true
  },
  {
    "id": "manufacturing",
    "title": "تولیدی و صنعتی",
    "icon": "Factory",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [],
    "default_modules": [
      "contacts",
      "sale",
      "crm",
      "mail",
      "project",
      "hr",
      "hr_attendance",
      "calendar",
      "survey"
    ],
    "popular": false,
    "is_active": true
  },
  {
    "id": "medical_pharma",
    "title": "تجهیزات پزشکی و دارویی",
    "icon": "Pill",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [],
    "default_modules": [
      "sale",
      "contacts",
      "crm",
      "project",
      "mail",
      "calendar",
      "survey",
      "hr_holidays",
      "hr"
    ],
    "popular": false,
    "is_active": true
  },
  {
    "id": "real_estate",
    "title": "املاک و مستغلات",
    "icon": "Building",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [],
    "default_modules": [
      "contacts",
      "sale",
      "crm",
      "hr",
      "mass_mailing_sms",
      "mail",
      "calendar",
      "survey",
      "hr_holidays"
    ],
    "popular": false,
    "is_active": true
  },
  {
    "id": "services_maintenance",
    "title": "خدماتی، تأسیساتی و تعمیرات",
    "icon": "Wrench",
    "category": "صنف",
    "description": "",
    "mandatory_modules": [],
    "default_modules": [
      "contacts",
      "sale",
      "mail",
      "crm",
      "project",
      "hr",
      "calendar",
      "survey"
    ],
    "popular": false,
    "is_active": true
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
