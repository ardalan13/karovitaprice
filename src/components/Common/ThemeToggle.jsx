import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }));
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      id="theme-toggle-button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      aria-label={isDark ? 'تغییر به حالت روز (روشن)' : 'تغییر به حالت شب (تاریک)'}
      title={isDark ? 'حالت روز' : 'حالت شب'}
    >
      <span className="theme-toggle-icon-wrap">
        {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
      </span>
      <span className="theme-toggle-label">
        {isDark ? 'حالت روز' : 'حالت شب'}
      </span>
    </button>
  );
}

export default ThemeToggle;
