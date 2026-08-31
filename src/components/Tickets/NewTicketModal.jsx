import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Wrench, 
  CreditCard, 
  HelpCircle, 
  Paperclip, 
  ShieldAlert, 
  Send, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Trash2 
} from 'lucide-react';
import { api } from '../../services/api';

const deptIcons = {
  ShoppingBag: ShoppingBag,
  Wrench: Wrench,
  CreditCard: CreditCard,
  HelpCircle: HelpCircle,
};

export function NewTicketModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [departmentId, setDepartmentId] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSecurityInfo, setIsSecurityInfo] = useState(false);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api('/departments').catch(() => ({ data: [] })),
      api('/user/purchased-packages').catch(() => ({ data: [] })),
    ])
      .then(([deptRes, pkgRes]) => {
        const depts = deptRes.data || [];
        setDepartments(depts);
        if (depts.length > 0) {
          setDepartmentId(depts[0].id);
        }

        const pkgs = pkgRes.data || [];
        setPackages(pkgs);
        if (pkgs.length > 0) {
          setServiceName(pkgs[0].name);
        } else {
          setServiceName('سرویس عمومی / بدون اشتراک فعال');
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`فایل ${file.name} بیشتر از ۱۰ مگابایت است.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [
          ...prev,
          {
            file_name: file.name,
            file_data: event.target.result,
            file_type: file.type,
            file_size: file.size,
          }
        ]);
      };
      reader.readAsDataURL(file);
    }
  }

  function removeAttachment(index) {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!departmentId) {
      setError('لطفاً دپارتمان را انتخاب کنید.');
      return;
    }
    if (!subject.trim()) {
      setError('لطفاً موضوع تیکت را وارد نمایید.');
      return;
    }
    if (!message.trim()) {
      setError('لطفاً متن پیام تیکت را بنویسید.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          department_id: departmentId,
          service_name: serviceName,
          subject: subject.trim(),
          message: message.trim(),
          is_security_info: isSecurityInfo,
          attachments,
        }),
      });

      if (onSuccess) {
        onSuccess(res.ticket);
      }
      window.dispatchEvent(new CustomEvent('ticket-updated'));
    } catch (err) {
      setError(err.message || 'خطا در ثبت تیکت');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card" 
        style={{ maxWidth: 640 }} 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3>نوشتن تیکت پشتیبانی جدید</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {error && <div className="alert error">{error}</div>}

        {step === 1 ? (
          <div>
            <p style={{ margin: '0 0 10px', color: 'var(--muted)', fontSize: 14 }}>
              <b>مرحله اول:</b> لطفاً دپارتمان مورد نظر برای پاسخگویی به این تیکت را انتخاب نمایید.
            </p>

            {loading ? (
              <div className="loader">در حال دریافت دپارتمان‌ها…</div>
            ) : (
              <div className="dept-grid">
                {departments.map(dept => {
                  const Icon = deptIcons[dept.icon] || HelpCircle;
                  const isSelected = departmentId === dept.id;
                  return (
                    <div
                      key={dept.id}
                      className={`dept-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setDepartmentId(dept.id)}
                    >
                      <div className="dept-card-icon">
                        <Icon size={24} />
                      </div>
                      <h4>{dept.name}</h4>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button 
                type="button" 
                className="btn-primary"
                disabled={!departmentId}
                onClick={() => setStep(2)}
                style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <span>مرحله بعد (تکمیل اطلاعات)</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#475569' }}>
                  دپارتمان انتخاب‌شده:
                  <div style={{ 
                    height: 44, 
                    border: '1px solid #dce2ea', 
                    borderRadius: 10, 
                    padding: '0 12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    background: '#f8fafc',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--blue-900)'
                  }}>
                    <span>{departments.find(d => d.id === departmentId)?.name || 'دپارتمان'}</span>
                    <button 
                      type="button" 
                      className="link" 
                      onClick={() => setStep(1)} 
                      style={{ fontSize: 12, padding: 0 }}
                    >
                      تغییر
                    </button>
                  </div>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#475569' }}>
                  پکیج / سرویس مربوطه:
                  <select 
                    value={serviceName} 
                    onChange={e => setServiceName(e.target.value)}
                    style={{ height: 44, border: '1px solid #dce2ea', borderRadius: 10, padding: '0 10px', fontSize: 13 }}
                  >
                    {packages.length > 0 ? (
                      <>
                        {packages.map(pkg => (
                          <option key={pkg.id} value={pkg.name}>
                            {pkg.name}
                          </option>
                        ))}
                        <option value="سرویس عمومی / سایر خدمات">سرویس عمومی / سایر خدمات</option>
                      </>
                    ) : (
                      <option value="سرویس عمومی / بدون اشتراک فعال">سرویس عمومی / بدون اشتراک فعال</option>
                    )}
                  </select>
                </label>
              </div>

              <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#475569' }}>
                موضوع تیکت: *
                <input 
                  type="text" 
                  required
                  placeholder="مثال: راهنمایی در اتصال به وب‌هوک و پرداخت" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                  style={{ height: 44, border: '1px solid #dce2ea', borderRadius: 10, padding: '0 12px', fontSize: 13.5 }}
                />
              </label>

              <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#475569' }}>
                متن پیام: *
                <textarea 
                  rows={5}
                  required
                  placeholder="توضیحات کامل مشکل یا درخواست خود را اینجا بنویسید..." 
                  value={message} 
                  onChange={e => setMessage(e.target.value)}
                  style={{ border: '1px solid #dce2ea', borderRadius: 10, padding: '12px', fontSize: 13.5, resize: 'vertical' }}
                />
              </label>

              {/* Security info toggle */}
              <div style={{ 
                background: isSecurityInfo ? '#fffbeb' : '#f8fafc', 
                border: `1px solid ${isSecurityInfo ? '#fde68a' : '#e2e8f0'}`, 
                borderRadius: 10, 
                padding: '12px 14px' 
              }}>
                <label className="security-toggle-label" style={{ fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={isSecurityInfo} 
                    onChange={e => setIsSecurityInfo(e.target.checked)}
                    style={{ accentColor: '#d97706', width: 16, height: 16 }}
                  />
                  <Lock size={16} />
                  ارسال به عنوان اطلاعات امنیتی و محرمانه (رمز عبور، کلیدهای دسترسی API و...)
                </label>
                {isSecurityInfo && (
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                    <ShieldAlert size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                    این پیام به صورت محافظت‌شده ثبت می‌شود و تنها برای پشتیبانان مجاز این دپارتمان قابل رؤیت خواهد بود.
                  </p>
                )}
              </div>

              {/* Attachments */}
              <div>
                <label className="attach-btn-label">
                  <Paperclip size={16} />
                  پیوست فایل (تصویر، PDF، Zip - حداکثر ۱۰MB)
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }}
                  />
                </label>

                {attachments.length > 0 && (
                  <div className="attached-files-list">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="attached-file-pill">
                        <span>{file.file_name}</span>
                        <small>({(file.file_size / 1024).toFixed(0)} KB)</small>
                        <button type="button" onClick={() => removeAttachment(idx)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
              <button 
                type="button" 
                className="btn-secondary outline" 
                onClick={() => setStep(1)}
              >
                <span>بازگشت به دپارتمان‌ها</span>
              </button>

              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting || !subject.trim() || !message.trim()}
                style={{ padding: '12px 28px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Send size={16} />
                <span>{submitting ? 'در حال ثبت تیکت…' : 'ثبت تیکت پشتیبانی'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
