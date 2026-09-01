import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Layers, 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  Search,
  FileText,
  FileCheck,
  Building2,
  Printer
} from 'lucide-react';
import { api } from '../../services/api';
import { OnlinePaymentModal } from './OnlinePaymentModal';
import { LegalInfoModal } from './LegalInfoModal';

export function UserPaymentsView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [showLegalModal, setShowLegalModal] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api('/user/orders');
      if (res && res.data) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.message || 'خطا در بارگذاری لیست پرداخت‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const handlePaymentDone = () => loadOrders();
    window.addEventListener('payment-completed', handlePaymentDone);
    return () => {
      window.removeEventListener('payment-completed', handlePaymentDone);
    };
  }, []);

  const openOfficialInvoice = (id) => {
    window.open(`/api/invoices/${id}`, '_blank');
  };

  const openOfficialContract = (id) => {
    window.open(`/api/invoices/${id}/contract`, '_blank');
  };

  const downloadOfficialInvoiceHtml = (id, orderNumber) => {
    fetch(`/api/invoices/${id}?download=1`, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
      .then(r => {
        if (!r.ok) throw new Error('دانلود فاکتور رسمی با خطا مواجه شد');
        return r.blob();
      })
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Official-Tax-Invoice-${orderNumber || id}.html`;
        a.click();
      })
      .catch(e => alert(e.message));
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'completed');

  return (
    <div className="user-payments-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={22} color="#0870d1" />
            <span>مدیریت خریدها، فاکتورهای رسمی و قراردادها</span>
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            مشاهده صورتحساب‌های رسمی استاندارد دارایی (با کد اقتصادی و مالیاتی)، قرارداد لایسنس و تسویه آنلاین
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setShowLegalModal(true)}
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#1d4ed8',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="ویرایش نام شرکت، کد اقتصادی، شناسه ملی و آدرس ثبتی جهت درج در فاکتور دارایی"
          >
            <Building2 size={15} />
            <span>اطلاعات حقوقی و کد اقتصادی</span>
          </button>

          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>بروزرسانی</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Tax & Legal Compliance Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        border: '1px solid #bae6fd',
        borderRadius: '12px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={22} color="#0284c7" />
          <div style={{ fontSize: '12.5px', color: '#0369a1' }}>
            <strong>خروجی رسمی استاندارد دارایی:</strong> کلیه فاکتورها دارای کد اقتصادی، شماره ثبت، شناسه مالیاتی سامانه مودیان و محاسبه ۱۰٪ مالیات بر ارزش افزوده و قابل ارائه به اداره امور مالیاتی هستند.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowLegalModal(true)}
          style={{
            background: '#ffffff',
            border: '1px solid #7dd3fc',
            color: '#0284c7',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          تکمیل مشخصات ثبتی خریدار
        </button>
      </div>

      {/* Pending Invoices Section (Highlight) */}
      {pendingOrders.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '2px solid #fde68a',
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#f59e0b', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#92400e' }}>
                  فاکتورهای در انتظار پرداخت ({pendingOrders.length} پیش‌فاکتور معوق)
                </h3>
                <small style={{ color: '#b45309', fontSize: '12px' }}>
                  برای ماژول‌های جدید اضافه شده به اشتراک شما پیش‌فاکتور صادر گردیده است.
                </small>
              </div>
            </div>

            <span style={{
              background: '#b45309',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700
            }}>
              نیازمند پرداخت
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingOrders.map(order => (
              <div key={order.id} style={{
                background: '#ffffff',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '14px', color: '#1e293b' }}>
                      {order.description || (order.module_names?.length ? `افزودن ${order.module_names.length} ماژول سازمانی` : 'پیش‌فاکتور خدمات ابری')}
                    </strong>
                    <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '11.5px', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      {order.order_number}
                    </span>
                  </div>

                  {order.module_names && order.module_names.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                      {order.module_names.map((m, idx) => (
                        <span key={idx} style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          fontSize: '11.5px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}>
                          + {m}
                        </span>
                      ))}
                    </div>
                  )}

                  <small style={{ color: '#64748b', fontSize: '11.5px' }}>
                    تاریخ صدور: {order.created_at ? new Date(order.created_at).toLocaleDateString('fa-IR') : '—'}
                  </small>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <small style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>مبلغ قابل پرداخت:</small>
                    <strong style={{ fontSize: '17px', color: '#b45309', fontWeight: 800 }}>
                      {Number(order.amount).toLocaleString('fa-IR')} تومان
                    </strong>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForPayment(order)}
                      style={{
                        background: '#0870d1',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(8, 112, 209, 0.25)'
                      }}
                    >
                      <CreditCard size={15} />
                      <span>پرداخت آنلاین شاپرک</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openOfficialInvoice(order.id)}
                      title="مشاهده و چاپ رسمی پیش‌فاکتور دارایی"
                      style={{
                        background: '#ffffff',
                        color: '#0870d1',
                        border: '1px solid #93c5fd',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Printer size={15} />
                      <span>چاپ رسمی دارایی (PDF)</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Invoices History */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
            سوابق پرداخت‌ها و فاکتورهای رسمی تسویه‌شده
          </h3>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
            {paidOrders.length} فاکتور معتبر و تسویه‌شده
          </span>
        </div>

        {paidOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: '#94a3b8' }}>
            <Receipt size={36} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontSize: '13.5px' }}>هنوز تراکنش یا فاکتور پرداخت‌شده‌ای ثبت نشده است.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>شماره سفارش</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>شرح فاکتور و ماژول‌ها</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>کد رهگیری شاپرک</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>تاریخ پرداخت</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>مبلغ کل</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>وضعیت</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center' }}>اسناد و خروجی‌های رسمی</th>
                </tr>
              </thead>
              <tbody>
                {paidOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#1e293b' }}>
                      {order.order_number}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {order.description || (order.module_names?.length ? `پکیج ماژول‌ها (${order.module_names.length} ماژول)` : 'اشتراک کارویتا')}
                      </div>
                      {order.module_names && order.module_names.length > 0 && (
                        <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                          {order.module_names.join('، ')}
                        </small>
                      )}
                    </td>
                    <td style={{ padding: '14px', fontFamily: 'monospace', color: '#059669', fontWeight: 600 }}>
                      {order.transaction?.reference_id || 'REF-ONLINE-PAY'}
                    </td>
                    <td style={{ padding: '14px', color: '#64748b' }}>
                      {order.transaction?.paid_at 
                        ? new Date(order.transaction.paid_at).toLocaleDateString('fa-IR')
                        : order.created_at 
                          ? new Date(order.created_at).toLocaleDateString('fa-IR')
                          : '—'}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#0870d1' }}>
                      {Number(order.amount).toLocaleString('fa-IR')} تومان
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <CheckCircle2 size={12} />
                        <span>تسویه قطعی</span>
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => openOfficialInvoice(order.id)}
                          style={{
                            background: '#0870d1',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="مشاهده، چاپ و ذخیره PDF فاکتور رسمی استاندارد با کد اقتصادی و شناسه مالیاتی"
                        >
                          <Printer size={13} />
                          <span>فاکتور رسمی (PDF)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openOfficialContract(order.id)}
                          style={{
                            background: '#f8fafc',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="مشاهده و دانلود قرارداد رسمی خدمات ابری و SLA"
                        >
                          <FileCheck size={13} />
                          <span>قرارداد رسمی (PDF)</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Online Payment Modal */}
      {selectedOrderForPayment && (
        <OnlinePaymentModal
          order={selectedOrderForPayment}
          onClose={() => setSelectedOrderForPayment(null)}
          onSuccess={() => {
            loadOrders();
          }}
        />
      )}

      {/* Legal & Economic Code Modal */}
      {showLegalModal && (
        <LegalInfoModal
          onClose={() => setShowLegalModal(false)}
          onSaved={() => {
            loadOrders();
          }}
        />
      )}

    </div>
  );
}
