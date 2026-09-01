import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  AlertCircle, 
  Receipt, 
  Download, 
  ArrowLeft,
  Sparkles,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';

export function OnlinePaymentModal({ order, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  if (!order) return null;

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api(`/orders/${order.id}/pay`, {
        method: 'POST'
      });

      if (res && res.data) {
        setPaymentSuccessData(res.data);
        if (onSuccess) onSuccess(res.data);
        window.dispatchEvent(new CustomEvent('payment-completed'));
        window.dispatchEvent(new CustomEvent('order-updated'));
      } else {
        throw new Error(res.message || 'خطا در انجام پرداخت');
      }
    } catch (err) {
      setError(err.message || 'خطا در اتصال به درگاه پرداخت شاپرک');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (id) => {
    fetch('/api/invoices/' + id, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
      .then(r => {
        if (!r.ok) throw new Error('دانلود فاکتور با خطا مواجه شد');
        return r.blob();
      })
      .then(x => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(x);
        a.download = 'invoice-' + (order.order_number || id) + '.html';
        a.click();
      })
      .catch(e => alert(e.message));
  };

  return (
    <div className="erp-sub-modal-backdrop" onClick={onClose} dir="rtl">
      <div className="erp-sub-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        
        {/* Header */}
        <div className="erp-sub-modal-header" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff' }}>
          <div className="erp-sub-modal-header-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#0870d1', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={20} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
                  {paymentSuccessData ? 'رسید پرداخت موفق' : 'درگاه پرداخت آنلاین شاپرک'}
                </h3>
                <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>
                  سامانه تسویه فاکتور و خدمات ابری کارویتا
                </small>
              </div>
            </div>
          </div>
          <button className="erp-sub-modal-close-btn" onClick={onClose} style={{ color: '#cbd5e1' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {paymentSuccessData ? (
            /* Success View */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '2px solid #86efac'
              }}>
                <CheckCircle2 size={36} color="#16a34a" />
              </div>

              <h4 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#15803d' }}>
                پرداخت با موفقیت انجام شد!
              </h4>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
                فاکتور شما تسویه شد و دسترسی ماژول‌ها در سامانه ERP کارویتا تثبیت گردید.
              </p>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'right'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>شماره سفارش:</span>
                  <strong>{paymentSuccessData.order_number || order.order_number}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>کد رهگیری بانکی:</span>
                  <strong style={{ color: '#059669', fontFamily: 'monospace' }}>{paymentSuccessData.reference_id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>مبلغ پرداخت شده:</span>
                  <strong style={{ color: '#1d4ed8', fontSize: '15px' }}>
                    {Number(paymentSuccessData.amount || order.amount).toLocaleString('fa-IR')} تومان
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadInvoice(order.id)}
                  style={{
                    background: '#0870d1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={16} />
                  <span>دانلود فاکتور رسمی</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  بستن
                </button>
              </div>
            </div>
          ) : (
            /* Checkout View */
            <div>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>شماره فاکتور:</span>
                  <strong style={{ fontSize: '13px', color: '#1e293b' }}>{order.order_number}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>شرح سفارش:</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', textAlign: 'left', maxWidth: '65%' }}>
                    {order.description || (order.module_names?.length ? `افزودن ماژول‌های (${order.module_names.join('، ')})` : 'سفارش خدمات کارویتا')}
                  </span>
                </div>

                {order.module_names && order.module_names.length > 0 && (
                  <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>ماژول‌های درج شده در فاکتور:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {order.module_names.map((name, i) => (
                        <span key={i} style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 600
                        }}>
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '2px solid #e2e8f0',
                  marginTop: '10px'
                }}>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>مبلغ قابل پرداخت:</strong>
                  <strong style={{ fontSize: '18px', color: '#0870d1', fontWeight: 800 }}>
                    {Number(order.amount).toLocaleString('fa-IR')} تومان
                  </strong>
                </div>
              </div>

              {/* Gateway Simulation Selection */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} color="#0870d1" />
                  </div>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block' }}>
                      درگاه امن پرداخت الکترونیک سداد / شاپرک
                    </strong>
                    <small style={{ color: '#64748b', fontSize: '11px' }}>
                      اتصال رمزنگاری شده ۲۵۶ بیتی SSL
                    </small>
                  </div>
                </div>
                <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                  فعال
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePay}
                  style={{
                    flex: 1,
                    background: '#0870d1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(8, 112, 209, 0.25)'
                  }}
                >
                  <Lock size={16} />
                  <span>{loading ? 'در حال اتصال به درگاه شاپرک...' : 'تأیید و پرداخت آنلاین'}</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
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
          )}
        </div>

      </div>
    </div>
  );
}
