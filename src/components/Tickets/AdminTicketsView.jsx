import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock3, 
  MessageSquare, 
  User, 
  Phone, 
  UserCheck, 
  Calendar, 
  Filter, 
  RotateCw, 
  Building2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { TicketTabs } from './TicketTabs';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketDetailModal } from './TicketDetailModal';

export function AdminTicketsView() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');

  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({});
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  function loadTickets(currentTab = tab, currentSearch = search) {
    setLoading(true);
    setError('');
    let query = `?status=${currentTab}`;
    if (departmentFilter) query += `&department_id=${departmentFilter}`;
    if (staffFilter) query += `&assigned_to=${staffFilter}`;
    if (currentSearch.trim()) query += `&search=${encodeURIComponent(currentSearch.trim())}`;

    api(`/admin/tickets${query}`)
      .then(res => {
        setTickets(res.data || []);
        setCounts(res.counts || {});
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    api('/departments').then(res => setDepartments(res.data || [])).catch(() => {});
    api('/admin/support-staff').then(res => setStaffList(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    loadTickets(tab, search);
  }, [tab, departmentFilter, staffFilter]);

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearch(val);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadTickets(tab, search);
  }

  function handleClearAllTickets() {
    setClearing(true);
    setError('');
    api('/admin/tickets/clear-all', { method: 'DELETE' })
      .then(res => {
        setSuccessMsg(res.message || 'تمام تیکت‌های تستی با موفقیت حذف شدند.');
        setShowClearConfirm(false);
        loadTickets(tab, '');
        setSearch('');
      })
      .catch(err => setError(err.message || 'خطا در حذف تیکت‌های تستی.'))
      .finally(() => setClearing(false));
  }

  return (
    <div>
      <div className="page-head" style={{ marginBottom: 16 }}>
        <div>
          <h1>مدیریت تیکت‌های پشتیبانی</h1>
          <p>مشاهده، بررسی، پاسخگویی و تخصیص تیکت‌های کاربران به کارشناسان دپارتمان‌ها</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button 
            type="button" 
            className="btn-danger-outline" 
            onClick={() => setShowClearConfirm(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 44, padding: '0 16px', borderRadius: 10, fontSize: 13, fontWeight: 700 }}
            title="حذف و پاک‌سازی تمام تیکت‌های تستی ثبت‌شده"
          >
            <Trash2 size={16} />
            <span>پاک‌سازی تیکت‌های تستی</span>
          </button>
          <button 
            type="button" 
            className="btn-secondary outline" 
            onClick={() => loadTickets(tab, search)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <RotateCw size={17} />
            <span>بروزرسانی</span>
          </button>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {successMsg && (
        <div className="alert success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{successMsg}</span>
          <button type="button" className="link" onClick={() => setSuccessMsg('')} style={{ fontSize: 12 }}>بستن</button>
        </div>
      )}

      {/* Tabs */}
      <TicketTabs 
        activeTab={tab} 
        onTabChange={setTab} 
        counts={counts} 
        isAdmin={true} 
      />

      {/* Filters & Search */}
      <div className="ticket-toolbar">
        <form onSubmit={handleSearchSubmit} className="ticket-search-box">
          <Search size={18} color="var(--muted)" />
          <input 
            type="text" 
            placeholder="جستجو در موضوع، شماره تیکت (#58900157)، نام کاربر، شماره تماس..." 
            value={search}
            onChange={handleSearchChange}
          />
          {search && (
            <button 
              type="button" 
              className="link" 
              onClick={() => { setSearch(''); loadTickets(tab, ''); }}
              style={{ fontSize: 12 }}
            >
              پاک‌کردن
            </button>
          )}
        </form>

        {/* Filter by Department */}
        <select 
          className="ticket-filter-select"
          value={departmentFilter}
          onChange={e => setDepartmentFilter(e.target.value)}
        >
          <option value="">همه دپارتمان‌ها</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        {/* Filter by Staff */}
        <select 
          className="ticket-filter-select"
          value={staffFilter}
          onChange={e => setStaffFilter(e.target.value)}
        >
          <option value="">همه کارشناسان</option>
          {staffList.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
          ))}
        </select>
      </div>

      {search.trim() && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span>
            نتایج فیلتر و جستجو برای «<strong>{search}</strong>»: {tickets.length.toLocaleString('fa-IR')} تیکت
          </span>
          <button type="button" className="link" onClick={() => { setSearch(''); loadTickets(tab, ''); }} style={{ fontSize: '12px' }}>
            نمایش همه
          </button>
        </div>
      )}

      {/* Confirm Modal for Clearing Test Tickets */}
      {showClearConfirm && (
        <div className="modal-backdrop" onClick={() => !clearing && setShowClearConfirm(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={20} />
                تأیید پاک‌سازی تمام تیکت‌های تستی
              </h3>
            </div>
            <div className="modal-body">
              <p>
                آیا از حذف کامل تمام تیکت‌ها، پیام‌ها، فایل‌های پیوست و تاریخچه تغییرات تیکت‌ها اطمینان دارید؟
                این عمل غیرقابل بازگشت است و دیتابیس تیکت‌ها خالی می‌گردد.
              </p>
              <div className="modal-foot">
                <button 
                  type="button" 
                  className="btn-danger" 
                  disabled={clearing}
                  onClick={handleClearAllTickets}
                >
                  {clearing ? 'در حال پاک‌سازی…' : 'بله، همه تیکت‌ها پاک شوند'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary outline" 
                  disabled={clearing}
                  onClick={() => setShowClearConfirm(false)}
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tickets List */}
      {loading ? (
        <div className="loader">در حال بارگذاری لیست تیکت‌ها…</div>
      ) : tickets.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <MessageSquare size={44} color="var(--blue-300)" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ margin: '0 0 6px', color: 'var(--navy)' }}>تیکتی یافت نشد</h3>
          <p style={{ margin: '0', color: 'var(--muted)', fontSize: 13.5 }}>
            هیچ تیکتی با فیلترهای انتخابی شما در این بخش موجود نیست.
          </p>
        </div>
      ) : (
        <div>
          {tickets.map(item => (
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
                  <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 600 }}>
                    <User size={13} style={{ verticalAlign: 'middle', marginLeft: 3 }} />
                    {item.user_name}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    <Phone size={12} style={{ verticalAlign: 'middle', marginLeft: 3 }} />
                    {item.user_mobile}
                  </span>
                </div>

                <h3 className="ticket-subject">{item.subject}</h3>
                <p className="ticket-snippet">
                  <b>{item.last_sender_type === 'support' ? 'پشتیبانی: ' : 'کاربر: '}</b>
                  {item.last_message || 'پیامی ثبت نشده است.'}
                </p>

                <div className="ticket-card-meta">
                  <span>
                    <Clock3 size={14} />
                    آخرین فعالیت: {new Date(item.updated_at).toLocaleString('fa-IR')}
                  </span>
                  {item.assigned_name ? (
                    <span style={{ color: 'var(--blue-800)', fontWeight: 600 }}>
                      <UserCheck size={14} />
                      پشتیبان مسئول: {item.assigned_name}
                    </span>
                  ) : (
                    <span style={{ color: '#e63946' }}>
                      <UserCheck size={14} />
                      تخصیص داده نشده
                    </span>
                  )}
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
                  پاسخ و مدیریت ←
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Ticket Details Chat Modal for Admin */}
      {selectedTicketId && (
        <TicketDetailModal 
          ticketId={selectedTicketId}
          isAdmin={true}
          onClose={() => setSelectedTicketId(null)}
          onTicketUpdated={() => loadTickets(tab)}
        />
      )}
    </div>
  );
}
