export interface ERPModule {
  id: string;
  title: string;
  price: number;
  dependencies: string[];
  industries: string[];
  description?: string;
  is_active?: boolean;
  order_index?: number;
}

export interface IndustryPreset {
  id: string;
  title: string;
  default_modules: string[];
}

export interface Coupon {
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  is_active: boolean;
  expires_at?: string;
}

export const INITIAL_ERP_MODULES: ERPModule[] = [
  // Column 1 (Right in RTL 3-col layout)
  { id: "crm", title: "مدیریت مشتریان (CRM)", price: 790000, dependencies: [], industries: ["full_integration", "service", "commerce"] },
  { id: "restaurant", title: "مدیریت رستوران", price: 850000, dependencies: ["pos"], industries: ["service"] },
  { id: "timesheet", title: "تایم‌شیت", price: 350000, dependencies: ["project"], industries: ["full_integration", "software", "service"] },
  { id: "calendar", title: "تقویم", price: 250000, dependencies: [], industries: ["full_integration", "service"] },
  { id: "documents", title: "اسناد", price: 500000, dependencies: [], industries: ["full_integration", "commerce", "manufacturing"] },
  { id: "tax", title: "سامانه مودیان", price: 950000, dependencies: ["accounting"], industries: ["full_integration", "manufacturing", "commerce"] },
  { id: "inventory", title: "انبار", price: 890000, dependencies: [], industries: ["full_integration", "manufacturing", "commerce", "store"] },
  { id: "hr", title: "کارمندان", price: 600000, dependencies: [], industries: ["full_integration", "manufacturing", "service"] },
  { id: "payroll", title: "حقوق و دستمزد", price: 850000, dependencies: ["hr", "attendance"], industries: ["full_integration", "manufacturing"] },

  // Column 2 (Middle in RTL 3-col layout)
  { id: "sale", title: "فروش", price: 890000, dependencies: ["crm"], industries: ["full_integration", "commerce", "store"] },
  { id: "barcode", title: "بارکد", price: 400000, dependencies: ["inventory"], industries: ["full_integration", "store", "commerce"] },
  { id: "helpdesk", title: "پشتیبانی (Helpdesk)", price: 690000, dependencies: ["crm"], industries: ["full_integration", "software", "service"] },
  { id: "appointment", title: "نوبت‌دهی", price: 450000, dependencies: ["calendar"], industries: ["service"] },
  { id: "shift", title: "شیفت‌بندی", price: 400000, dependencies: ["hr"], industries: ["manufacturing", "store"] },
  { id: "accounting", title: "حسابداری", price: 990000, dependencies: [], industries: ["full_integration", "manufacturing", "commerce"] },
  { id: "purchase", title: "خرید", price: 790000, dependencies: ["inventory"], industries: ["full_integration", "manufacturing", "commerce"] },
  { id: "attendance", title: "حضور و غیاب", price: 450000, dependencies: ["hr"], industries: ["full_integration", "manufacturing"] },
  { id: "recruitment", title: "استخدام", price: 550000, dependencies: ["hr"], industries: ["full_integration"] },

  // Column 3 (Left in RTL 3-col layout)
  { id: "pos", title: "فروش حضوری (POS)", price: 650000, dependencies: ["sale", "inventory"], industries: ["full_integration", "store"] },
  { id: "project", title: "پروژه", price: 750000, dependencies: [], industries: ["full_integration", "software", "service"] },
  { id: "knowledge", title: "دانشنامه", price: 300000, dependencies: [], industries: ["software"] },
  { id: "survey", title: "نظرسنجی", price: 300000, dependencies: [], industries: ["full_integration"] },
  { id: "sms", title: "پیامک", price: 200000, dependencies: [], industries: ["full_integration", "commerce", "store"] },
  { id: "expenses", title: "هزینه‌ها", price: 350000, dependencies: ["accounting"], industries: ["full_integration"] },
  { id: "mrp", title: "تولید", price: 1200000, dependencies: ["inventory", "purchase"], industries: ["full_integration", "manufacturing"] },
  { id: "leaves", title: "مرخصی", price: 350000, dependencies: ["hr"], industries: ["full_integration"] },
  { id: "im_livechat", title: "گفتگوی آنلاین", price: 400000, dependencies: [], industries: ["full_integration", "software", "store"] }
];

export const INITIAL_PRESETS: IndustryPreset[] = [
  { id: "full_integration", title: "یکپارچگی کامل", default_modules: ["crm", "sale", "accounting", "inventory"] },
  { id: "service", title: "خدماتی", default_modules: ["crm", "project", "helpdesk", "calendar"] },
  { id: "manufacturing", title: "تولیدی", default_modules: ["accounting", "inventory", "purchase", "mrp", "hr"] },
  { id: "software", title: "نرم‌افزار", default_modules: ["project", "timesheet", "helpdesk", "knowledge", "im_livechat"] },
  { id: "commerce", title: "بازرگانی", default_modules: ["crm", "sale", "inventory", "purchase", "accounting", "documents"] },
  { id: "store", title: "فروشگاهی", default_modules: ["pos", "sale", "inventory", "barcode", "crm"] }
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: 'KAROVITA20', discount_type: 'percent', discount_value: 20, is_active: true },
  { code: 'WELCOME', discount_type: 'fixed', discount_value: 500000, min_order_amount: 2000000, is_active: true },
  { code: 'OFF10', discount_type: 'percent', discount_value: 10, is_active: true }
];
