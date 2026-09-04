import React from 'react';
import { Check, Lock, ShieldCheck } from 'lucide-react';
import { toPersianDigits } from './configuratorData';

export function ModuleGrid({
  stepNumber = 2,
  modules = [],
  selectedModuleIds = [],
  defaultModuleIds = [],
  lockedDependenciesMap = {},
  onToggleModule,
}) {
  const activeModulesList = Array.isArray(modules) ? modules.filter(m => m.is_active !== false) : [];

  return (
    <section className="erp-config-card erp-step-card" id="step-modules-grid">
      <div className="erp-card-header">
        <div className="erp-step-indicator">
          <span className="erp-step-badge">{toPersianDigits(stepNumber)}</span>
          <h3 className="erp-step-title">ماژول‌های مورد نیاز</h3>
        </div>
      </div>

      <div className="erp-step-body">
        <div className="erp-modules-grid">
          {activeModulesList.map(mod => {
            const isSelected = selectedModuleIds.includes(mod.id);
            const isDefaultPreset = defaultModuleIds.includes(mod.id);
            const lockedBy = lockedDependenciesMap[mod.id];
            const isDepLocked = isSelected && Array.isArray(lockedBy) && lockedBy.length > 0;
            const isLocked = isDefaultPreset || isDepLocked;

            let tooltipText = undefined;
            if (isDefaultPreset) {
              tooltipText = 'ماژول پایه و پیش‌فرض این صنعت (غیرقابل حذف)';
            } else if (isDepLocked) {
              tooltipText = `پیش‌نیاز اجباری برای: ${lockedBy.join('، ')}`;
            } else if (mod.description) {
              tooltipText = mod.description;
            }

            return (
              <div
                key={mod.id}
                id={`module-card-${mod.id}`}
                className={`erp-module-card ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''} ${isDefaultPreset ? 'default-preset' : ''}`}
                onClick={() => {
                  if (!isLocked) {
                    onToggleModule(mod.id);
                  }
                }}
                title={tooltipText}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={isLocked ? -1 : 0}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    if (!isLocked) onToggleModule(mod.id);
                  }
                }}
              >
                <div className="erp-module-info">
                  <span className="erp-module-title">{mod.title}</span>
                  {isDefaultPreset && (
                    <span className="erp-default-pill">پایه</span>
                  )}
                </div>

                <div className={`erp-module-checkbox ${isSelected ? 'checked' : ''} ${isLocked ? 'disabled' : ''}`}>
                  {isSelected && (
                    isLocked ? <Lock size={13} className="erp-lock-icon" /> : <Check size={14} className="erp-check-icon" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
