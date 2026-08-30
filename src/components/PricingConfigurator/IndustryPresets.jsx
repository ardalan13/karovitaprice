import React from 'react';

export function IndustryPresets({ presets, activePreset, onSelectPreset }) {
  return (
    <nav className="erp-industry-presets" aria-label="انتخاب صنعت">
      {presets.map(preset => {
        const isActive = activePreset === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            className={`erp-preset-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectPreset(preset.id)}
            aria-pressed={isActive}
          >
            {preset.title}
          </button>
        );
      })}
    </nav>
  );
}
