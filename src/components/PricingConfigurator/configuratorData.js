export const DEFAULT_MODULES = [
  // Column 1 (Right column in RTL 3-column grid)
  { id: "crm", title: "مدیریت مشتریان (CRM)", price: 790000, dependencies: [], industries: ["full_integration", "service", "commerce"] },
  { id: "restaurant", title: "مدیریت رستوران", price: 850000, dependencies: ["pos"], industries: ["service"] },
  { id: "timesheet", title: "تایم‌شیت", price: 350000, dependencies: ["project"], industries: ["full_integration", "software", "service"] },
  { id: "calendar", title: "تقویم", price: 250000, dependencies: [], industries: ["full_integration", "service"] },
  { id: "documents", title: "اسناد", price: 500000, dependencies: [], industries: ["full_integration", "commerce", "manufacturing"] },
  { id: "tax", title: "سامانه مودیان", price: 950000, dependencies: ["accounting"], industries: ["full_integration", "manufacturing", "commerce"] },
  { id: "inventory", title: "انبار", price: 890000, dependencies: [], industries: ["full_integration", "manufacturing", "commerce", "store"] },
  { id: "hr", title: "کارمندان", price: 600000, dependencies: [], industries: ["full_integration", "manufacturing", "service"] },
  { id: "payroll", title: "حقوق و دستمزد", price: 850000, dependencies: ["hr", "attendance"], industries: ["full_integration", "manufacturing"] },

  // Column 2 (Middle column in RTL 3-column grid)
  { id: "sale", title: "فروش", price: 890000, dependencies: ["crm"], industries: ["full_integration", "commerce", "store"] },
  { id: "barcode", title: "بارکد", price: 400000, dependencies: ["inventory"], industries: ["full_integration", "store", "commerce"] },
  { id: "helpdesk", title: "پشتیبانی (Helpdesk)", price: 690000, dependencies: ["crm"], industries: ["full_integration", "software", "service"] },
  { id: "appointment", title: "نوبت‌دهی", price: 450000, dependencies: ["calendar"], industries: ["service"] },
  { id: "shift", title: "شیفت‌بندی", price: 400000, dependencies: ["hr"], industries: ["manufacturing", "store"] },
  { id: "accounting", title: "حسابداری", price: 990000, dependencies: [], industries: ["full_integration", "manufacturing", "commerce"] },
  { id: "purchase", title: "خرید", price: 790000, dependencies: ["inventory"], industries: ["full_integration", "manufacturing", "commerce"] },
  { id: "attendance", title: "حضور و غیاب", price: 450000, dependencies: ["hr"], industries: ["full_integration", "manufacturing"] },
  { id: "recruitment", title: "استخدام", price: 550000, dependencies: ["hr"], industries: ["full_integration"] },

  // Column 3 (Left column in RTL 3-column grid)
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

export const DEFAULT_PRESETS = [
  { id: "full_integration", title: "یکپارچگی کامل", default_modules: ["crm", "sale", "accounting", "inventory"] },
  { id: "service", title: "خدماتی", default_modules: ["crm", "project", "helpdesk", "calendar"] },
  { id: "manufacturing", title: "تولیدی", default_modules: ["accounting", "inventory", "purchase", "mrp", "hr"] },
  { id: "software", title: "نرم‌افزار", default_modules: ["project", "timesheet", "helpdesk", "knowledge", "im_livechat"] },
  { id: "commerce", title: "بازرگانی", default_modules: ["crm", "sale", "inventory", "purchase", "accounting", "documents"] },
  { id: "store", title: "فروشگاهی", default_modules: ["pos", "sale", "inventory", "barcode", "crm"] }
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
export function resolveAllDependencies(selectedIds, modulesList) {
  const modMap = new Map(modulesList.map(m => [m.id, m]));
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
export function getLockedDependenciesMap(activeIds, modulesList) {
  const modMap = new Map(modulesList.map(m => [m.id, m]));
  const lockedMap = {};

  for (const id of activeIds) {
    const parent = modMap.get(id);
    if (!parent || !Array.isArray(parent.dependencies)) continue;

    // For each dependency of this active module, find its recursive chain
    const queue = [...parent.dependencies];
    const visited = new Set();

    while (queue.length > 0) {
      const depId = queue.shift();
      if (!depId || visited.has(depId)) continue;
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
