import React, { useState } from 'react';
import { Check, Lock, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';

const toPersianDigits = (num) => String(num).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

export function ModuleGrid({
  modules = [],
  selectedModuleIds = [],
  suggestedModuleIds = [],
  mandatoryModuleIds = ['account', 'hr'],
  onToggleModule,
}) {
  const [showAllPrimary, setShowAllPrimary] = useState(false);
  const activeModulesList = Array.isArray(modules) ? modules.filter(m => m.is_active !== false) : [];

  const mandatorySet = new Set(mandatoryModuleIds);
  const suggestedSet = new Set(suggestedModuleIds);
  const selectedSet = new Set(selectedModuleIds);

  // Unified list of all active modules:
  // Tier 1: Mandatory modules (e.g. account, hr)
  // Tier 2: Suggested or selected modules for the active industry
  // Tier 3: All other ERP modules (previously in other modules)
  const allModules = [...activeModulesList].sort((a, b) => {
    const aMandatory = mandatorySet.has(a.id);
    const bMandatory = mandatorySet.has(b.id);
    if (aMandatory && !bMandatory) return -1;
    if (!aMandatory && bMandatory) return 1;

    const aSuggested = suggestedSet.has(a.id) || selectedSet.has(a.id);
    const bSuggested = suggestedSet.has(b.id) || selectedSet.has(b.id);
    if (aSuggested && !bSuggested) return -1;
    if (!aSuggested && bSuggested) return 1;

    return (a.title || '').localeCompare(b.title || '', 'fa');
  });

  // Calculate default visible count so all suggested and selected modules are always visible
  const suggestedOrSelectedCount = allModules.filter(
    m => mandatorySet.has(m.id) || suggestedSet.has(m.id) || selectedSet.has(m.id)
  ).length;
  const initialVisibleCount = Math.max(suggestedOrSelectedCount, 9);

  const displayedModules = showAllPrimary ? allModules : allModules.slice(0, initialVisibleCount);

  const renderModuleCard = (mod) => {
    const isSelected = selectedModuleIds.includes(mod.id);
    const isMandatory = mandatoryModuleIds.includes(mod.id);
    // Strictly lock only mandatory modules; all other suggested/active modules can be freely toggled
    const isLocked = isMandatory;

    let tooltipText = undefined;
    if (isMandatory) {
      tooltipText = 'ماژول پایه و الزامی این صنف (غیرقابل حذف)';
    } else if (mod.id === 'crm') {
      tooltipText = 'مدیریت ارتباط با مشتری (CRM) - ماهانه ۸۰۰,۰۰۰ تومان (۱ کاربر پایه + به ازای هر کاربر اضافه ۸۰۰,۰۰۰ ت)';
    } else if (mod.id === 'project') {
      tooltipText = 'پروژه - ماهانه ۱,۰۰۰,۰۰۰ تومان (کاربران نامحدود و بدون هزینه اضافه)';
    } else if (mod.id === 'contacts') {
      tooltipText = 'مخاطبان و اشخاص - رایگان (پایه سیستم)';
    } else if (mod.description) {
      tooltipText = `${mod.title}: ${mod.description} (ماهانه ۲۵۰,۰۰۰ تومان - کاربران نامحدود)`;
    }

    return (
      <div
        key={mod.id}
        id={`module-card-${mod.id}`}
        className={`erp-module-item-card ${isSelected ? 'is-selected' : ''} ${isLocked ? 'is-locked' : ''}`}
        onClick={() => {
          if (!isLocked && onToggleModule) {
            onToggleModule(mod.id);
          }
        }}
        title={tooltipText}
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={isLocked ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !isLocked && onToggleModule) {
            e.preventDefault();
            onToggleModule(mod.id);
          }
        }}
      >
        <div className="erp-module-right-wrap">
          {isMandatory && (
            <span className="erp-module-mandatory-badge">
              <Lock size={11} className="erp-lock-icon" />
              الزامی
            </span>
          )}
          {mod.id === 'crm' && (
            <span style={{
              fontSize: '10px',
              color: '#0284c7',
              background: '#e0f2fe',
              padding: '1px 5px',
              borderRadius: '4px',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}>
              مجوز کاربر
            </span>
          )}
          {mod.id === 'project' && (
            <span style={{
              fontSize: '10px',
              color: '#059669',
              background: '#ecfdf5',
              padding: '1px 5px',
              borderRadius: '4px',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}>
              کاربر نامحدود
            </span>
          )}
          <span className="erp-module-card-title">{mod.title}</span>
        </div>

        <div className={`erp-module-check-box ${isSelected ? 'checked' : ''} ${isLocked ? 'locked' : ''}`}>
          {isSelected && <Check size={14} strokeWidth={2.5} />}
        </div>
      </div>
    );
  };

  return (
    <section className="erp-config-card erp-modules-section" id="step-modules-grid">
      {/* Primary Section Header */}
      <div className="erp-modules-header">
        <div className="erp-modules-header-title-row">
          <CheckSquare size={22} className="erp-modules-header-icon" />
          <h2 className="erp-modules-header-title">ماژول‌های فعال و پیشنهادی</h2>
        </div>
        <p className="erp-modules-header-subtitle">
          ماژول‌های مورد نظرتان را علامت بزنید یا موارد غیرضروری را حذف کنید
        </p>
      </div>

      {/* Unified 3-Column Grid */}
      <div className="erp-module-grid-3col" role="group" aria-label="ماژول‌های فعال و پیشنهادی">
        {displayedModules.map(renderModuleCard)}
      </div>

      {/* Show More / Show Less Button */}
      {allModules.length > initialVisibleCount && (
        <div className="erp-show-more-wrap">
          <button
            type="button"
            className="erp-show-more-btn"
            onClick={() => setShowAllPrimary(!showAllPrimary)}
            id="btn-toggle-more-modules"
          >
            <span>
              {showAllPrimary
                ? 'نمایش کمتر ماژول‌ها'
                : `مشاهده ماژول‌های بیشتر (${toPersianDigits(allModules.length - initialVisibleCount)}+)`}
            </span>
            {showAllPrimary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      )}
    </section>
  );
}

