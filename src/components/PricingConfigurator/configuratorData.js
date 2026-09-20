export const DEFAULT_MODULES = [
  {
    "id": "account",
    "title": "حسابداری",
    "category": "عمومی",
    "price": 300000,
    "dependencies": [
      "mail",
      "contacts",
      "sale"
    ],
    "industries": [],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-14 05:54:49",
    "deleted_at": null
  },
  {
    "id": "activities",
    "title": "اقدامات و پیگیری‌ها",
    "category": "عمومی",
    "price": 90000,
    "dependencies": [
      "mail",
      "calendar",
      "contacts",
      "project"
    ],
    "industries": [
      "education_academy",
      "distribution_logistics",
      "immigration"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:47:07",
    "deleted_at": null
  },
  {
    "id": "ai_assistant",
    "title": "هوش مصنوعی",
    "category": "productivity",
    "price": 250000,
    "dependencies": [],
    "industries": [],
    "description": "نگارش هوشمند متون، تحلیل روند فروش و پیش‌بینی تقاضا",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "id": "calendar",
    "title": "گاهشمار",
    "category": "عمومی",
    "price": 0,
    "dependencies": [
      "mail",
      "contacts"
    ],
    "industries": [
      "medical_pharma",
      "it_software",
      "healthcare_clinic",
      "immigration",
      "legal_law",
      "real_estate",
      "services_maintenance",
      "manufacturing",
      "insurance_agency",
      "contracting_projects",
      "advertising_marketing",
      "commerce_trade",
      "distribution_logistics",
      "education_academy",
      "consulting_finance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:38:17",
    "deleted_at": null
  },
  {
    "id": "contacts",
    "title": "مخاطبان و اشخاص",
    "category": "عمومی",
    "price": 0,
    "dependencies": [],
    "industries": [
      "advertising_marketing",
      "commerce_trade",
      "consulting_finance",
      "contracting_projects",
      "distribution_logistics",
      "education_academy",
      "healthcare_clinic",
      "immigration",
      "insurance_agency",
      "it_software",
      "legal_law",
      "manufacturing",
      "medical_pharma",
      "real_estate",
      "services_maintenance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:38:51",
    "deleted_at": null
  },
  {
    "id": "crm",
    "title": "مدیریت ارتباط با مشتری (CRM)",
    "category": "عمومی",
    "price": 350000,
    "dependencies": [
      "mail",
      "calendar",
      "contacts"
    ],
    "industries": [
      "advertising_marketing",
      "commerce_trade",
      "consulting_finance",
      "contracting_projects",
      "distribution_logistics",
      "education_academy",
      "healthcare_clinic",
      "immigration",
      "insurance_agency",
      "it_software",
      "legal_law",
      "manufacturing",
      "medical_pharma",
      "real_estate",
      "services_maintenance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:40:18",
    "deleted_at": null
  },
  {
    "id": "helpdesk",
    "title": "پشتیبانی",
    "category": "management",
    "price": 250000,
    "dependencies": [],
    "industries": [],
    "description": "میز خدمت، پورتال تیکت مشتریان و زمان‌بندی پاسخگویی SLA",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-13 11:47:54",
    "deleted_at": null
  },
  {
    "id": "hr",
    "title": "کارمندان",
    "category": "عمومی",
    "price": 130000,
    "dependencies": [
      "mail",
      "contacts",
      "calendar"
    ],
    "industries": [
      "advertising_marketing",
      "commerce_trade",
      "contracting_projects",
      "distribution_logistics",
      "education_academy",
      "healthcare_clinic",
      "immigration",
      "insurance_agency",
      "it_software",
      "legal_law",
      "manufacturing",
      "medical_pharma",
      "real_estate",
      "services_maintenance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:42:25",
    "deleted_at": null
  },
  {
    "id": "hr_attendance",
    "title": "حضور و غیاب پرسنل",
    "category": "عمومی",
    "price": 100000,
    "dependencies": [
      "mail",
      "calendar",
      "contacts",
      "hr"
    ],
    "industries": [
      "contracting_projects",
      "education_academy",
      "healthcare_clinic",
      "it_software",
      "manufacturing"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:42:48",
    "deleted_at": null
  },
  {
    "id": "hr_holidays",
    "title": "مرخصی و ماموریت",
    "category": "عمومی",
    "price": 50000,
    "dependencies": [
      "hr",
      "contacts",
      "calendar",
      "mail"
    ],
    "industries": [
      "real_estate",
      "medical_pharma",
      "healthcare_clinic",
      "insurance_agency",
      "immigration",
      "legal_law"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:47:33",
    "deleted_at": null
  },
  {
    "id": "hr_payroll",
    "title": "حقوق و دستمزد",
    "category": "hr",
    "price": 250000,
    "dependencies": [
      "hr"
    ],
    "industries": [],
    "description": "محاسبه فیش حقوقی مطابق قانون کار، دیسکت بیمه و فایل بانکی",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "id": "hr_recruitment",
    "title": "استخدام و جذب نیرو",
    "category": "عمومی",
    "price": 80000,
    "dependencies": [
      "hr",
      "mail",
      "calendar",
      "contacts"
    ],
    "industries": [
      "advertising_marketing",
      "education_academy",
      "contracting_projects",
      "consulting_finance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:47:19",
    "deleted_at": null
  },
  {
    "id": "hr_timesheet",
    "title": "برگه ساعت کارکرد",
    "category": "management",
    "price": 250000,
    "dependencies": [
      "project"
    ],
    "industries": [],
    "description": "ثبت کارکرد ساعتی پرسنل بر روی تسک‌ها و کنترل راندمان",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "id": "im_livechat",
    "title": "چت انلاین",
    "category": "marketing",
    "price": 250000,
    "dependencies": [],
    "industries": [],
    "description": "ابزارک گفتگوی زنده با کاربران و مشتریان روی وب‌سایت",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "id": "knowledge",
    "title": "دانش",
    "category": "productivity",
    "price": 250000,
    "dependencies": [],
    "industries": [],
    "description": "پایگاه دانش سازمانی، راهنماهای آموزشی و ویکی مستندات تیمی",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "id": "loyalty",
    "title": "باشگاه مشتریان",
    "category": "sales",
    "price": 250000,
    "dependencies": [
      "sale"
    ],
    "industries": [],
    "description": "امتیاز خرید، بن‌های هدیه، کوپن تخفیف و کارت وفاداری",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "id": "mail",
    "title": "گفتگو",
    "category": "عمومی",
    "price": 0,
    "dependencies": [
      "contacts"
    ],
    "industries": [
      "advertising_marketing",
      "commerce_trade",
      "consulting_finance",
      "contracting_projects",
      "distribution_logistics",
      "education_academy",
      "healthcare_clinic",
      "immigration",
      "insurance_agency",
      "it_software",
      "legal_law",
      "manufacturing",
      "medical_pharma",
      "real_estate",
      "services_maintenance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:39:17",
    "deleted_at": null
  },
  {
    "id": "mass_mailing_sms",
    "title": "پیامک",
    "category": "marketing",
    "price": 100000,
    "dependencies": [],
    "industries": [],
    "description": "سامانه ارسال پیامک انبوه اطلاع‌رسانی، تخفیف و مناسبتی",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-13 11:49:35",
    "deleted_at": null
  },
  {
    "id": "project",
    "title": "پروژه",
    "category": "عمومی",
    "price": 150000,
    "dependencies": [
      "mail",
      "contacts",
      "calendar"
    ],
    "industries": [
      "advertising_marketing",
      "consulting_finance",
      "contracting_projects",
      "immigration",
      "it_software",
      "legal_law",
      "manufacturing",
      "medical_pharma",
      "services_maintenance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-15 14:41:38",
    "deleted_at": null
  },
  {
    "id": "sale",
    "title": "فروش",
    "category": "عمومی",
    "price": 250000,
    "dependencies": [
      "mail",
      "contacts",
      "calendar"
    ],
    "industries": [
      "advertising_marketing",
      "commerce_trade",
      "consulting_finance",
      "contracting_projects",
      "distribution_logistics",
      "education_academy",
      "immigration",
      "insurance_agency",
      "it_software",
      "manufacturing",
      "medical_pharma",
      "real_estate",
      "services_maintenance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 05:44:36",
    "deleted_at": null
  },
  {
    "id": "stock",
    "title": "انبار و کالا",
    "category": "logistics",
    "price": 250000,
    "dependencies": [],
    "industries": [],
    "description": "کاردکس کالا، کنترل موجودی چندانباره و نقطه سفارش خودکار",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  },
  {
    "id": "survey",
    "title": "فرم‌ساز",
    "category": "عمومی",
    "price": 150000,
    "dependencies": [
      "contacts",
      "calendar",
      "mail"
    ],
    "industries": [
      "advertising_marketing",
      "commerce_trade",
      "consulting_finance",
      "contracting_projects",
      "distribution_logistics",
      "education_academy",
      "healthcare_clinic",
      "immigration",
      "insurance_agency",
      "it_software",
      "legal_law",
      "manufacturing",
      "medical_pharma",
      "real_estate",
      "services_maintenance"
    ],
    "description": "",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 05:44:43",
    "deleted_at": null
  },
  {
    "id": "survey_feedback",
    "title": "نظرسنجی ها",
    "category": "marketing",
    "price": 250000,
    "dependencies": [],
    "industries": [],
    "description": "پرسشنامه‌های آنلاین و سنجش سطح رضایت مشتریان و پرسنل",
    "is_core": false,
    "is_recommended": false,
    "icon": "Package",
    "badge": null,
    "status": "active",
    "is_active": false,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-10 06:10:07",
    "deleted_at": null
  }
];

export const DEFAULT_PRESETS = [
  {
    "id": "advertising_marketing",
    "title": "تبلیغات، مارکتینگ و روابط عمومی",
    "category": "صنف",
    "icon": "Megaphone",
    "description": "",
    "mandatory_modules": [
      "calendar",
      "contacts",
      "mail",
      "crm"
    ],
    "default_modules": [
      "contacts",
      "crm",
      "project",
      "sale",
      "calendar",
      "activities",
      "mass_mailing_sms",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:16:02",
    "deleted_at": null
  },
  {
    "id": "commerce_trade",
    "title": "بازرگانی، واردات و صادرات",
    "category": "صنف",
    "icon": "Ship",
    "description": "",
    "mandatory_modules": [
      "sale",
      "activities",
      "contacts",
      "mail",
      "calendar"
    ],
    "default_modules": [
      "sale",
      "contacts",
      "crm",
      "hr",
      "activities",
      "mass_mailing_sms",
      "mail",
      "calendar"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:15:12",
    "deleted_at": null
  },
  {
    "id": "consulting_finance",
    "title": "مشاوره مدیریت و خدمات مالی",
    "category": "صنف",
    "icon": "BarChart3",
    "description": "",
    "mandatory_modules": [
      "activities",
      "project",
      "calendar",
      "contacts",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "crm",
      "project",
      "calendar",
      "survey",
      "hr",
      "activities",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:17:05",
    "deleted_at": null
  },
  {
    "id": "contracting_projects",
    "title": "پیمانکاری و پروژه‌محور",
    "category": "صنف",
    "icon": "Building2",
    "description": "",
    "mandatory_modules": [
      "project",
      "activities",
      "contacts",
      "sale",
      "calendar",
      "mail"
    ],
    "default_modules": [
      "project",
      "hr",
      "hr_attendance",
      "activities",
      "hr_holidays",
      "contacts",
      "sale",
      "calendar",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:18:03",
    "deleted_at": null
  },
  {
    "id": "distribution_logistics",
    "title": "پخش، انبارداری و توزیع",
    "category": "صنف",
    "icon": "Truck",
    "description": "",
    "mandatory_modules": [
      "activities",
      "contacts",
      "calendar",
      "mail"
    ],
    "default_modules": [
      "sale",
      "contacts",
      "activities",
      "mass_mailing_sms",
      "hr",
      "hr_holidays",
      "hr_attendance",
      "calendar",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:18:37",
    "deleted_at": null
  },
  {
    "id": "education_academy",
    "title": "آموزشگاه‌ها و مراکز علمی",
    "category": "صنف",
    "icon": "GraduationCap",
    "description": "",
    "mandatory_modules": [
      "crm",
      "survey",
      "calendar",
      "contacts",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "crm",
      "hr",
      "calendar",
      "survey",
      "activities",
      "mass_mailing_sms",
      "mail",
      "project"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:19:59",
    "deleted_at": null
  },
  {
    "id": "healthcare_clinic",
    "title": "کلینیک، سلامت و درمان",
    "category": "صنف",
    "icon": "Stethoscope",
    "description": "",
    "mandatory_modules": [
      "survey",
      "calendar",
      "activities",
      "contacts",
      "hr",
      "hr_attendance",
      "project",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "hr",
      "hr_attendance",
      "calendar",
      "survey",
      "mass_mailing_sms",
      "activities",
      "project",
      "mail",
      "hr_recruitment",
      "hr_holidays"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:21:04",
    "deleted_at": null
  },
  {
    "id": "immigration",
    "title": "مؤسسات مهاجرتی",
    "category": "صنف",
    "icon": "Plane",
    "description": "",
    "mandatory_modules": [
      "crm",
      "calendar",
      "contacts",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "crm",
      "calendar",
      "survey",
      "activities",
      "mass_mailing_sms",
      "mail",
      "project"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:27:26",
    "deleted_at": null
  },
  {
    "id": "insurance_agency",
    "title": "بیمه و نمایندگی‌ها",
    "category": "صنف",
    "icon": "ShieldCheck",
    "description": "",
    "mandatory_modules": [
      "crm",
      "sale",
      "calendar",
      "contacts",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "crm",
      "sale",
      "calendar",
      "survey",
      "activities",
      "mass_mailing_sms",
      "project",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:24:07",
    "deleted_at": null
  },
  {
    "id": "it_software",
    "title": "فناوری اطلاعات و نرم‌افزار",
    "category": "صنف",
    "icon": "Laptop",
    "description": "",
    "mandatory_modules": [
      "project",
      "activities",
      "mail",
      "calendar",
      "contacts"
    ],
    "default_modules": [
      "mail",
      "crm",
      "project",
      "hr",
      "activities",
      "hr_holidays",
      "hr_recruitment",
      "calendar",
      "contacts"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:25:19",
    "deleted_at": null
  },
  {
    "id": "legal_law",
    "title": "مؤسسات حقوقی و داوری",
    "category": "صنف",
    "icon": "Scale",
    "description": "",
    "mandatory_modules": [
      "crm",
      "calendar",
      "survey",
      "contacts",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "crm",
      "project",
      "survey",
      "activities",
      "calendar",
      "mass_mailing_sms",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:26:54",
    "deleted_at": null
  },
  {
    "id": "manufacturing",
    "title": "تولیدی و صنعتی",
    "category": "صنف",
    "icon": "Factory",
    "description": "",
    "mandatory_modules": [
      "sale",
      "activities",
      "contacts",
      "project",
      "calendar",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "sale",
      "hr",
      "hr_attendance",
      "activities",
      "hr_holidays",
      "project",
      "calendar",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:28:07",
    "deleted_at": null
  },
  {
    "id": "medical_pharma",
    "title": "تجهیزات پزشکی و دارویی",
    "category": "صنف",
    "icon": "Pill",
    "description": "",
    "mandatory_modules": [
      "crm",
      "sale",
      "contacts",
      "calendar",
      "mail"
    ],
    "default_modules": [
      "sale",
      "contacts",
      "crm",
      "hr_holidays",
      "activities",
      "mass_mailing_sms",
      "project",
      "calendar",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:30:52",
    "deleted_at": null
  },
  {
    "id": "real_estate",
    "title": "املاک و مستغلات",
    "category": "صنف",
    "icon": "Building",
    "description": "",
    "mandatory_modules": [
      "crm",
      "calendar",
      "survey",
      "contacts",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "crm",
      "mass_mailing_sms",
      "calendar",
      "survey",
      "activities",
      "project",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:31:29",
    "deleted_at": null
  },
  {
    "id": "services_maintenance",
    "title": "خدماتی، تأسیساتی و تعمیرات",
    "category": "صنف",
    "icon": "Wrench",
    "description": "",
    "mandatory_modules": [
      "activities",
      "project",
      "sale",
      "contacts",
      "calendar",
      "mail"
    ],
    "default_modules": [
      "contacts",
      "project",
      "hr",
      "activities",
      "mass_mailing_sms",
      "sale",
      "hr_attendance",
      "calendar",
      "mail"
    ],
    "popular": false,
    "status": "active",
    "is_active": true,
    "created_at": "2026-09-10 06:10:07",
    "updated_at": "2026-09-16 10:33:41",
    "deleted_at": null
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
