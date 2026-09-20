import React, { useState, memo } from 'react';
import { Check, Lock, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';

const toPersianDigits = (num) => String(num).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

export function ModuleGridInner({
  modules = [],
  selectedModuleIds = [],
  suggestedModuleIds = [],
  mandatoryModuleIds = [],
  lockedDependenciesMap = {},
  onToggleModule,
}) {
  const [showAllPrimary, setShowAllPrimary] = useState(false);
  const activeModulesList = Array.isArray(modules) ? modules.filter(m => m.is_active !== false) : [];

  const mandatorySet = new Set(mandatoryModuleIds);
  const suggestedSet = new Set(suggestedModuleIds);
  const selectedSet = new Set(selectedModuleIds);

  const isModuleLocked = (modId) => {
    return mandatorySet.has(modId);
  };

  // Sort modules alphabetically by name (title)
  const allModules = [...activeModulesList].sort((a, b) => {
    return (a.title || '').localeCompare(b.title || '', 'fa');
  });

  // Calculate default visible count so all suggested, mandatory and selected modules are always visible
  const suggestedOrSelectedCount = allModules.filter(
    m => isModuleLocked(m.id) || suggestedSet.has(m.id) || selectedSet.has(m.id)
  ).length;
  const initialVisibleCount = Math.max(suggestedOrSelectedCount, 9);

  const displayedModules = showAllPrimary ? allModules : allModules.slice(0, initialVisibleCount);

  const renderModuleCard = (mod) => {
    const isSelected = selectedModuleIds.includes(mod.id);
    const isMandatory = mandatoryModuleIds.includes(mod.id);
    const isLocked = isMandatory;

    let tooltipText = undefined;
    if (isMandatory) {
      tooltipText = 'ماژول پایه و الزامی این صنف (غیرقابل حذف)';
    } else if (mod.description) {
      tooltipText = `${mod.title}: ${mod.description}${mod.price > 0 ? ` (ماهانه ${toPersianDigits(Number(mod.price).toLocaleString('fa-IR'))} تومان)` : ' (رایگان)'}`;
    } else {
      tooltipText = `${mod.title}${mod.price > 0 ? ` - ماهانه ${toPersianDigits(Number(mod.price).toLocaleString('fa-IR'))} تومان` : ' - رایگان'}`;
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

// Memo: the module grid is the heaviest user-panel render (~60 cards).
// Only re-render when selection-relevant props change.
export const ModuleGrid = memo(ModuleGridInner);
export default ModuleGrid;

