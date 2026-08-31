import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Clock3, 
  MessageSquare, 
  Building2, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  RotateCw 
} from 'lucide-react';
import { api } from '../../services/api';
import { TicketTabs } from './TicketTabs';
import { TicketStatusBadge } from './TicketStatusBadge';
import { NewTicketModal } from './NewTicketModal';
import { TicketDetailModal } from './TicketDetailModal';

export function UserTicketsView() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  function loadTickets(currentTab = tab) {
    setLoading(true);
    setError('');
    const q = currentTab !== 'all' ? `?status=${currentTab}` : '';
    api(`/tickets${q}`)
      .then(res => {
        setTickets(res.data || []);
        setCounts(res.counts || {});
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTickets(tab);
  }, [tab]);

  function normalizeText(str) {
    if (!str) return '';
    return str
      .toString()
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/^#/, '')
      .trim()
      .toLowerCase();
  }

  const filtered = tickets.filter(t => {
    if (!search.trim()) return true;
    const s = normalizeText(search);
    const normTicketNum = normalizeText(t.ticket_number);
    const normId = normalizeText(t.id);
    const normSubject = (t.subject || '').toLowerCase();
    const normDept = (t.department_name || '').toLowerCase();
    const normService = (t.service_name || '').toLowerCase();

    return (
      normTicketNum.includes(s) ||
      normId.includes(s) ||
      normSubject.includes(s) ||
      normDept.includes(s) ||
      normService.includes(s)
    );
  });

  return (
    <div>
      <div className="page-head" style={{ marginBottom: 16 }}>
        <div>
          <h1>تیکت‌های من</h1>
          <p>ارسال درخواست‌های پشتیبانی، پیگیری پیام‌ها و دریافت پاسخ از کارشناسان کارویتا</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            type="button" 
            className="btn-secondary outline" 
            onClick={() => loadTickets(tab)}
            title="بروزرسانی لیست"
            style={{ padding: '10px 14px' }}
          >
            <RotateCw size={17} />
          </button>
          <button 
            type="button" 
            className="btn-primary"
            onClick={() => setShowNewModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={18} />
            <span>نوشتن تیکت جدید</span>
          </button>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {/* Tabs */}
      <TicketTabs 
        activeTab={tab} 
        onTabChange={setTab} 
        counts={counts} 
      />

      {/* Toolbar */}
      <div className="ticket-toolbar">
        <div className="ticket-search-box">
          <Search size={18} color="var(--muted)" />
          <input 
            type="text" 
            placeholder="جستجو در موضوع، شماره تیکت (#58900157)، دپارتمان و..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button 
              type="button" 
              className="link" 
              onClick={() => setSearch('')}
              style={{ fontSize: 12 }}
            >
              پاک‌کردن
            </button>
          )}
        </div>
      </div>

      {search.trim() && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span>
            نتایج جستجو برای «<strong>{search}</strong>»: {filtered.length.toLocaleString('fa-IR')} تیکت
          </span>
          <button type="button" className="link" onClick={() => setSearch('')} style={{ fontSize: '12px' }}>
            نمایش همه تیکت‌ها
          </button>
        </div>
      )}

      {/* Tickets List */}
      {loading ? (
        <div className="loader">در حال بارگذاری تیکت‌ها…</div>
      ) : filtered.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <MessageSquare size={44} color="var(--blue-300)" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ margin: '0 0 6px', color: 'var(--navy)' }}>تیکتی در این بخش یافت نشد</h3>
          <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: 13.5 }}>
            {search ? 'با عبارت جستجو شده موردی پیدا نشد.' : 'برای ثبت پرسش یا مشکل خود، روی نوشتن تیکت جدید کلیک کنید.'}
          </p>
          {!search && (
            <button 
              type="button" 
              onClick={() => setShowNewModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Plus size={16} />
              نوشتن تیکت جدید
            </button>
          )}
        </div>
      ) : (
        <div>
          {filtered.map(item => (
            <article 
              key={item.id} 
              className="ticket-card"
              onClick={() => setSelectedTicketId(item.id)}
            >
              <div className="ticket-card-main">
                <div className="ticket-card-header">
                  <span className="ticket-number-tag">{item.ticket_number}</span>
                  <span className="ticket-dept-tag">{item.department_name}</span>
                  <span className="ticket-service-tag">{item.service_name}</span>
                </div>
                <h3 className="ticket-subject">{item.subject}</h3>
                <p className="ticket-snippet">{item.last_message || 'پیامی ثبت نشده است.'}</p>
                <div className="ticket-card-meta">
                  <span>
                    <Clock3 size={14} />
                    آخرین فعالیت: {new Date(item.updated_at).toLocaleString('fa-IR')}
                  </span>
                  <span>
                    <Calendar size={14} />
                    ایجاد: {new Date(item.created_at).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>

              <div className="ticket-card-side">
                <TicketStatusBadge status={item.status} />
                <button 
                  type="button" 
                  className="link" 
                  style={{ fontSize: 13, padding: 0 }}
                >
                  مشاهده و پاسخ ←
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewModal && (
        <NewTicketModal 
          onClose={() => setShowNewModal(false)}
          onSuccess={(created) => {
            setShowNewModal(false);
            loadTickets(tab);
            if (created?.id) setSelectedTicketId(created.id);
          }}
        />
      )}

      {/* Ticket Details Chat Modal */}
      {selectedTicketId && (
        <TicketDetailModal 
          ticketId={selectedTicketId}
          isAdmin={false}
          onClose={() => setSelectedTicketId(null)}
          onTicketUpdated={() => loadTickets(tab)}
        />
      )}
    </div>
  );
}
