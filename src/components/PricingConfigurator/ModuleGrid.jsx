import React from 'react';
import { Check, Lock } from 'lucide-react';
import { toPersianDigits } from './configuratorData';

export function ModuleGrid({
  stepNumber = 2,
  modules,
  selectedModuleIds,
  lockedDependenciesMap = {},
  onToggleModule,
}) {
  // Group modules into the exact row order matching the screenshot
  // Row order: [Col1_item, Col2_item, Col3_item]
  const col1Ids = ['crm', 'restaurant', 'timesheet', 'calendar', 'documents', 'tax', 'inventory', 'hr', 'payroll'];
  const col2Ids = ['sale', 'barcode', 'helpdesk', 'appointment', 'shift', 'accounting', 'purchase', 'attendance', 'recruitment'];
  const col3Ids = ['pos', 'project', 'knowledge', 'survey', 'sms', 'expenses', 'mrp', 'leaves', 'im_livechat'];

  const moduleMap = new Map(modules.map(m => [m.id, m]));

  const orderedModules = [];
  const maxRows = Math.max(col1Ids.length, col2Ids.length, col3Ids.length);
  for (let r = 0; r < maxRows; r++) {
    if (col1Ids[r] && moduleMap.has(col1Ids[r])) orderedModules.push(moduleMap.get(col1Ids[r]));
    if (col2Ids[r] && moduleMap.has(col2Ids[r])) orderedModules.push(moduleMap.get(col2Ids[r]));
    if (col3Ids[r] && moduleMap.has(col3Ids[r])) orderedModules.push(moduleMap.get(col3Ids[r]));
  }

  // Any remaining modules not in fixed list
  for (const m of modules) {
    if (!orderedModules.some(om => om.id === m.id)) {
      orderedModules.push(m);
    }
  }

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
          {orderedModules.map(mod => {
            const isSelected = selectedModuleIds.includes(mod.id);
            const lockedBy = lockedDependenciesMap[mod.id];
            const isLocked = isSelected && Array.isArray(lockedBy) && lockedBy.length > 0;

            return (
              <div
                key={mod.id}
                id={`module-card-${mod.id}`}
                className={`erp-module-card ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => {
                  if (!isLocked) {
                    onToggleModule(mod.id);
                  }
                }}
                title={isLocked ? `پیش‌نیاز اجباری برای: ${lockedBy.join('، ')}` : undefined}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    if (!isLocked) onToggleModule(mod.id);
                  }
                }}
              >
                <span className="erp-module-title">{mod.title}</span>

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
