import React, { useState, useEffect } from 'react';
import { Building2, X, Check, AlertCircle, ShieldCheck, FileCheck } from 'lucide-react';
import { api } from '../../services/api';

export function LegalInfoModal({ onClose, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    industry: '',
    employee_count: 10,
    economic_code: '',
    national_id: '',
    registration_number: '',
    postal_code: '',
    province: 'تهران',
    city: 'تهران',
    address: '',
    phone: '',
  });

  useEffect(() => {
    api('/user/company')
      .then(res => {
        if (res && res.data) {
          setForm(prev => ({
            ...prev,
            name: res.data.name || '',
            industry: res.data.industry || '',
            employee_count: res.data.employee_count || 10,
            economic_code: res.data.economic_code || '',
            national_id: res.data.national_id || '',
            registration_number: res.data.registration_number || '',
            postal_code: res.data.postal_code || '',
            province: res.data.province || 'تهران',
            city: res.data.city || 'تهران',
            address: res.data.address || '',
            phone: res.data.phone || '',
          }));
        }
      })
      .catch(err => {
        console.error('Error fetching company info:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api('/user/company', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setSuccess('مشخصات حقوقی و مالیاتی با موفقیت ذخیره شد. کلیه فاکتورهای جدید و قبلی با این مشخصات صادر می‌گردند.');
      setTimeout(() => {
        if (onSaved) onSaved();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'خطا در ذخیره اطلاعات حقوقی');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px',
      direction: 'rtl'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#0870d1', color: '#fff', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                اطلاعات حقوقی، کد اقتصادی و شناسه مالیاتی
              </h3>
              <small style={{ color: '#64748b', fontSize: '11.5px' }}>
                جهت درج در صورتحساب رسمی استاندارد دارایی و قرارداد لایسنس
              </small>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={16} />
              <span>{success}</span>
            </div>
          )}

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <ShieldCheck size={18} color="#0870d1" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              این مشخصات در بخش <strong>«مشخصات خریدار»</strong> فاکتورهای رسمی و قراردادها قرار می‌گیرد و برای ارائه به اداره امور مالیاتی (ماده ۱۶۹ م.م) و سامانه مودیان مورد تایید و استناد است.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                نام کامل شرکت / شخص حقوقی *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="مثال: شرکت داده‌ورزی رایان (سهامی خاص)"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                شناسه ملی شرکت / کد ملی *
              </label>
              <input
                type="text"
                required
                value={form.national_id}
                onChange={e => setForm({ ...form, national_id: e.target.value })}
                placeholder="مثال: ۱۴۰۰۷۸۹۴۵۶۱"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', direction: 'ltr', textAlign: 'right' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                شماره اقتصادی (کد اقتصادی ۱۲ رقمی)
              </label>
              <input
                type="text"
                value={form.economic_code}
                onChange={e => setForm({ ...form, economic_code: e.target.value })}
                placeholder="مثال: ۴۱۱۶۵۸۹۴۷۵۲۳"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', direction: 'ltr', textAlign: 'right' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                شماره ثبت شرکت
              </label>
              <input
                type="text"
                value={form.registration_number}
                onChange={e => setForm({ ...form, registration_number: e.target.value })}
                placeholder="مثال: ۵۸۴۲۱۹"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', direction: 'ltr', textAlign: 'right' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                کد پستی ۱۰ رقمی
              </label>
              <input
                type="text"
                value={form.postal_code}
                onChange={e => setForm({ ...form, postal_code: e.target.value })}
                placeholder="مثال: ۱۹۹۷۹۸۵۶۱۴"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', direction: 'ltr', textAlign: 'right' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                شماره تلفن ثابت شرکت
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="مثال: ۰۲۱-۸۸۰۰۱۱۰۰"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', direction: 'ltr', textAlign: 'right' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                استان
              </label>
              <input
                type="text"
                value={form.province}
                onChange={e => setForm({ ...form, province: e.target.value })}
                placeholder="مثال: تهران"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                شهر
              </label>
              <input
                type="text"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                placeholder="مثال: تهران"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              نشانی دقیق اقامتگاه قانونی
            </label>
            <textarea
              rows={2}
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="مثال: خیابان مطهری، خیابان میرعماد، کوچه دهم، پلاک ۱۲، طبقه ۴"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={saving || loading}
              style={{
                background: '#0870d1',
                color: '#ffffff',
                border: 'none',
                padding: '9px 22px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileCheck size={16} />
              <span>{saving ? 'در حال ذخیره‌سازی…' : 'ذخیره اطلاعات حقوقی و مالیاتی'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
