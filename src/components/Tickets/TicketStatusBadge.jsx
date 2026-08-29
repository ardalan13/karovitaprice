import React from 'react';

export function getStatusLabel(status) {
  switch (status) {
    case 'open':
      return 'باز';
    case 'in_progress':
      return 'در حال بررسی';
    case 'waiting_user':
      return 'در انتظار پاسخ';
    case 'closed':
      return 'بسته شده';
    default:
      return status || '—';
  }
}

export function TicketStatusBadge({ status }) {
  const label = getStatusLabel(status);
  return (
    <span className={`pill ${status}`}>
      {label}
    </span>
  );
}
