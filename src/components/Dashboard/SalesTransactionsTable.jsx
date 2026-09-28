import React, { useState } from 'react';
import { Inbox, CheckCircle2, Search } from 'lucide-react';

const moneyFa = n => Number(n || 0).toLocaleString('fa-IR') + ' تومان';
const numFa = n => Number(n || 0).toLocaleString('fa-IR');

export function SalesTransactionsTable({ transactions = [], isDark = false }) {
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(tx => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(tx.order_number || '').toLowerCase().includes(q) ||
      String(tx.user_name || '').toLowerCase().includes(q) ||
      String(tx.company_name || '').toLowerCase().includes(q) ||
      String(tx.mobile || '').toLowerCase().includes(q) ||
      String(tx.tracking_code || '').toLowerCase().includes(q) ||
      String(tx.reference_id || '').toLowerCase().includes(q)
    );
  });

  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const textMuted = isDark ? '#94a3b8' : '#64748b';

  return (
    <div style={{ marginTop: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '16px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '13.5px', fontWeight: 700, color: textColor }}>
          ریز تراکنش‌ها و پرداخت‌های موفق سامانه ({numFa(filtered.length)} مورد)
        </span>
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Search size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
          <input
            type="text"
            placeholder="جستجو در شماره سفارش، کاربر یا کد رهگیری..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '6px 30px 6px 10px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: isDark ? '#1e293b' : '#ffffff', color: textColor, fontSize: '12px', outline: 'none' }}
          />
        </div>
      </div>

      {!filtered.length ? (
        <div style={{ padding: '30px', textAlign: 'center', color: textMuted }}>
          <Inbox size={32} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>هیچ تراکنش موفقی یافت نشد.</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${borderColor}`, color: textMuted }}>
              <th style={{ padding: '8px' }}>شماره سفارش</th>
              <th style={{ padding: '8px' }}>کاربر / خریدار</th>
              <th style={{ padding: '8px' }}>سرویس و ماژول‌ها</th>
              <th style={{ padding: '8px' }}>مبلغ پرداختی</th>
              <th style={{ padding: '8px' }}>کد رهگیری / مرجع</th>
              <th style={{ padding: '8px' }}>تاریخ پرداخت</th>
              <th style={{ padding: '8px' }}>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx, idx) => {
              const rawDate = tx.paid_at || tx.created_at;
              let dateStr = '—';
              if (rawDate) {
                try {
                  const p = new Date(typeof rawDate === 'string' ? rawDate.replace(' ', 'T') : rawDate);
                  dateStr = p.toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                } catch (e) {
                  dateStr = String(rawDate);
                }
              }
              return (
                <tr key={tx.id || idx} style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <td style={{ padding: '8px', fontWeight: 700, direction: 'ltr', textAlign: 'right', color: 'var(--blue-600)' }}>
                    {tx.order_number || `ORD-${tx.order_id || tx.id}`}
                  </td>
                  <td style={{ padding: '8px' }}>
                    <div style={{ fontWeight: 600, color: textColor }}>{tx.user_name || 'کاربر کارویتا'}</div>
                    {tx.company_name && tx.company_name !== '—' && (
                      <div style={{ fontSize: '11px', color: textMuted }}>{tx.company_name}</div>
                    )}
                  </td>
                  <td style={{ padding: '8px', color: isDark ? '#cbd5e1' : '#334155' }}>
                    {tx.package_name || 'ماژول‌های ERP سازمانی'}
                  </td>
                  <td style={{ padding: '8px', fontWeight: 800, color: '#16a34a' }}>
                    {moneyFa(tx.amount)}
                  </td>
                  <td style={{ padding: '8px', direction: 'ltr', textAlign: 'right', fontSize: '11px', color: textMuted }}>
                    {tx.tracking_code && tx.tracking_code !== '—' ? tx.tracking_code : (tx.reference_id || '—')}
                  </td>
                  <td style={{ padding: '8px', fontSize: '11px', color: textMuted }}>{dateStr}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#16a34a', padding: '2px 7px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                      <CheckCircle2 size={12} /> موفق
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SalesTransactionsTable;
