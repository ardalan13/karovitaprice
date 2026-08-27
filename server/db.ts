export interface User {
  id: number;
  mobile: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  job_title: string | null;
  role: 'user' | 'admin';
  onboarding_step: number;
  onboarding_completed_at: string | null;
  mobile_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  user_id: number;
  name: string;
  industry: string;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_days: number;
  usage_limit: number | null;
  is_featured: boolean;
  is_active: boolean;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  package_id: number;
  order_number: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  created_at: string;
}

export interface Transaction {
  id: number;
  order_id: number;
  user_id: number;
  gateway: string;
  authority: string;
  reference_id: string | null;
  amount: number;
  status: 'initiated' | 'successful' | 'failed' | 'refunded';
  raw_response: any;
  paid_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  package_id: number;
  order_id: number | null;
  source: 'trial' | 'purchase' | 'admin';
  status: 'active' | 'expired' | 'cancelled';
  starts_at: string;
  expires_at: string;
  usage_limit: number | null;
  usage_used: number;
  created_at: string;
}

export interface OtpCode {
  id: number;
  mobile: string;
  purpose: 'login' | 'payment' | 'profile';
  code: string;
  code_hash: string;
  status: 'sent' | 'verified' | 'expired' | 'blocked' | 'failed';
  attempts: number;
  expires_at: number; // timestamp ms
  created_at: number; // timestamp ms
}

class Database {
  private nextUserId = 2;
  private nextCompanyId = 1;
  private nextPackageId = 5;
  private nextOrderId = 1;
  private nextTransactionId = 1;
  private nextSubscriptionId = 1;
  private nextOtpId = 1;

  public users: User[] = [
    {
      id: 1,
      mobile: '09120000000',
      first_name: 'مدیر',
      last_name: 'سیستم',
      email: 'admin@karovita.ir',
      job_title: 'مدیر ارشد سیستم',
      role: 'admin',
      onboarding_step: 3,
      onboarding_completed_at: new Date().toISOString(),
      mobile_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  public companies: Company[] = [];

  public packages: Package[] = [
    {
      id: 1,
      name: 'آزمایشی ۵ روزه کارویتا',
      slug: 'trial',
      description: 'دسترسی آزمایشی برای بررسی امکانات',
      price: 0,
      duration_days: 5,
      usage_limit: null,
      is_featured: false,
      is_active: true,
      features: ['تمام امکانات پایه', 'بدون نیاز به پرداخت', 'فعال‌سازی فوری'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'تیک‌آف کارویتا',
      slug: 'takeoff',
      description: 'مناسب تیم‌های کوچک و استارتاپ‌ها',
      price: 799000,
      duration_days: 30,
      usage_limit: 1000,
      is_featured: true,
      is_active: true,
      features: ['مدیریت مشتریان', 'مدیریت فروش', 'ذخیره‌سازی ۷ گیگابایت'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'پرواز کارویتا',
      slug: 'flight',
      description: 'مناسب کسب‌وکارهای در حال رشد',
      price: 1099000,
      duration_days: 30,
      usage_limit: 3000,
      is_featured: false,
      is_active: true,
      features: ['اتوماسیون فروش', 'گزارش‌های پیشرفته', 'ذخیره‌سازی ۱۵ گیگابایت'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'صعود کارویتا',
      slug: 'climb',
      description: 'مناسب سازمان‌ها و شرکت‌های بزرگ',
      price: 4899000,
      duration_days: 365,
      usage_limit: null,
      is_featured: false,
      is_active: true,
      features: ['تمام ماژول‌ها', 'کاربر نامحدود', 'پشتیبانی اختصاصی'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  public orders: Order[] = [];
  public transactions: Transaction[] = [];
  public subscriptions: Subscription[] = [];
  public otpCodes: OtpCode[] = [];

  // OTP Helpers
  addOtp(mobile: string, code: string, ttlSeconds: number) {
    const otp: OtpCode = {
      id: this.nextOtpId++,
      mobile,
      purpose: 'login',
      code,
      code_hash: code,
      status: 'sent',
      attempts: 0,
      expires_at: Date.now() + ttlSeconds * 1000,
      created_at: Date.now(),
    };
    this.otpCodes.push(otp);
    return otp;
  }

  getRecentOtpsCount(mobile: string, windowSeconds = 3600): number {
    const cutoff = Date.now() - windowSeconds * 1000;
    return this.otpCodes.filter(o => o.mobile === mobile && o.created_at > cutoff).length;
  }

  getLastOtp(mobile: string): OtpCode | undefined {
    const filtered = this.otpCodes.filter(o => o.mobile === mobile);
    return filtered[filtered.length - 1];
  }

  // User Helpers
  getUserByMobile(mobile: string): User | undefined {
    return this.users.find(u => u.mobile === mobile);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }

  createUser(mobile: string): User {
    const newUser: User = {
      id: this.nextUserId++,
      mobile,
      first_name: null,
      last_name: null,
      email: null,
      job_title: null,
      role: mobile === '09120000000' ? 'admin' : 'user',
      onboarding_step: 1,
      onboarding_completed_at: null,
      mobile_verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // Company Helpers
  getCompanyByUserId(userId: number): Company | undefined {
    return this.companies.find(c => c.user_id === userId);
  }

  upsertCompany(userId: number, name: string, industry: string, employee_count: number): Company {
    let company = this.getCompanyByUserId(userId);
    if (company) {
      company.name = name;
      company.industry = industry;
      company.employee_count = employee_count;
      company.updated_at = new Date().toISOString();
    } else {
      company = {
        id: this.nextCompanyId++,
        user_id: userId,
        name,
        industry,
        employee_count,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.companies.push(company);
    }
    return company;
  }

  // Package Helpers
  getPackageById(id: number): Package | undefined {
    return this.packages.find(p => p.id === id);
  }

  upsertPackage(data: Partial<Package> & { name: string; price: number }): Package {
    if (data.id) {
      const pkg = this.getPackageById(data.id);
      if (pkg) {
        Object.assign(pkg, {
          ...data,
          updated_at: new Date().toISOString(),
        });
        return pkg;
      }
    }
    const newPkg: Package = {
      id: this.nextPackageId++,
      name: data.name,
      slug: data.slug || `package-${Date.now()}`,
      description: data.description || '',
      price: data.price || 0,
      duration_days: data.duration_days || 30,
      usage_limit: data.usage_limit ?? null,
      is_featured: !!data.is_featured,
      is_active: data.is_active ?? true,
      features: data.features || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.packages.push(newPkg);
    return newPkg;
  }

  // Orders & Subscriptions
  createOrder(userId: number, packageId: number, amount: number): Order {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const order: Order = {
      id: this.nextOrderId++,
      user_id: userId,
      package_id: packageId,
      order_number: `ORD-${dateStr}-${rand}`,
      amount,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.orders.push(order);
    return order;
  }

  createTransaction(orderId: number, userId: number, authority: string, amount: number): Transaction {
    const tx: Transaction = {
      id: this.nextTransactionId++,
      order_id: orderId,
      user_id: userId,
      gateway: 'sandbox',
      authority,
      reference_id: null,
      amount,
      status: 'initiated',
      raw_response: null,
      paid_at: null,
      created_at: new Date().toISOString(),
    };
    this.transactions.push(tx);
    return tx;
  }

  createSubscription(
    userId: number,
    packageId: number,
    orderId: number | null,
    source: 'trial' | 'purchase' | 'admin',
    durationDays: number,
    usageLimit: number | null
  ): Subscription {
    const now = new Date();
    const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const sub: Subscription = {
      id: this.nextSubscriptionId++,
      user_id: userId,
      package_id: packageId,
      order_id: orderId,
      source,
      status: 'active',
      starts_at: now.toISOString(),
      expires_at: expires.toISOString(),
      usage_limit: usageLimit,
      usage_used: 0,
      created_at: now.toISOString(),
    };
    this.subscriptions.push(sub);
    return sub;
  }
}

export const db = new Database();
