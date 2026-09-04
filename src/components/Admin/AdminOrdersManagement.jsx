import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Download,
  FileText,
  Building2,
  User,
  Calendar,
  Layers,
  Edit3,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  DollarSign,
  Receipt,
  HelpCircle,
  Hash,
  Phone
} from 'lucide-react';
import { api } from '../../services/api';

export function AdminOrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | paid | cancelled | failed
  const [selectedOrder, setSelectedOrder] = useState(null); // Order to edit status
  const [newStatus, setNewStatus] = useState('paid');
  const [customRefId, setCustomRefId] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api('/admin/orders');
      if (res && res.data) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.message || 'خطا در دریافت لیست سفارش‌ها و فاکتورها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status === 'completed' || order.status === 'paid' ? 'paid' : order.status);
    setCustomRefId(order.reference_id && order.reference_id !== '—' ? order.reference_id : `MAN-${Date.now().toString().slice(-8)}`);
    setAdminNote('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await api(`/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          reference_id: newStatus === 'paid' ? customRefId : null,
          note: adminNote
        })
      });

      showToast(res.message || 'وضعیت فاکتور و پرداخت با موفقیت بروزرسانی شد.');
      setSelectedOrder(null);
      await fetchOrders();
      window.dispatchEvent(new CustomEvent('order-updated'));
    } catch (err) {
      showToast(err.message || 'خطا در تغییر وضعیت سفارش', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickStatusChange = async (order, targetStatus) => {
    try {
      const genRef = targetStatus === 'paid' ? `MAN-${Date.now().toString().slice(-8)}` : null;
      const res = await api(`/admin/orders/${order.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: targetStatus,
          reference_id: genRef,
          note: 'تغییر وضعیت سریع از جدول مدیریت'
        })
      });

      showToast(res.message || 'وضعیت با موفقیت تغییر کرد.');
      await fetchOrders();
      window.dispatchEvent(new CustomEvent('order-updated'));
    } catch (err) {
      showToast(err.message || 'خطا در تغییر وضعیت', 'error');
    }
  };

  // Filter and Search logic
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Status match
      if (statusFilter !== 'all') {
        const isPaid = o.status === 'paid' || o.status === 'completed' || o.status === 'successful';
        if (statusFilter === 'paid' && !isPaid) return false;
        if (statusFilter === 'pending' && o.status !== 'pending') return false;
        if (statusFilter === 'cancelled' && (o.status !== 'cancelled' && o.status !== 'failed')) return false;
      }

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const orderNum = (o.order_number || '').toLowerCase();
      const userName = (o.user_name || '').toLowerCase();
      const mobile = (o.mobile || '').toLowerCase();
      const company = (o.company_name || '').toLowerCase();
      const pkg = (o.package_name || '').toLowerCase();
      const ref = (o.reference_id || '').toLowerCase();

      return orderNum.includes(q) || 
             userName.includes(q) || 
             mobile.includes(q) || 
             company.includes(q) || 
             pkg.includes(q) || 
             ref.includes(q);
    });
  }, [orders, statusFilter, searchQuery]);

  // Calculations for summary metrics
  const stats = useMemo(() => {
    const total = orders.length;
    const paidList = orders.filter(o => o.status === 'paid' || o.status === 'completed' || o.status === 'successful');
    const pendingList = orders.filter(o => o.status === 'pending');
    const cancelledList = orders.filter(o => o.status === 'cancelled' || o.status === 'failed');

    const totalRevenue = paidList.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
    const pendingRevenue = pendingList.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);

    return {
      total,
      paidCount: paidList.length,
      pendingCount: pendingList.length,
      cancelledCount: cancelledList.length,
      totalRevenue,
      pendingRevenue
    };
  }, [orders]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
      case 'successful':
        return (
          <span style={{
            background: '#dcfce7',
            color: '#15803d',
            border: '1px solid #86efac',
            padding: '3px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <CheckCircle2 size={13} />
            پرداخت شده
          </span>
        );
      case 'pending':
        return (
          <span style={{
            background: '#fef3c7',
            color: '#b45309',
            border: '1px solid #fde68a',
            padding: '3px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Clock size={13} />
            در انتظار پرداخت
          </span>
        );
      case 'cancelled':
        return (
          <span style={{
            background: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #fca5a5',
            padding: '3px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <XCircle size={13} />
            لغو شده
          </span>
        );
      case 'failed':
        return (
          <span style={{
            background: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #fca5a5',
            padding: '3px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <AlertTriangle size={13} />
            ناموفق
          </span>
        );
      case 'refunded':
        return (
          <span style={{
            background: '#f1f5f9',
            color: '#475569',
            border: '1px solid #cbd5e1',
            padding: '3px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <RotateCcw size={13} />
            مسترد شده
          </span>
        );
      default:
        return (
          <span style={{
            background: '#f8fafc',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            padding: '3px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600
          }}>
            {status || 'نامشخص'}
          </span>
        );
    }
  };

  return (
    <div className="admin-orders-management" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 9999,
          background: toastMsg.type === 'error' ? '#991b1b' : '#065f46',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '13.5px',
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {toastMsg.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Header & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={22} color="#0870d1" />
            <span>مدیریت خریدها، فاکتورها و تراکنش‌های مالی</span>
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            نظارت بر پرداخت‌های آنلاین، تغییر دستی وضعیت فاکتورها، فعال‌سازی دسترسی‌ها و صدور اسناد رسمی
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#334155',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>بروزرسانی لیست</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px'
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt size={22} color="#0870d1" />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>کل فاکتورها و خریدها</span>
            <strong style={{ fontSize: '18px', color: '#0f172a', fontWeight: 800 }}>
              {Number(stats.total).toLocaleString('fa-IR')} <small style={{ fontSize: '11px', fontWeight: 'normal', color: '#64748b' }}>سفارش</small>
            </strong>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', background: '#dcfce7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} color="#16a34a" />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>تسویه و پرداخت شده</span>
            <strong style={{ fontSize: '18px', color: '#15803d', fontWeight: 800 }}>
              {Number(stats.paidCount).toLocaleString('fa-IR')} <small style={{ fontSize: '11px', fontWeight: 'normal', color: '#64748b' }}>مورد</small>
            </strong>
            <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>
              {Number(stats.totalRevenue).toLocaleString('fa-IR')} تومان
            </div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', background: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="#d97706" />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>در انتظار پرداخت</span>
            <strong style={{ fontSize: '18px', color: '#b45309', fontWeight: 800 }}>
              {Number(stats.pendingCount).toLocaleString('fa-IR')} <small style={{ fontSize: '11px', fontWeight: 'normal', color: '#64748b' }}>مورد</small>
            </strong>
            <div style={{ fontSize: '11px', color: '#d97706', marginTop: '2px', fontWeight: 600 }}>
              {Number(stats.pendingRevenue).toLocaleString('fa-IR')} تومان
            </div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{ width: '44px', height: '44px', background: '#fee2e2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={22} color="#dc2626" />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>لغو شده / ناموفق</span>
            <strong style={{ fontSize: '18px', color: '#b91c1c', fontWeight: 800 }}>
              {Number(stats.cancelledCount).toLocaleString('fa-IR')} <small style={{ fontSize: '11px', fontWeight: 'normal', color: '#64748b' }}>مورد</small>
            </strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '450px' }}>
          <Search size={17} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="جستجو بر اساس شماره سفارش، کاربر، موبایل یا کد رهگیری..."
            style={{
              width: '100%',
              height: '42px',
              paddingRight: '42px',
              paddingLeft: '14px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              background: '#ffffff'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            style={{
              background: statusFilter === 'all' ? '#0870d1' : '#f1f5f9',
              color: statusFilter === 'all' ? '#ffffff' : '#475569',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            همه ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            style={{
              background: statusFilter === 'paid' ? '#16a34a' : '#f1f5f9',
              color: statusFilter === 'paid' ? '#ffffff' : '#475569',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            پرداخت شده ({stats.paidCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            style={{
              background: statusFilter === 'pending' ? '#d97706' : '#f1f5f9',
              color: statusFilter === 'pending' ? '#ffffff' : '#475569',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            در انتظار پرداخت ({stats.pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('cancelled')}
            style={{
              background: statusFilter === 'cancelled' ? '#dc2626' : '#f1f5f9',
              color: statusFilter === 'cancelled' ? '#ffffff' : '#475569',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            لغو شده / ناموفق ({stats.cancelledCount})
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#0870d1' }} />
            <p style={{ margin: 0, fontWeight: 700 }}>در حال بارگذاری لیست خریدها و تراکنش‌ها...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <Receipt size={40} style={{ margin: '0 auto 12px', color: '#cbd5e1' }} />
            <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '15px', color: '#475569' }}>
              هیچ سفارش یا فاکتوری یافت نشد
            </p>
            <small style={{ color: '#94a3b8', fontSize: '12.5px' }}>
              {searchQuery ? 'با عبارت جستجوی وارد شده فاکتوری مطابقت ندارد.' : 'هنوز سفارشی در سامانه ثبت نشده است.'}
            </small>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: '12.5px' }}>
                  <th style={{ padding: '14px 16px' }}>شماره سفارش / فاکتور</th>
                  <th style={{ padding: '14px 16px' }}>مشخصات مشتری</th>
                  <th style={{ padding: '14px 16px' }}>شرح پکیج و ماژول‌ها</th>
                  <th style={{ padding: '14px 16px' }}>مبلغ فاکتور</th>
                  <th style={{ padding: '14px 16px' }}>وضعیت پرداخت</th>
                  <th style={{ padding: '14px 16px' }}>کد پیگیری بانکی</th>
                  <th style={{ padding: '14px 16px' }}>تاریخ ثبت</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>عملیات و تغییر وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => {
                  const isPaid = order.status === 'paid' || order.status === 'completed' || order.status === 'successful';

                  return (
                    <tr 
                      key={order.id} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fafbfd',
                        transition: 'background 0.15s'
                      }}
                    >
                      {/* Order Number */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', direction: 'ltr' }}>
                            {order.order_number || `ORD-${order.id}`}
                          </span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ color: '#0f172a', fontSize: '13px' }}>{order.user_name || 'کاربر کارویتا'}</strong>
                          <span style={{ color: '#64748b', fontSize: '11.5px', fontFamily: 'monospace', direction: 'ltr', textAlign: 'right', marginTop: '2px' }}>
                            {order.mobile || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Package & Modules */}
                      <td style={{ padding: '14px 16px', maxWidth: '240px' }}>
                        <span style={{ fontWeight: 600, color: '#334155', display: 'block', fontSize: '12.5px' }}>
                          {order.package_name || 'سفارش ماژول‌های ابری کارویتا'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '14px 16px' }}>
                        <strong style={{ color: '#0870d1', fontSize: '14px', fontWeight: 800 }}>
                          {Number(order.amount).toLocaleString('fa-IR')}
                        </strong>
                        <small style={{ color: '#64748b', fontSize: '11px', marginRight: '4px' }}>تومان</small>
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Reference ID */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          color: order.reference_id && order.reference_id !== '—' ? '#059669' : '#94a3b8',
                          fontWeight: 600
                        }}>
                          {order.reference_id || '—'}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('fa-IR') : '—'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          
                          {/* Change Status Action Button */}
                          <button
                            type="button"
                            onClick={() => openStatusModal(order)}
                            style={{
                              background: isPaid ? '#f0fdf4' : '#eff6ff',
                              color: isPaid ? '#166534' : '#1d4ed8',
                              border: `1.5px solid ${isPaid ? '#bbf7d0' : '#bfdbfe'}`,
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                            title="تغییر وضعیت پرداخت، ثبت کد رهگیری و فعال‌سازی اشتراک"
                          >
                            <Edit3 size={14} />
                            <span>تغییر وضعیت</span>
                          </button>

                          {/* Official Invoice PDF */}
                          <button
                            type="button"
                            onClick={() => window.open(`/api/invoices/${order.id}`, '_blank')}
                            style={{
                              background: '#ffffff',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="مشاهده، چاپ و دریافت PDF فاکتور رسمی استاندارد دارایی"
                          >
                            <Download size={13} />
                            <span>فاکتور دارایی</span>
                          </button>

                          {/* Official Contract PDF */}
                          <button
                            type="button"
                            onClick={() => window.open(`/api/invoices/${order.id}/contract`, '_blank')}
                            style={{
                              background: '#ffffff',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="مشاهده و دریافت قرارداد رسمی لایسنس و SLA"
                          >
                            <FileText size={13} />
                            <span>قرارداد</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Order Status Modal */}
      {selectedOrder && (
        <div className="erp-sub-modal-backdrop" onClick={() => setSelectedOrder(null)} dir="rtl">
          <div className="erp-sub-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            
            {/* Header */}
            <div className="erp-sub-modal-header" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff' }}>
              <div className="erp-sub-modal-header-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#0870d1', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Edit3 size={18} color="#ffffff" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                      تغییر وضعیت فاکتور #{selectedOrder.order_number || selectedOrder.id}
                    </h3>
                    <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>
                      مدیریت مالی و فعال‌سازی دستی دسترسی‌ها
                    </small>
                  </div>
                </div>
              </div>
              <button 
                className="erp-sub-modal-close-btn" 
                onClick={() => setSelectedOrder(null)} 
                style={{ color: '#cbd5e1', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Form */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Order Info Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '12.5px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>مشتری:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedOrder.user_name} ({selectedOrder.mobile})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>پکیج / ماژول‌ها:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedOrder.package_name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>مبلغ فاکتور:</span>
                  <strong style={{ color: '#0870d1', fontSize: '14px', fontWeight: 800 }}>
                    {Number(selectedOrder.amount).toLocaleString('fa-IR')} تومان
                  </strong>
                </div>
              </div>

              {/* Status Select */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  وضعیت جدید پرداخت و سفارش:
                </label>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 700,
                    outline: 'none',
                    background: '#ffffff',
                    color: '#0f172a'
                  }}
                >
                  <option value="paid">پرداخت شده و تسویه (فعال‌سازی آنی اشتراک)</option>
                  <option value="pending">در انتظار پرداخت</option>
                  <option value="cancelled">لغو شده</option>
                  <option value="failed">ناموفق / رد شده</option>
                  <option value="refunded">مسترد شده (بازگشت وجه)</option>
                </select>
                {newStatus === 'paid' && (
                  <small style={{ display: 'block', color: '#16a34a', marginTop: '4px', fontSize: '11.5px', fontWeight: 600 }}>
                    با انتخاب «پرداخت شده»، دسترسی ماژول‌های این فاکتور برای کاربر فوراً فعال و تمدید می‌شود.
                  </small>
                )}
              </div>

              {/* Reference ID input when paid */}
              {newStatus === 'paid' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    کد پیگیری بانکی / شماره سند واریز:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={customRefId}
                    onChange={e => setCustomRefId(e.target.value)}
                    placeholder="مثال: SHP-98765432 یا کارت‌به‌کارت"
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      direction: 'ltr',
                      textAlign: 'left',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              )}

              {/* Admin Note */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  یادداشت مدیر (اختیاری):
                </label>
                <textarea
                  className="form-textarea"
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="توضیحات پیرامون نحوه تسویه یا علت تغییر وضعیت..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleUpdateStatus}
                  style={{
                    flex: 1,
                    background: '#0870d1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 20px',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Check size={16} />
                  <span>{updating ? 'در حال ذخیره...' : 'ثبت و اعمال تغییر وضعیت'}</span>
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '12px 18px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  انصراف
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
