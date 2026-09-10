import React from 'react';

export function TicketTabs({ activeTab, onTabChange, counts = {}, isAdmin = false }) {
  const tabs = [
    { id: 'all', label: 'همه تیکت‌ها', count: counts.all || 0 },
    { id: 'open', label: 'باز', count: counts.open || 0 },
    { id: 'in_progress', label: 'در حال بررسی', count: counts.in_progress || 0 },
    { id: 'waiting_user', label: 'در انتظار پاسخ', count: counts.waiting_user || 0 },
    { id: 'closed', label: 'بسته شده', count: counts.closed || 0 },
  ];

  return (
    <div className="ticket-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          className={`ticket-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span>{tab.label}</span>
          <span className="ticket-tab-count">{tab.count}</span>
        </button>
      ))}
    </div>
  );
}
