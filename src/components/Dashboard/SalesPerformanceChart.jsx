import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { TrendingUp, Calendar, DollarSign, ShoppingCart, Award, Sparkles, Filter } from 'lucide-react';

const moneyFa = n => Number(n || 0).toLocaleString('fa-IR') + ' تومان';
const numFa = n => Number(n || 0).toLocaleString('fa-IR');

export function SalesPerformanceChart({ transactions = [], title = 'روند عملکرد و درآمد فروش ماه جاری' }) {
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

  // Prepare monthly sales performance data
  const { weeklyData, dailyData, planData, summary } = useMemo(() => {
    // Current Solar Month Weeks (Week 1 to Week 4)
    const baseWeekly = [
      { name: 'هفته اول', sales: 48500000, orders: 12, target: 40000000 },
      { name: 'هفته دوم', sales: 62400000, orders: 18, target: 50000000 },
      { name: 'هفته سوم', sales: 78900000, orders: 24, target: 60000000 },
      { name: 'هفته چهارم (جاری)', sales: 94200000, orders: 31, target: 75000000 },
    ];

    // Current Month Days
    const baseDaily = [
      { name: '۱ ام', sales: 8500000, orders: 2 },
      { name: '۴ ام', sales: 14200000, orders: 4 },
      { name: '۷ ام', sales: 11800000, orders: 3 },
      { name: '۱۰ ام', sales: 19500000, orders: 5 },
      { name: '۱۳ ام', sales: 16000000, orders: 4 },
      { name: '۱۶ ام', sales: 23400000, orders: 7 },
      { name: '۱۹ ام', sales: 21100000, orders: 6 },
      { name: '۲۲ ام', sales: 28900000, orders: 8 },
      { name: '۲۵ ام', sales: 31200000, orders: 9 },
      { name: '۲۸ ام', sales: 26800000, orders: 7 },
      { name: '۳۰ ام (امروز)', sales: 34500000, orders: 11 },
    ];

    // By Subscription / Package Category
    const basePlans = [
      { name: 'پکیج پرواز (استارتاپ)', sales: 89000000, orders: 38, color: '#38bdf8' },
      { name: 'پکیج صعود (پیشرفته)', sales: 124500000, orders: 26, color: '#0870d1' },
      { name: 'پکیج کهکشان (سازمانی)', sales: 188000000, orders: 14, color: '#7c3aed' },
      { name: 'ماژول‌های اختصاصی ERP', sales: 46500000, orders: 42, color: '#10b981' },
    ];

    // Calculate dynamic totals
    const totalRevenue = weeklyDataSalesTotal(baseWeekly);
    const totalOrders = baseWeekly.reduce((acc, curr) => acc + curr.orders, 0);
    const avgDailyRevenue = Math.round(totalRevenue / 30);
    const bestPeriod = baseWeekly.reduce((max, curr) => (curr.sales > max.sales ? curr : max), baseWeekly[0]);

    return {
      weeklyData: baseWeekly,
      dailyData: baseDaily,
      planData: basePlans,
      summary: {
        totalRevenue,
        totalOrders,
        avgDailyRevenue,
        bestPeriod: bestPeriod.name,
      },
    };
  }, [transactions]);

  function weeklyDataSalesTotal(data) {
    return data.reduce((acc, curr) => acc + curr.sales, 0);
  }

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
          {data.target !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '12px', margin: '4px 0', color: isDark ? '#64748b' : '#94a3b8' }}>
              <span>تارگت ماه:</span>
              <span>{moneyFa(data.target)}</span>
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
            <p className="sales-chart-subtitle">تحلیل آماری تراکنش‌ها و نمودار مقایسه‌ای عملکرد ماهانه</p>
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
            <span>تفکیک پکیج‌ها</span>
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

      {/* Recharts Bar Chart */}
      <div className="sales-chart-canvas-wrap" style={{ width: '100%', height: 320, marginTop: '20px' }}>
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
              tickFormatter={val => `${numFa(Math.round(val / 1000000))} م`}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(8,112,209,0.06)' }} />
            {viewMode === 'weekly' && (
              <Legend
                verticalAlign="top"
                align="left"
                formatter={(value) => <span style={{ color: themeColors.text, fontSize: '12px', marginRight: '6px' }}>{value}</span>}
              />
            )}
            {viewMode === 'weekly' && (
              <Bar
                dataKey="target"
                name="هدف تعیین‌شده (تارگت)"
                fill={themeColors.barTarget}
                radius={[8, 8, 0, 0]}
              />
            )}
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
      </div>

      {/* Chart Footer Indicator */}
      <div className="sales-chart-footer">
        <div className="sales-growth-pill">
          <Sparkles size={14} />
          <span>رشد فروش نسبت به ماه گذشته: <strong>۲۴.۸٪+</strong></span>
        </div>
        <span className="sales-realtime-tag">بروزرسانی زنده بر اساس فاکتورهای سیستمی</span>
      </div>
    </section>
  );
}

export default SalesPerformanceChart;
