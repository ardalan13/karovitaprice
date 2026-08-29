import fs from 'fs';
import path from 'path';

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

export interface Department {
  id: number;
  name: string;
  icon: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'closed';

export interface Ticket {
  id: number;
  ticket_number: string;
  user_id: number;
  department_id: number;
  service_name: string;
  assigned_to: number | null;
  assigned_name: string | null;
  subject: string;
  status: TicketStatus;
  has_security_info: boolean;
  last_message: string;
  last_sender_type: 'user' | 'support' | 'system';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_id: number;
  sender_type: 'user' | 'support' | 'system';
  sender_name: string;
  message: string;
  is_security_info: boolean;
  ip_address: string;
  attachments?: TicketAttachment[];
  created_at: string;
  updated_at: string;
}

export interface TicketAttachment {
  id: number;
  ticket_id: number;
  message_id: number;
  user_id: number;
  file_name: string;
  file_data: string; // base64 or url
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface TicketHistory {
  id: number;
  ticket_id: number;
  user_id: number;
  user_name: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface SupportStaff {
  id: number;
  name: string;
  department: string;
  role: string;
  avatar?: string;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

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

  private nextDepartmentId = 5;
  private nextTicketId = 1004;
  private nextMessageId = 2008;
  private nextAttachmentId = 3001;
  private nextHistoryId = 4001;

  public departments: Department[] = [
    { id: 1, name: 'فروش', icon: 'ShoppingBag', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, name: 'پشتیبانی فنی', icon: 'Wrench', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, name: 'مالی', icon: 'CreditCard', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 4, name: 'سایر موارد', icon: 'HelpCircle', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];

  public supportStaff: SupportStaff[] = [
    { id: 1, name: 'علی رضایی', department: 'پشتیبانی فنی', role: 'کارشناس ارشد فنی' },
    { id: 2, name: 'سارا احمدی', department: 'مالی', role: 'کارشناس مالی' },
    { id: 3, name: 'محمد کریمی', department: 'فروش', role: 'کارشناس فروش' },
    { id: 4, name: 'رضا حسینی', department: 'سایر موارد', role: 'مدیر ارشد پشتیبانی' },
  ];

  public tickets: Ticket[] = [
    {
      id: 1001,
      ticket_number: '#58900157',
      user_id: 1,
      department_id: 2,
      service_name: 'پکیج پرواز کارویتا',
      assigned_to: 1,
      assigned_name: 'علی رضایی',
      subject: 'راهنمایی در اتصال وب‌هوک و API فروش',
      status: 'waiting_user',
      has_security_info: false,
      last_message: 'پاسخ ارسال شد: مستندات اتصال به وب‌هوک ارسال گردید.',
      last_sender_type: 'support',
      created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      closed_at: null,
    },
    {
      id: 1002,
      ticket_number: '#58900158',
      user_id: 1,
      department_id: 3,
      service_name: 'فاکتورهای پرداخت',
      assigned_to: 2,
      assigned_name: 'سارا احمدی',
      subject: 'درخواست صدور فاکتور رسمی به نام شرکت',
      status: 'in_progress',
      has_security_info: false,
      last_message: 'اطلاعات شناسه ملی و کد اقتصادی شرکت جهت صدور فاکتور ارسال شد.',
      last_sender_type: 'user',
      created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      closed_at: null,
    },
    {
      id: 1003,
      ticket_number: '#58900159',
      user_id: 1,
      department_id: 1,
      service_name: 'ارتقای پکیج به صعود',
      assigned_to: 3,
      assigned_name: 'محمد کریمی',
      subject: 'استعلام تخفیف تمدید سالانه پکیج صعود',
      status: 'closed',
      has_security_info: false,
      last_message: 'کد تخفیف اعمال شد و اشتراک با موفقیت تمدید گردید.',
      last_sender_type: 'support',
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      closed_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
  ];

  public messages: TicketMessage[] = [
    {
      id: 2001,
      ticket_id: 1001,
      sender_id: 1,
      sender_type: 'user',
      sender_name: 'کاربر سیستم',
      message: 'با سلام، برای دریافت وب‌هوک‌های تغییر وضعیت سفارشات به مستندات فنی و کلید دسترسی احتیاج دارم.',
      is_security_info: false,
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    },
    {
      id: 2002,
      ticket_id: 1001,
      sender_id: 1,
      sender_type: 'support',
      sender_name: 'علی رضایی (پشتیبانی فنی)',
      message: 'سلام و احترام، وب‌هوک‌های شما در بخش تنظیمات > وب‌هوک فعال گردید. مستندات نمونه کد برای شما ضمیمه شد.',
      is_security_info: false,
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 2003,
      ticket_id: 1002,
      sender_id: 1,
      sender_type: 'user',
      sender_name: 'کاربر سیستم',
      message: 'درود، لطفاً فاکتور دوره اخیر را با ارزش افزوده رسمی و به نام شرکت صادر فرمایید.',
      is_security_info: false,
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    },
    {
      id: 2004,
      ticket_id: 1002,
      sender_id: 2,
      sender_type: 'support',
      sender_name: 'سارا احمدی (واحد مالی)',
      message: 'سلام، لطفاً شناسه ملی، کد اقتصادی و آدرس ثبتی شرکت را در همین تیکت ارسال کنید.',
      is_security_info: false,
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    },
    {
      id: 2005,
      ticket_id: 1002,
      sender_id: 1,
      sender_type: 'user',
      sender_name: 'کاربر سیستم',
      message: 'اطلاعات شناسه ملی و کد اقتصادی شرکت جهت صدور فاکتور ارسال شد.',
      is_security_info: false,
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    },
    {
      id: 2006,
      ticket_id: 1003,
      sender_id: 1,
      sender_type: 'user',
      sender_name: 'کاربر سیستم',
      message: 'سلام، در صورت تمایل به تمدید یک‌ساله پکیج صعود امکان دریافت کد تخفیف ویژه وجود دارد؟',
      is_security_info: false,
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 2007,
      ticket_id: 1003,
      sender_id: 3,
      sender_type: 'support',
      sender_name: 'محمد کریمی (واحد فروش)',
      message: 'کد تخفیف اعمال شد و اشتراک با موفقیت تمدید گردید.',
      is_security_info: false,
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
  ];

  public attachments: TicketAttachment[] = [];

  public ticketHistories: TicketHistory[] = [
    {
      id: 4001,
      ticket_id: 1001,
      user_id: 1,
      user_name: 'کاربر سیستم',
      action: 'ایجاد تیکت',
      old_value: null,
      new_value: 'وضعیت: باز | دپارتمان: پشتیبانی فنی',
      created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    },
    {
      id: 4002,
      ticket_id: 1001,
      user_id: 1,
      user_name: 'مدیر ارشد',
      action: 'ارجاع تیکت',
      old_value: 'بدون پشتیبان',
      new_value: 'علی رضایی (پشتیبانی فنی)',
      created_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    },
    {
      id: 4003,
      ticket_id: 1001,
      user_id: 1,
      user_name: 'علی رضایی',
      action: 'ارسال پاسخ پشتیبان',
      old_value: 'وضعیت: در حال بررسی',
      new_value: 'وضعیت: در انتظار پاسخ',
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 4004,
      ticket_id: 1002,
      user_id: 1,
      user_name: 'کاربر سیستم',
      action: 'ایجاد تیکت',
      old_value: null,
      new_value: 'وضعیت: باز | دپارتمان: مالی و صورتحساب',
      created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    },
    {
      id: 4005,
      ticket_id: 1002,
      user_id: 2,
      user_name: 'سارا احمدی',
      action: 'ارسال پاسخ پشتیبان',
      old_value: 'وضعیت: باز',
      new_value: 'وضعیت: در انتظار پاسخ',
      created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    },
    {
      id: 4006,
      ticket_id: 1002,
      user_id: 1,
      user_name: 'کاربر سیستم',
      action: 'پاسخ کاربر',
      old_value: 'وضعیت: در انتظار پاسخ',
      new_value: 'وضعیت: در حال بررسی',
      created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    },
    {
      id: 4007,
      ticket_id: 1003,
      user_id: 1,
      user_name: 'کاربر سیستم',
      action: 'ایجاد تیکت',
      old_value: null,
      new_value: 'وضعیت: باز | دپارتمان: فروش',
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 4008,
      ticket_id: 1003,
      user_id: 3,
      user_name: 'محمد کریمی',
      action: 'بستن تیکت',
      old_value: 'وضعیت: در انتظار پاسخ',
      new_value: 'وضعیت: بسته شده',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
  ];

  constructor() {
    this.loadFromFile();
  }

  public save() {
    this.saveToFile();
  }

  public saveToFile() {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {
        nextUserId: this.nextUserId,
        nextCompanyId: this.nextCompanyId,
        nextPackageId: this.nextPackageId,
        nextOrderId: this.nextOrderId,
        nextTransactionId: this.nextTransactionId,
        nextSubscriptionId: this.nextSubscriptionId,
        nextOtpId: this.nextOtpId,
        nextDepartmentId: this.nextDepartmentId,
        nextTicketId: this.nextTicketId,
        nextMessageId: this.nextMessageId,
        nextAttachmentId: this.nextAttachmentId,
        nextHistoryId: this.nextHistoryId,
        users: this.users,
        companies: this.companies,
        packages: this.packages,
        orders: this.orders,
        transactions: this.transactions,
        subscriptions: this.subscriptions,
        otpCodes: this.otpCodes,
        departments: this.departments,
        supportStaff: this.supportStaff,
        tickets: this.tickets,
        messages: this.messages,
        attachments: this.attachments,
        ticketHistories: this.ticketHistories,
      };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB Persistence] Error writing db.json:', err);
    }
  }

  public loadFromFile() {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        if (raw && raw.trim()) {
          const data = JSON.parse(raw);
          if (data.users && Array.isArray(data.users)) this.users = data.users;
          if (data.companies && Array.isArray(data.companies)) this.companies = data.companies;
          if (data.packages && Array.isArray(data.packages)) this.packages = data.packages;
          if (data.orders && Array.isArray(data.orders)) this.orders = data.orders;
          if (data.transactions && Array.isArray(data.transactions)) this.transactions = data.transactions;
          if (data.subscriptions && Array.isArray(data.subscriptions)) this.subscriptions = data.subscriptions;
          if (data.otpCodes && Array.isArray(data.otpCodes)) this.otpCodes = data.otpCodes;
          if (data.departments && Array.isArray(data.departments)) this.departments = data.departments;
          if (data.supportStaff && Array.isArray(data.supportStaff)) this.supportStaff = data.supportStaff;
          if (data.tickets && Array.isArray(data.tickets)) this.tickets = data.tickets;
          if (data.messages && Array.isArray(data.messages)) this.messages = data.messages;
          if (data.attachments && Array.isArray(data.attachments)) this.attachments = data.attachments;
          if (data.ticketHistories && Array.isArray(data.ticketHistories)) this.ticketHistories = data.ticketHistories;

          if (data.nextUserId) this.nextUserId = data.nextUserId;
          if (data.nextCompanyId) this.nextCompanyId = data.nextCompanyId;
          if (data.nextPackageId) this.nextPackageId = data.nextPackageId;
          if (data.nextOrderId) this.nextOrderId = data.nextOrderId;
          if (data.nextTransactionId) this.nextTransactionId = data.nextTransactionId;
          if (data.nextSubscriptionId) this.nextSubscriptionId = data.nextSubscriptionId;
          if (data.nextOtpId) this.nextOtpId = data.nextOtpId;
          if (data.nextDepartmentId) this.nextDepartmentId = data.nextDepartmentId;
          if (data.nextTicketId) this.nextTicketId = data.nextTicketId;
          if (data.nextMessageId) this.nextMessageId = data.nextMessageId;
          if (data.nextAttachmentId) this.nextAttachmentId = data.nextAttachmentId;
          if (data.nextHistoryId) this.nextHistoryId = data.nextHistoryId;
          return;
        }
      }
      this.saveToFile();
    } catch (err) {
      console.error('[DB Persistence] Error loading db.json:', err);
    }
  }

  // Ticket Helpers
  generateTicketNumber(): string {
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    return `#${randomDigits}`;
  }

  getDepartmentById(id: number): Department | undefined {
    return this.departments.find(d => d.id === id);
  }

  getTicketById(id: number): Ticket | undefined {
    return this.tickets.find(t => t.id === id);
  }

  getTicketByNumber(num: string): Ticket | undefined {
    return this.tickets.find(t => t.ticket_number === num);
  }

  getMessagesByTicketId(ticketId: number): TicketMessage[] {
    return this.messages
      .filter(m => m.ticket_id === ticketId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(m => {
        const atts = this.attachments.filter(a => a.message_id === m.id);
        return { ...m, attachments: atts };
      });
  }

  getHistoryByTicketId(ticketId: number): TicketHistory[] {
    return this.ticketHistories
      .filter(h => h.ticket_id === ticketId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  createTicket(data: {
    user_id: number;
    department_id: number;
    service_name: string;
    subject: string;
    message: string;
    is_security_info?: boolean;
    attachments?: Array<{ file_name: string; file_data: string; file_type: string; file_size: number }>;
    ip_address?: string;
  }): Ticket {
    const user = this.getUserById(data.user_id);
    const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.mobile || 'کاربر';
    const dept = this.getDepartmentById(data.department_id);
    const now = new Date().toISOString();

    const ticket: Ticket = {
      id: this.nextTicketId++,
      ticket_number: this.generateTicketNumber(),
      user_id: data.user_id,
      department_id: data.department_id,
      service_name: data.service_name || 'سرویس عمومی',
      assigned_to: null,
      assigned_name: null,
      subject: data.subject.trim(),
      status: 'open',
      has_security_info: !!data.is_security_info,
      last_message: data.message.slice(0, 120),
      last_sender_type: 'user',
      created_at: now,
      updated_at: now,
      closed_at: null,
    };
    this.tickets.unshift(ticket);

    // Initial message
    const msgId = this.nextMessageId++;
    const message: TicketMessage = {
      id: msgId,
      ticket_id: ticket.id,
      sender_id: data.user_id,
      sender_type: 'user',
      sender_name: userName,
      message: data.message,
      is_security_info: !!data.is_security_info,
      ip_address: data.ip_address || '127.0.0.1',
      created_at: now,
      updated_at: now,
    };
    this.messages.push(message);

    // Attachments
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach(att => {
        this.attachments.push({
          id: this.nextAttachmentId++,
          ticket_id: ticket.id,
          message_id: msgId,
          user_id: data.user_id,
          file_name: att.file_name,
          file_data: att.file_data,
          file_type: att.file_type,
          file_size: att.file_size,
          created_at: now,
        });
      });
    }

    // History
    this.ticketHistories.push({
      id: this.nextHistoryId++,
      ticket_id: ticket.id,
      user_id: data.user_id,
      user_name: userName,
      action: 'ایجاد تیکت',
      old_value: null,
      new_value: `وضعیت: باز | دپارتمان: ${dept?.name || 'عمومی'}`,
      created_at: now,
    });

    this.saveToFile();
    return ticket;
  }

  addTicketMessage(data: {
    ticket_id: number;
    sender_id: number;
    sender_type: 'user' | 'support';
    sender_name: string;
    message: string;
    is_security_info?: boolean;
    attachments?: Array<{ file_name: string; file_data: string; file_type: string; file_size: number }>;
    ip_address?: string;
  }): TicketMessage {
    const ticket = this.getTicketById(data.ticket_id);
    if (!ticket) throw new Error('تیکت یافت نشد.');
    if (ticket.status === 'closed') throw new Error('این تیکت بسته شده است و امکان ارسال پیام وجود ندارد.');

    const now = new Date().toISOString();
    const msgId = this.nextMessageId++;
    const message: TicketMessage = {
      id: msgId,
      ticket_id: ticket.id,
      sender_id: data.sender_id,
      sender_type: data.sender_type,
      sender_name: data.sender_name,
      message: data.message,
      is_security_info: !!data.is_security_info,
      ip_address: data.ip_address || '127.0.0.1',
      created_at: now,
      updated_at: now,
    };
    this.messages.push(message);

    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach(att => {
        this.attachments.push({
          id: this.nextAttachmentId++,
          ticket_id: ticket.id,
          message_id: msgId,
          user_id: data.sender_id,
          file_name: att.file_name,
          file_data: att.file_data,
          file_type: att.file_type,
          file_size: att.file_size,
          created_at: now,
        });
      });
    }

    // Core rule:
    // If User sends message -> status = 'in_progress' (under review by support)
    // If Support sends message -> status = 'waiting_user' (waiting for user response)
    const prevStatus = ticket.status;
    let nextStatus: TicketStatus = prevStatus;
    if (data.sender_type === 'user') {
      nextStatus = 'in_progress';
    } else if (data.sender_type === 'support') {
      nextStatus = 'waiting_user';
    }

    ticket.status = nextStatus;
    ticket.last_message = data.message.slice(0, 120);
    ticket.last_sender_type = data.sender_type;
    ticket.updated_at = now;
    if (data.is_security_info) {
      ticket.has_security_info = true;
    }

    // History
    this.ticketHistories.push({
      id: this.nextHistoryId++,
      ticket_id: ticket.id,
      user_id: data.sender_id,
      user_name: data.sender_name,
      action: data.sender_type === 'user' ? 'ارسال پاسخ کاربر' : 'ارسال پاسخ پشتیبان',
      old_value: `وضعیت: ${this.getStatusLabel(prevStatus)}`,
      new_value: `وضعیت: ${this.getStatusLabel(nextStatus)}`,
      created_at: now,
    });

    this.saveToFile();
    return message;
  }

  closeTicket(ticketId: number, userId: number, userName: string): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('تیکت یافت نشد.');
    const now = new Date().toISOString();
    const prevStatus = ticket.status;
    ticket.status = 'closed';
    ticket.closed_at = now;
    ticket.updated_at = now;

    this.ticketHistories.push({
      id: this.nextHistoryId++,
      ticket_id: ticket.id,
      user_id: userId,
      user_name: userName,
      action: 'بستن تیکت',
      old_value: `وضعیت: ${this.getStatusLabel(prevStatus)}`,
      new_value: 'وضعیت: بسته شده',
      created_at: now,
    });

    this.saveToFile();
    return ticket;
  }

  reopenTicket(ticketId: number, userId: number, userName: string): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('تیکت یافت نشد.');
    const now = new Date().toISOString();
    const prevStatus = ticket.status;
    ticket.status = 'in_progress';
    ticket.closed_at = null;
    ticket.updated_at = now;

    this.ticketHistories.push({
      id: this.nextHistoryId++,
      ticket_id: ticket.id,
      user_id: userId,
      user_name: userName,
      action: 'بازگشایی تیکت',
      old_value: `وضعیت: ${this.getStatusLabel(prevStatus)}`,
      new_value: 'وضعیت: در حال بررسی',
      created_at: now,
    });

    this.saveToFile();
    return ticket;
  }

  assignTicket(ticketId: number, staffId: number, userId: number, userName: string): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('تیکت یافت نشد.');
    const staff = this.supportStaff.find(s => s.id === staffId);
    if (!staff) throw new Error('پشتیبان یافت نشد.');

    const oldName = ticket.assigned_name || 'تخصیص داده نشده';
    ticket.assigned_to = staff.id;
    ticket.assigned_name = staff.name;
    ticket.updated_at = new Date().toISOString();

    this.ticketHistories.push({
      id: this.nextHistoryId++,
      ticket_id: ticket.id,
      user_id: userId,
      user_name: userName,
      action: 'ارجاع به پشتیبان',
      old_value: oldName,
      new_value: staff.name,
      created_at: new Date().toISOString(),
    });

    this.saveToFile();
    return ticket;
  }

  changeTicketDepartment(ticketId: number, departmentId: number, userId: number, userName: string): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('تیکت یافت نشد.');
    const dept = this.getDepartmentById(departmentId);
    if (!dept) throw new Error('دپارتمان یافت نشد.');

    const oldDept = this.getDepartmentById(ticket.department_id)?.name || 'نامشخص';
    ticket.department_id = departmentId;
    ticket.updated_at = new Date().toISOString();

    this.ticketHistories.push({
      id: this.nextHistoryId++,
      ticket_id: ticket.id,
      user_id: userId,
      user_name: userName,
      action: 'تغییر دپارتمان',
      old_value: oldDept,
      new_value: dept.name,
      created_at: new Date().toISOString(),
    });

    this.saveToFile();
    return ticket;
  }

  changeTicketStatus(ticketId: number, status: TicketStatus, userId: number, userName: string): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('تیکت یافت نشد.');
    const prevStatus = ticket.status;
    ticket.status = status;
    ticket.updated_at = new Date().toISOString();
    if (status === 'closed') {
      ticket.closed_at = new Date().toISOString();
    } else {
      ticket.closed_at = null;
    }

    this.ticketHistories.push({
      id: this.nextHistoryId++,
      ticket_id: ticket.id,
      user_id: userId,
      user_name: userName,
      action: 'تغییر وضعیت دستی',
      old_value: `وضعیت: ${this.getStatusLabel(prevStatus)}`,
      new_value: `وضعیت: ${this.getStatusLabel(status)}`,
      created_at: new Date().toISOString(),
    });

    this.saveToFile();
    return ticket;
  }

  getStatusLabel(status: TicketStatus): string {
    switch (status) {
      case 'open': return 'باز';
      case 'in_progress': return 'در حال بررسی';
      case 'waiting_user': return 'در انتظار پاسخ';
      case 'closed': return 'بسته شده';
      default: return status;
    }
  }

  getUserTicketCounts(userId: number) {
    const userTickets = this.tickets.filter(t => t.user_id === userId);
    return {
      all: userTickets.length,
      open: userTickets.filter(t => t.status === 'open').length,
      in_progress: userTickets.filter(t => t.status === 'in_progress').length,
      waiting_user: userTickets.filter(t => t.status === 'waiting_user').length,
      closed: userTickets.filter(t => t.status === 'closed').length,
    };
  }

  getAdminTicketCounts() {
    return {
      all: this.tickets.length,
      open: this.tickets.filter(t => t.status === 'open').length,
      in_progress: this.tickets.filter(t => t.status === 'in_progress').length,
      waiting_user: this.tickets.filter(t => t.status === 'waiting_user').length,
      closed: this.tickets.filter(t => t.status === 'closed').length,
    };
  }

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
    this.saveToFile();
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
    this.saveToFile();
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
    this.saveToFile();
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
        this.saveToFile();
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
    this.saveToFile();
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
    this.saveToFile();
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
    this.saveToFile();
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
    this.saveToFile();
    return sub;
  }
}

export const db = new Database();
