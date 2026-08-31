import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { TrendingUp, Calendar, DollarSign, ShoppingCart, Award, Sparkles, Filter, Inbox } from 'lucide-react';

const moneyFa = n => Number(n || 0).toLocaleString('fa-IR') + ' تومان';
const numFa = n => Number(n || 0).toLocaleString('fa-IR');

export function SalesPerformanceChart({ transactions = [], title = 'روند عملکرد فروش و درآمد ماهانه سامانه' }) {
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' | 'daily' | 'plans'
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  useEffect(() => {
    const handleTheme = (e) => {
      if (e?.detail?.theme) {
        setIsDark(e.detail.theme === 'dark');
      } else {
        setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
      }
    };
    window.addEventListener('theme-change', handleTheme);
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      window.removeEventListener('theme-change', handleTheme);
      observer.disconnect();
    };
  }, []);

  // Filter only successful transactions
  const validTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.filter(t => (t.status === 'successful' || t.transaction_status === 'successful') && Number(t.amount) > 0);
  }, [transactions]);

  // Aggregate monthly sales performance data dynamically from real transactions in DB
  const { weeklyData, dailyData, planData, summary, hasData } = useMemo(() => {
    const totalRevenue = validTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalOrders = validTransactions.length;
    const avgDailyRevenue = totalRevenue > 0 ? Math.round(totalRevenue / 30) : 0;
    const hasData = totalOrders > 0;

    // 1. Weekly grouping (Weeks 1 to 4)
    const weeklyMap = [
      { name: 'هفته اول', sales: 0, orders: 0 },
      { name: 'هفته دوم', sales: 0, orders: 0 },
      { name: 'هفته سوم', sales: 0, orders: 0 },
      { name: 'هفته چهارم', sales: 0, orders: 0 },
    ];

    // 2. Daily grouping
    const dailyMap = [
      { name: '۱ ام', sales: 0, orders: 0 },
      { name: '۴ ام', sales: 0, orders: 0 },
      { name: '۷ ام', sales: 0, orders: 0 },
      { name: '۱۰ ام', sales: 0, orders: 0 },
      { name: '۱۳ ام', sales: 0, orders: 0 },
      { name: '۱۶ ام', sales: 0, orders: 0 },
      { name: '۱۹ ام', sales: 0, orders: 0 },
      { name: '۲۲ ام', sales: 0, orders: 0 },
      { name: '۲۵ ام', sales: 0, orders: 0 },
      { name: '۲۸ ام', sales: 0, orders: 0 },
      { name: '۳۰ ام', sales: 0, orders: 0 },
    ];

    // 3. Plan grouping
    const planMap = {
      'ماژول‌های ERP سازمانی': { sales: 0, orders: 0, color: '#0870d1' },
      'اشتراک ویژه کسب‌وکار': { sales: 0, orders: 0, color: '#38bdf8' },
      'پکیج‌های پیشرفته': { sales: 0, orders: 0, color: '#7c3aed' },
      'سایر خدمات و تمدید': { sales: 0, orders: 0, color: '#10b981' },
    };

    if (hasData) {
      validTransactions.forEach(tx => {
        const amt = Number(tx.amount) || 0;
        const d = tx.created_at ? new Date(tx.created_at) : new Date();
        const dayOfMonth = d.getDate(); // 1 - 31

        // Assign week
        if (dayOfMonth <= 7) {
          weeklyMap[0].sales += amt;
          weeklyMap[0].orders += 1;
        } else if (dayOfMonth <= 14) {
          weeklyMap[1].sales += amt;
          weeklyMap[1].orders += 1;
        } else if (dayOfMonth <= 21) {
          weeklyMap[2].sales += amt;
          weeklyMap[2].orders += 1;
        } else {
          weeklyMap[3].sales += amt;
          weeklyMap[3].orders += 1;
        }

        // Assign daily (nearest bucket)
        const dailyIndex = Math.min(Math.floor((dayOfMonth - 1) / 3), dailyMap.length - 1);
        if (dailyMap[dailyIndex]) {
          dailyMap[dailyIndex].sales += amt;
          dailyMap[dailyIndex].orders += 1;
        }

        // Assign plan
        const pkgName = String(tx.package_name || '').toLowerCase();
        if (pkgName.includes('ماژول') || pkgName.includes('erp') || pkgName.includes('سازمان')) {
          planMap['ماژول‌های ERP سازمانی'].sales += amt;
          planMap['ماژول‌های ERP سازمانی'].orders += 1;
        } else if (pkgName.includes('پیشرفته') || pkgName.includes('enterprise')) {
          planMap['پکیج‌های پیشرفته'].sales += amt;
          planMap['پکیج‌های پیشرفته'].orders += 1;
        } else if (pkgName.includes('پایه') || pkgName.includes('کسب‌وکار')) {
          planMap['اشتراک ویژه کسب‌وکار'].sales += amt;
          planMap['اشتراک ویژه کسب‌وکار'].orders += 1;
        } else {
          planMap['سایر خدمات و تمدید'].sales += amt;
          planMap['سایر خدمات و تمدید'].orders += 1;
        }
      });
    }

    const calculatedPlans = Object.entries(planMap).map(([name, val]) => ({
      name,
      sales: val.sales,
      orders: val.orders,
      color: val.color,
    }));

    let bestPeriodName = '—';
    if (hasData) {
      const best = weeklyMap.reduce((max, curr) => (curr.sales > max.sales ? curr : max), weeklyMap[0]);
      if (best.sales > 0) bestPeriodName = best.name;
    }

    return {
      weeklyData: weeklyMap,
      dailyData: dailyMap,
      planData: calculatedPlans,
      hasData,
      summary: {
        totalRevenue,
        totalOrders,
        avgDailyRevenue,
        bestPeriod: bestPeriodName,
      },
    };
  }, [validTransactions]);

  const currentChartData = viewMode === 'weekly' ? weeklyData : viewMode === 'daily' ? dailyData : planData;

  // Colors adapted for light/dark
  const themeColors = {
    grid: isDark ? '#1e293b' : '#e2e8f0',
    text: isDark ? '#94a3b8' : '#64748b',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#cbd5e1',
    barPrimary: '#0870d1',
    barTarget: isDark ? '#334155' : '#cbd5e1',
    barHover: '#0056b3',
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="sales-chart-tooltip"
          style={{
            background: themeColors.tooltipBg,
            border: `1px solid ${themeColors.tooltipBorder}`,
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            direction: 'rtl',
            textAlign: 'right',
            fontFamily: 'Vazirmatn, sans-serif',
            minWidth: '180px',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', color: isDark ? '#f8fafc' : '#0f172a' }}>
            {label}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '13px', margin: '4px 0', color: '#0870d1', fontWeight: 700 }}>
            <span>درآمد فروش:</span>
            <span>{moneyFa(data.sales)}</span>
          </div>
          {data.orders !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '12.5px', margin: '4px 0', color: isDark ? '#94a3b8' : '#64748b' }}>
              <span>تعداد سفارشات:</span>
              <span style={{ fontWeight: 700 }}>{numFa(data.orders)} سفارش</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="sales-performance-card" id="sales-performance-widget">
      {/* Header & Controls */}
      <div className="sales-chart-header">
        <div className="sales-chart-title-wrap">
          <div className="sales-chart-icon-box">
            <TrendingUp size={22} />
          </div>
          <div>
            <h3 className="sales-chart-title">{title}</h3>
            <p className="sales-chart-subtitle">تحلیل آماری تراکنش‌ها و نمودار مقایسه‌ای عملکرد ماهانه بر اساس خریدهای واقعی دیتابیس</p>
          </div>
        </div>

        {/* View Switch Buttons */}
        <div className="sales-chart-toggle-group" role="tablist">
          <button
            type="button"
            className={`sales-toggle-btn ${viewMode === 'weekly' ? 'active' : ''}`}
            onClick={() => setViewMode('weekly')}
          >
            <Calendar size={14} />
            <span>هفتگی (ماه جاری)</span>
          </button>
          <button
            type="button"
            className={`sales-toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
            onClick={() => setViewMode('daily')}
          >
            <TrendingUp size={14} />
            <span>روند روزانه</span>
          </button>
          <button
            type="button"
            className={`sales-toggle-btn ${viewMode === 'plans' ? 'active' : ''}`}
            onClick={() => setViewMode('plans')}
          >
            <Filter size={14} />
            <span>تفکیک ماژول‌ها و پلن‌ها</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="sales-kpi-grid">
        <div className="sales-kpi-box">
          <div className="sales-kpi-icon-wrap green">
            <DollarSign size={18} />
          </div>
          <div>
            <span className="sales-kpi-label">مجموع فروش ماه</span>
            <strong className="sales-kpi-value">{moneyFa(summary.totalRevenue)}</strong>
          </div>
        </div>

        <div className="sales-kpi-box">
          <div className="sales-kpi-icon-wrap blue">
            <ShoppingCart size={18} />
          </div>
          <div>
            <span className="sales-kpi-label">تعداد کل تراکنش‌ها</span>
            <strong className="sales-kpi-value">{numFa(summary.totalOrders)} موفق</strong>
          </div>
        </div>

        <div className="sales-kpi-box">
          <div className="sales-kpi-icon-wrap orange">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="sales-kpi-label">میانگین فروش روزانه</span>
            <strong className="sales-kpi-value">{moneyFa(summary.avgDailyRevenue)}</strong>
          </div>
        </div>

        <div className="sales-kpi-box">
          <div className="sales-kpi-icon-wrap purple">
            <Award size={18} />
          </div>
          <div>
            <span className="sales-kpi-label">بهترین بازه عملکرد</span>
            <strong className="sales-kpi-value">{summary.bestPeriod}</strong>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart or Dynamic Clean Status */}
      <div className="sales-chart-canvas-wrap" style={{ width: '100%', height: 300, marginTop: '20px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentChartData}
            margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
            barSize={viewMode === 'daily' ? 18 : 38}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} vertical={false} />
            <XAxis
              dataKey="name"
              stroke={themeColors.text}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: themeColors.grid }}
            />
            <YAxis
              stroke={themeColors.text}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: themeColors.grid }}
              tickFormatter={val => val === 0 ? '۰' : `${numFa(Math.round(val / 1000000))} م`}
              orientation="right"
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(8,112,209,0.06)' }} />
            <Bar
              dataKey="sales"
              name="درآمد محقق‌شده"
              fill={themeColors.barPrimary}
              radius={[8, 8, 0, 0]}
            >
              {currentChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || (index === currentChartData.length - 1 ? '#0046d4' : '#0870d1')}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {!hasData && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(2px)',
            borderRadius: '12px',
            pointerEvents: 'none',
            color: isDark ? '#94a3b8' : '#64748b',
            gap: '8px'
          }}>
            <Inbox size={32} strokeWidth={1.5} />
            <span style={{ fontSize: '13.5px', fontWeight: 600 }}>دیتابیس در وضعیت خام — هنوز تراکنشی ثبت نشده است</span>
            <span style={{ fontSize: '11.5px', opacity: 0.8 }}>با ثبت اولین سفارش و تراکنش موفق در سامانه، این نمودار خودکار بر اساس خریدهای واقعی تکمیل خواهد شد.</span>
          </div>
        )}
      </div>

      {/* Chart Footer Indicator */}
      <div className="sales-chart-footer">
        <div className="sales-growth-pill">
          <Sparkles size={14} />
          <span>
            {hasData ? (
              <>مجموع درآمد حاصل از خریدهای ثبت‌شده: <strong>{moneyFa(summary.totalRevenue)}</strong></>
            ) : (
              <span>وضعیت مالی: <strong>آماده دریافت اولین سفارشات و خریدها</strong></span>
            )}
          </span>
        </div>
        <span className="sales-realtime-tag">همگام‌سازی لحظه‌ای با دیتابیس تراکنش‌ها</span>
      </div>
    </section>
  );
}

export default SalesPerformanceChart;
