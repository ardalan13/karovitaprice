import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Headphones,
  Cloud,
  Zap,
  ChevronLeft,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  LayoutDashboard,
  Layers,
  BarChart3,
  Settings,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  CreditCard
} from 'lucide-react';

export function Welcome() {
  const nav = useNavigate();

  function go(intent) {
    localStorage.setItem('intent', intent);
    nav('/auth');
  }

  return (
    <main className="welcome-hero-page" dir="rtl">
      {/* RIGHT COLUMN: BRAND & MARKETING HERO (First child in RTL displays on the right side) */}
      <section className="welcome-content-side">
        {/* Top Logo */}
        <header className="hero-brand-header">
          <div className="hero-logo-wrap">
            <img src="/karovita-logo.svg" alt="کارویتا" />
          </div>
        </header>

        {/* Main Hero Pitch */}
        <div className="hero-main-pitch">
          <div className="hero-category-pill">
            <span>نرم‌افزار مدیریت یکپارچه</span>
          </div>

          <h1 className="hero-main-title">
            یک فضای کاری ساده،<br />
            سریع و قابل توسعه
          </h1>

          <p className="hero-main-desc">
            از مدیریت مشتریان تا فروش و گزارش‌ها، همه‌چیز را در یک داشبورد حرفه‌ای کنترل کنید و کسب‌وکارتان را رشد دهید.
          </p>

          {/* Action CTA Buttons */}
          <div className="hero-action-buttons">
            <button className="btn-primary-trial" onClick={() => go('trial')}>
              <span>۵ روز رایگان شروع کنید</span>
              <ChevronLeft size={18} />
            </button>

            <button className="btn-secondary-plans" onClick={() => go('buy')}>
              <span>مشاهده پلن‌ها</span>
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Login text link */}
          <div className="hero-signin-row">
            <span>قبلاً ثبت‌نام کرده‌اید؟</span>
            <button className="hero-signin-link" onClick={() => go('login')}>
              ورود به حساب
            </button>
          </div>
        </div>

        {/* Bottom Features Quad Row */}
        <footer className="hero-features-footer">
          <div className="feature-quad-item">
            <div className="feature-quad-icon">
              <ShieldCheck size={20} strokeWidth={1.8} />
            </div>
            <strong className="feature-quad-title">امن و مطمئن</strong>
            <p className="feature-quad-desc">اطلاعات شما کاملاً محافظت می‌شود</p>
          </div>

          <div className="feature-quad-item">
            <div className="feature-quad-icon">
              <Headphones size={20} strokeWidth={1.8} />
            </div>
            <strong className="feature-quad-title">پشتیبانی سریع</strong>
            <p className="feature-quad-desc">همیشه در کنار شما برای پاسخگویی</p>
          </div>

          <div className="feature-quad-item">
            <div className="feature-quad-icon">
              <Cloud size={20} strokeWidth={1.8} />
            </div>
            <strong className="feature-quad-title">دسترسی ابری</strong>
            <p className="feature-quad-desc">از هرجا و در هر زمان به کسب‌وکارتان دسترسی دارید</p>
          </div>

          <div className="feature-quad-item">
            <div className="feature-quad-icon">
              <Zap size={20} strokeWidth={1.8} />
            </div>
            <strong className="feature-quad-title">عملکرد بالا</strong>
            <p className="feature-quad-desc">سریع، پایدار و بدون محدودیت</p>
          </div>
        </footer>
      </section>

      {/* LEFT COLUMN: 3D ISOMETRIC DASHBOARD ART (Second child in RTL displays on the left side) */}
      <section className="welcome-art-side">
        {/* Isometric dot grid background pattern */}
        <div className="art-dots-pattern" />

        {/* Ambient radial lighting glow */}
        <div className="art-ambient-glow" />

        {/* 3D Perspective Showcase Container */}
        <div className="showcase-perspective-wrap">
          <div className="showcase-mockup-frame">
            {/* 1. Main Dashboard Window */}
            <div className="mockup-dashboard-card">
              {/* Dashboard Content (Left part in mockup) */}
              <div className="mockup-dash-content">
                {/* Top Search Bar & Header */}
                <div className="mockup-dash-topbar">
                  <div className="mockup-logo-mini">
                    <img src="/karovita-logo.svg" alt="کارویتا" />
                  </div>
                  <div className="mockup-search-input">
                    <Search size={14} color="#94a3b8" />
                    <span>جستجو...</span>
                  </div>
                  <div className="mockup-profile-dot" />
                </div>

                {/* Top 3 Metric Stat Cards */}
                <div className="mockup-stats-row">
                  <div className="mockup-stat-card">
                    <div className="mockup-stat-icon orange">
                      <Package size={16} />
                    </div>
                    <div className="mockup-stat-info">
                      <span className="mockup-stat-title">سفارشات امروز</span>
                      <div className="mockup-stat-value-row">
                        <b className="mockup-stat-num">۲۴</b>
                        <span className="mockup-stat-growth green">↑ ۱۲٪</span>
                      </div>
                    </div>
                  </div>

                  <div className="mockup-stat-card">
                    <div className="mockup-stat-icon blue">
                      <Users size={16} />
                    </div>
                    <div className="mockup-stat-info">
                      <span className="mockup-stat-title">مشتریان جدید</span>
                      <div className="mockup-stat-value-row">
                        <b className="mockup-stat-num">۱۸</b>
                        <span className="mockup-stat-growth green">↑ ۸٪</span>
                      </div>
                    </div>
                  </div>

                  <div className="mockup-stat-card">
                    <div className="mockup-stat-icon purple">
                      <CreditCard size={16} />
                    </div>
                    <div className="mockup-stat-info">
                      <span className="mockup-stat-title">درآمد</span>
                      <div className="mockup-stat-value-row">
                        <b className="mockup-stat-num small">۱۲,۴۵۰,۰۰۰</b>
                        <span className="mockup-stat-currency">تومان</span>
                        <span className="mockup-stat-growth green">↑ ۱۰٪</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sales Chart Section */}
                <div className="mockup-chart-box">
                  <div className="mockup-chart-head">
                    <h4>نمودار فروش</h4>
                    <span className="mockup-chart-filter">هفتگی</span>
                  </div>
                  <div className="mockup-svg-chart-wrap">
                    <svg viewBox="0 0 440 130" className="mockup-sales-svg" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartFillGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Horizontal Guidelines */}
                      <line x1="40" y1="20" x2="430" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                      <line x1="40" y1="55" x2="430" y2="55" stroke="#f1f5f9" strokeDasharray="3 3" />
                      <line x1="40" y1="90" x2="430" y2="90" stroke="#f1f5f9" strokeDasharray="3 3" />

                      {/* Y-axis Labels */}
                      <text x="30" y="24" fontSize="9" fill="#94a3b8" textAnchor="end">۲۰۰</text>
                      <text x="30" y="59" fontSize="9" fill="#94a3b8" textAnchor="end">۱۵۰</text>
                      <text x="30" y="94" fontSize="9" fill="#94a3b8" textAnchor="end">۱۰۰</text>
                      <text x="30" y="122" fontSize="9" fill="#94a3b8" textAnchor="end">۵۰</text>

                      {/* Area Fill */}
                      <path
                        d="M 50 110 Q 95 80, 120 75 T 190 92 T 260 52 T 330 75 T 395 38 L 420 54 L 420 125 L 50 125 Z"
                        fill="url(#chartFillGrad)"
                      />

                      {/* Stroke Line */}
                      <path
                        d="M 50 110 Q 95 80, 120 75 T 190 92 T 260 52 T 330 75 T 395 38 L 420 54"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Dots on Key Points */}
                      <circle cx="50" cy="110" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="120" cy="75" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="190" cy="92" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="260" cy="52" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="330" cy="75" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="395" cy="38" r="5" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2.5" />
                    </svg>

                    {/* X-axis days */}
                    <div className="mockup-chart-days">
                      <span>شنبه</span>
                      <span>یکشنبه</span>
                      <span>دوشنبه</span>
                      <span>سه‌شنبه</span>
                      <span>چهارشنبه</span>
                      <span>پنجشنبه</span>
                      <span>جمعه</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Donut Chart + Recent Orders */}
                <div className="mockup-bottom-split">
                  {/* Donut Chart */}
                  <div className="mockup-donut-box">
                    <h5>منابع سفارشات</h5>
                    <div className="donut-content">
                      <svg viewBox="0 0 76 76" className="donut-svg">
                        <circle cx="38" cy="38" r="28" fill="transparent" stroke="#f1f5f9" strokeWidth="11" />
                        {/* Blue: Web 40% */}
                        <circle
                          cx="38" cy="38" r="28"
                          fill="transparent"
                          stroke="#2563eb"
                          strokeWidth="11"
                          strokeDasharray="70 176"
                          strokeDashoffset="0"
                        />
                        {/* Orange: Instagram 30% */}
                        <circle
                          cx="38" cy="38" r="28"
                          fill="transparent"
                          stroke="#f97316"
                          strokeWidth="11"
                          strokeDasharray="53 176"
                          strokeDashoffset="-70"
                        />
                        {/* Light Blue: Other 10% */}
                        <circle
                          cx="38" cy="38" r="28"
                          fill="transparent"
                          stroke="#38bdf8"
                          strokeWidth="11"
                          strokeDasharray="18 176"
                          strokeDashoffset="-123"
                        />
                      </svg>
                      <div className="donut-legend">
                        <div className="legend-item">
                          <span className="bullet blue" />
                          <span className="text">وبسایت</span>
                          <b className="pct">۴۰٪</b>
                        </div>
                        <div className="legend-item">
                          <span className="bullet orange" />
                          <span className="text">اینستاگرام</span>
                          <b className="pct">۳۰٪</b>
                        </div>
                        <div className="legend-item">
                          <span className="bullet light-blue" />
                          <span className="text">دیگر منابع</span>
                          <b className="pct">۱۰٪</b>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders List */}
                  <div className="mockup-orders-box">
                    <h5>آخرین سفارشات</h5>
                    <div className="orders-mini-list">
                      <div className="order-mini-row">
                        <div className="order-avatar a1" />
                        <div className="order-meta">
                          <b>سفارش #۱۲۴۵</b>
                          <small>۱,۴۵۰,۰۰۰ تومان</small>
                        </div>
                        <span className="order-status-dot" />
                      </div>

                      <div className="order-mini-row">
                        <div className="order-avatar a2" />
                        <div className="order-meta">
                          <b>سفارش #۱۲۴۴</b>
                          <small>۱,۶۵۰,۰۰۰ تومان</small>
                        </div>
                        <span className="order-status-dot" />
                      </div>

                      <div className="order-mini-row">
                        <div className="order-avatar a3" />
                        <div className="order-meta">
                          <b>سفارش #۱۲۴۳</b>
                          <small>۳,۸۵۰,۰۰۰ تومان</small>
                        </div>
                        <span className="order-status-dot" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dark Sidebar (Right side of mockup) */}
              <aside className="mockup-dash-sidebar">
                <div className="sidebar-brand">
                  <div className="brand-dot-k">K</div>
                  <span>کارویتا</span>
                </div>

                <nav className="sidebar-nav-list">
                  <div className="nav-item active">
                    <LayoutDashboard size={15} />
                    <span>داشبورد</span>
                  </div>
                  <div className="nav-item">
                    <Users size={15} />
                    <span>مشتریان</span>
                  </div>
                  <div className="nav-item">
                    <ShoppingCart size={15} />
                    <span>فروش</span>
                  </div>
                  <div className="nav-item">
                    <Package size={15} />
                    <span>سفارشات</span>
                  </div>
                  <div className="nav-item">
                    <Layers size={15} />
                    <span>محصولات</span>
                  </div>
                  <div className="nav-item">
                    <BarChart3 size={15} />
                    <span>گزارش‌ها</span>
                  </div>
                </nav>

                <div className="sidebar-bottom-setting">
                  <div className="nav-item">
                    <Settings size={15} />
                    <span>تنظیمات</span>
                  </div>
                </div>
              </aside>
            </div>

            {/* 2. Floating Badge: Customers (Left) */}
            <div className="floating-card float-left-customers">
              <div className="float-icon-wrap blue">
                <Users size={18} />
              </div>
              <div className="float-content">
                <span className="float-label">مشتریان</span>
                <b className="float-val">۲,۴۸۵</b>
                <span className="float-badge green">↑ ۱۴٪</span>
              </div>
            </div>

            {/* 3. Floating Badge: Growth Rate (Bottom-Right) */}
            <div className="floating-card float-right-growth">
              <div className="float-head">
                <div className="float-icon-wrap blue-light">
                  <TrendingUp size={18} />
                </div>
                <div className="float-texts">
                  <span className="float-label">نرخ رشد</span>
                  <b className="float-val large">۲۸٪</b>
                  <small className="float-sub">این ماه</small>
                </div>
              </div>
              {/* Mini sparkline curve */}
              <svg viewBox="0 0 100 24" className="mini-sparkline">
                <path
                  d="M 4 18 Q 20 8, 35 15 T 65 6 T 96 14"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* 4. Floating 3D Glossy "K" Cube (Bottom-Left) */}
            <div className="floating-cube-3d">
              <div className="cube-face">
                <span className="cube-k">K</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
