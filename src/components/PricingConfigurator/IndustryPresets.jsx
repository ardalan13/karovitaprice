import React, { memo } from 'react';
import {
  Factory,
  Ship,
  Truck,
  Building2,
  Building,
  Stethoscope,
  Pill,
  Laptop,
  GraduationCap,
  Scale,
  Plane,
  Megaphone,
  ShieldCheck,
  BarChart3,
  Wrench,
  LayoutGrid,
} from 'lucide-react';

const ICON_MAP = {
  Factory,
  Ship,
  Truck,
  Building2,
  Building,
  Stethoscope,
  Pill,
  Laptop,
  GraduationCap,
  Scale,
  Plane,
  Megaphone,
  ShieldCheck,
  BarChart3,
  Wrench,
};

const THEME_MAP = {
  manufacturing: { bg: '#eff6ff', color: '#2563eb', selectedBg: '#2563eb', selectedColor: '#ffffff' },
  commerce_trade: { bg: '#ffe4e6', color: '#e11d48', selectedBg: '#e11d48', selectedColor: '#ffffff' },
  distribution_logistics: { bg: '#fef3c7', color: '#d97706', selectedBg: '#d97706', selectedColor: '#ffffff' },
  contracting_projects: { bg: '#fef9c3', color: '#ca8a04', selectedBg: '#ca8a04', selectedColor: '#ffffff' },
  real_estate: { bg: '#e0f2fe', color: '#0284c7', selectedBg: '#0284c7', selectedColor: '#ffffff' },
  healthcare_clinic: { bg: '#f3e8ff', color: '#9333ea', selectedBg: '#9333ea', selectedColor: '#ffffff' },
  medical_pharma: { bg: '#ffe4e6', color: '#e11d48', selectedBg: '#e11d48', selectedColor: '#ffffff' },
  it_software: { bg: '#e0f2fe', color: '#0284c7', selectedBg: '#0284c7', selectedColor: '#ffffff' },
  education_academy: { bg: '#ede9fe', color: '#6366f1', selectedBg: '#6366f1', selectedColor: '#ffffff' },
  legal_law: { bg: '#fef3c7', color: '#d97706', selectedBg: '#d97706', selectedColor: '#ffffff' },
  immigration: { bg: '#e0f2fe', color: '#0284c7', selectedBg: '#0284c7', selectedColor: '#ffffff' },
  advertising_marketing: { bg: '#ffe4e6', color: '#e11d48', selectedBg: '#e11d48', selectedColor: '#ffffff' },
  insurance_agency: { bg: '#e0e7ff', color: '#4f46e5', selectedBg: '#4f46e5', selectedColor: '#ffffff' },
  consulting_finance: { bg: '#ccfbf1', color: '#0d9488', selectedBg: '#0d9488', selectedColor: '#ffffff' },
  services_maintenance: { bg: '#f1f5f9', color: '#475569', selectedBg: '#475569', selectedColor: '#ffffff' },
};

export function IndustryPresetsInner({
  presets = [],
  activePresetId = 'manufacturing',
  activePreset = null,
  onSelectPreset,
}) {
  const currentActiveId = activePresetId || activePreset || 'manufacturing';

  return (
    <section className="erp-config-card erp-industry-card-section" id="step-industry-presets">
      <div className="erp-industry-header">
        <div className="erp-industry-header-title-row">
          <LayoutGrid size={22} className="erp-industry-header-icon" />
          <h2 className="erp-industry-header-title">صنف و حوزه تخصصی کسب‌وکار</h2>
        </div>
        <p className="erp-industry-header-subtitle">
          با انتخاب صنف، اشتراک ماژول‌های استاندارد و متداول به طور خودکار پیشنهاد می‌گردد
        </p>
      </div>

      <div className="erp-industry-grid" role="group" aria-label="صنف و حوزه تخصصی کسب‌وکار">
        {presets.map((preset) => {
          const active = currentActiveId === preset.id;
          const IconComponent = ICON_MAP[preset.icon] || Factory;
          const theme = THEME_MAP[preset.id] || { bg: '#eff6ff', color: '#2563eb' };

          return (
            <button
              key={preset.id}
              type="button"
              className={`erp-industry-card ${active ? 'is-selected' : ''}`}
              onClick={() => onSelectPreset && onSelectPreset(preset.id)}
              aria-pressed={active}
              title={preset.description || preset.title}
            >
              <div
                className={`erp-industry-icon-box ${active ? 'is-active' : ''}`}
                style={{
                  backgroundColor: active ? (theme.selectedBg || '#2563eb') : theme.bg,
                  color: active ? (theme.selectedColor || '#ffffff') : theme.color,
                }}
              >
                <IconComponent size={24} strokeWidth={2} />
              </div>
              <span className={`erp-industry-card-title ${active ? 'is-active' : ''}`}>
                {preset.title}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// Memo: skip re-render unless presets list, active id, or handler changes
// (prevents 15-industry-card re-render on every module toggle)
export const IndustryPresets = memo(IndustryPresetsInner);
export default IndustryPresets;

