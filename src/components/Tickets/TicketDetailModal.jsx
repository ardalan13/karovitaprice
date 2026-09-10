import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Paperclip, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  Clock3, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download, 
  UserCheck, 
  FolderSync, 
  History, 
  RotateCcw, 
  Trash2,
  Phone,
  Mail,
  User,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { TicketStatusBadge, getStatusLabel } from './TicketStatusBadge';

export function TicketDetailModal({ 
  ticketId, 
  isAdmin = false, 
  onClose, 
  onTicketUpdated 
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSecurityReply, setIsSecurityReply] = useState(false);
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [sending, setSending] = useState(false);

  // Modals & Action States
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [unmaskedSecurityIds, setUnmaskedSecurityIds] = useState({});

  // Admin action states
  const [staffList, setStaffList] = useState([]);
  const [deptList, setDeptList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const chatEndRef = useRef(null);

  function loadTicketDetails() {
    setLoading(true);
    api(`/tickets/${ticketId}`)
      .then(res => {
        setData(res);
        setSelectedStaff(res.ticket.assigned_to || '');
        setSelectedDept(res.ticket.department_id || '');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTicketDetails();
    if (isAdmin) {
      api('/admin/support-staff').then(res => setStaffList(res.data || [])).catch(() => {});
      api('/departments').then(res => setDeptList(res.data || [])).catch(() => {});
    }
  }, [ticketId, isAdmin]);

  useEffect(() => {
    if (data?.messages) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data?.messages]);

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`فایل ${file.name} بیش از ۱۰ مگابایت است.`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setReplyAttachments(prev => [
          ...prev,
          {
            file_name: file.name,
            file_data: event.target.result,
            file_type: file.type,
            file_size: file.size,
          }
        ]);
      };
      reader.readAsDataURL(file);
    }
  }

  function removeAttachment(idx) {
    setReplyAttachments(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSendReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSending(true);
      setError('');
      await api(`/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          message: replyText.trim(),
          is_security_info: isSecurityReply,
          attachments: replyAttachments,
        }),
      });

      setReplyText('');
      setIsSecurityReply(false);
      setReplyAttachments([]);
      loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
      window.dispatchEvent(new CustomEvent('ticket-updated'));
    } catch (err) {
      setError(err.message || 'خطا در ارسال پیام');
    } finally {
      setSending(false);
    }
  }

  async function handleCloseTicket() {
    try {
      setSending(true);
      await api(`/tickets/${ticketId}/close`, { method: 'PUT' });
      setShowCloseConfirm(false);
      loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
      window.dispatchEvent(new CustomEvent('ticket-updated'));
    } catch (err) {
      alert(err.message || 'خطا در بستن تیکت');
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteTicket() {
    try {
      setDeleting(true);
      await api(`/admin/tickets/${ticketId}`, { method: 'DELETE' });
      setShowDeleteConfirm(false);
      if (onTicketUpdated) onTicketUpdated();
      window.dispatchEvent(new CustomEvent('ticket-updated'));
      onClose();
    } catch (err) {
      alert(err.message || 'خطا در حذف تیکت');
    } finally {
      setDeleting(false);
    }
  }

  async function handleReopenTicket() {
    try {
      setSending(true);
      await api(`/tickets/${ticketId}/reopen`, { method: 'PUT' });
      loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
      window.dispatchEvent(new CustomEvent('ticket-updated'));
    } catch (err) {
      alert(err.message || 'خطا در بازگشایی تیکت');
    } finally {
      setSending(false);
    }
  }

  async function handleAssignStaff(staffId) {
    if (!staffId) return;
    try {
      await api(`/admin/tickets/${ticketId}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ staff_id: Number(staffId) }),
      });
      loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
      window.dispatchEvent(new CustomEvent('ticket-updated'));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleChangeDept(deptId) {
    if (!deptId) return;
    try {
      await api(`/admin/tickets/${ticketId}/department`, {
        method: 'PUT',
        body: JSON.stringify({ department_id: Number(deptId) }),
      });
      loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
      window.dispatchEvent(new CustomEvent('ticket-updated'));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleChangeStatus(status) {
    try {
      await api(`/admin/tickets/${ticketId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      loadTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
      window.dispatchEvent(new CustomEvent('ticket-updated'));
    } catch (err) {
      alert(err.message);
    }
  }

  function toggleUnmask(msgId) {
    setUnmaskedSecurityIds(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  }

  if (loading && !data) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" style={{ maxWidth: 780, textAlign: 'center' }}>
          <div className="loader">در حال بارگذاری اطلاعات تیکت…</div>
        </div>
      </div>
    );
  }

  const { ticket, messages = [], history = [] } = data || {};
  const isClosed = ticket?.status === 'closed';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card" 
        style={{ maxWidth: 840, padding: 0, overflow: 'hidden' }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Ticket Header */}
        <div className="ticket-detail-head">
          <div className="ticket-detail-title-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="ticket-number-tag">{ticket?.ticket_number}</span>
              <TicketStatusBadge status={ticket?.status} />
              <span className="ticket-dept-tag">{ticket?.department_name}</span>
              <span className="ticket-service-tag">{ticket?.service_name}</span>
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: 17, color: 'var(--navy)' }}>
              {ticket?.subject}
            </h3>
            {isAdmin && (
              <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: '#475569', marginTop: 4 }}>
                <span><User size={14} style={{ verticalAlign: 'middle', marginLeft: 4 }} /> کاربر: <b>{ticket?.user_name}</b></span>
                <span><Phone size={14} style={{ verticalAlign: 'middle', marginLeft: 4 }} /> {ticket?.user_mobile}</span>
                {ticket?.assigned_name && (
                  <span><UserCheck size={14} style={{ verticalAlign: 'middle', marginLeft: 4 }} /> پشتیبان: <b>{ticket?.assigned_name}</b></span>
                )}
              </div>
            )}
          </div>

          <div className="ticket-detail-actions">
            {isAdmin && (
              <>
                {/* Assign to staff */}
                <select 
                  className="ticket-filter-select"
                  value={selectedStaff}
                  onChange={e => {
                    setSelectedStaff(e.target.value);
                    handleAssignStaff(e.target.value);
                  }}
                  style={{ height: 38, fontSize: 12.5 }}
                >
                  <option value="">ارجاع به پشتیبان…</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
                  ))}
                </select>

                {/* Change Dept */}
                <select 
                  className="ticket-filter-select"
                  value={selectedDept}
                  onChange={e => {
                    setSelectedDept(e.target.value);
                    handleChangeDept(e.target.value);
                  }}
                  style={{ height: 38, fontSize: 12.5 }}
                >
                  <option value="">تغییر دپارتمان…</option>
                  {deptList.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>

                {/* Change Status */}
                <select 
                  className="ticket-filter-select"
                  value={ticket?.status}
                  onChange={e => handleChangeStatus(e.target.value)}
                  style={{ height: 38, fontSize: 12.5 }}
                >
                  <option value="open">باز</option>
                  <option value="in_progress">در حال بررسی</option>
                  <option value="waiting_user">در انتظار پاسخ</option>
                  <option value="closed">بسته شده</option>
                </select>
              </>
            )}

            {/* History timeline toggle */}
            <button 
              type="button" 
              className="btn-secondary outline" 
              onClick={() => setShowHistory(!showHistory)}
              style={{ height: 38, padding: '0 12px', fontSize: 12.5 }}
            >
              <History size={15} />
              <span>{showHistory ? 'مکالمه' : 'تاریخچه'}</span>
            </button>

            {/* Close or Reopen */}
            {!isClosed ? (
              <button 
                type="button" 
                className="btn-danger outline" 
                onClick={() => setShowCloseConfirm(true)}
                style={{ height: 38, padding: '0 12px', fontSize: 12.5 }}
              >
                <span>بستن تیکت</span>
              </button>
            ) : (
              <button 
                type="button" 
                className="btn-primary"
                onClick={handleReopenTicket}
                style={{ height: 38, padding: '0 12px', fontSize: 12.5 }}
              >
                <RotateCcw size={15} />
                <span>بازگشایی تیکت</span>
              </button>
            )}

            <button className="modal-close" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        {error && <div className="alert error" style={{ margin: '12px 20px' }}>{error}</div>}

        {/* Modal View: History Timeline vs Chat Messages */}
        {showHistory ? (
          <div style={{ padding: 24, maxHeight: 520, overflowY: 'auto' }}>
            <h4 style={{ margin: '0 0 16px', color: 'var(--navy)' }}>تاریخچه رویدادها و تغییرات تیکت</h4>
            <div className="history-timeline">
              {history.map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-dot" />
                  <div className="history-content">
                    <div className="history-content-head">
                      <b>{item.action}</b>
                      <small>{new Date(item.created_at).toLocaleString('fa-IR')}</small>
                    </div>
                    <div className="history-detail">
                      توسط: <b>{item.user_name}</b>
                      {item.old_value && (
                        <div style={{ color: '#64748b', marginTop: 4 }}>
                          قبلی: {item.old_value}
                        </div>
                      )}
                      {item.new_value && (
                        <div style={{ color: 'var(--blue-800)', marginTop: 2, fontWeight: 500 }}>
                          جدید: {item.new_value}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="ticket-chat-body">
            {messages.map(msg => {
              const isSupport = msg.sender_type === 'support';
              const isMasked = msg.is_security_info && !unmaskedSecurityIds[msg.id];
              return (
                <div key={msg.id} className={`chat-msg-row ${isSupport ? 'support' : 'user'}`}>
                  <div className="chat-msg-avatar">
                    {isSupport ? 'پ' : (msg.sender_name || 'ک').slice(0, 1)}
                  </div>
                  <div className="chat-msg-content">
                    <div className="chat-msg-header">
                      <span className="chat-msg-sender">
                        {msg.sender_name}
                        <span className="chat-msg-role-pill" style={{ marginRight: 6 }}>
                          {isSupport ? 'پشتیبان' : 'کاربر'}
                        </span>
                      </span>
                      <span>{new Date(msg.created_at).toLocaleString('fa-IR')}</span>
                    </div>

                    <div className="chat-msg-bubble">
                      {msg.is_security_info ? (
                        <div className="security-info-box">
                          <div className="security-info-head">
                            <Lock size={16} />
                            اطلاعات امنیتی محرمانه
                            <button 
                              type="button" 
                              className="link" 
                              onClick={() => toggleUnmask(msg.id)}
                              style={{ marginRight: 'auto', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              {isMasked ? <><Unlock size={14} /> نمایش محتوا</> : <><Lock size={14} /> مخفی‌سازی</>}
                            </button>
                          </div>
                          {isMasked ? (
                            <div className="security-info-content" style={{ letterSpacing: 3 }}>
                              ••••••••••••••••••••••••••••••••
                            </div>
                          ) : (
                            <div className="security-info-content">
                              {msg.message}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {msg.message}
                        </div>
                      )}

                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="msg-attachments">
                          {msg.attachments.map(att => {
                            const isImg = att.file_type?.startsWith('image/');
                            return (
                              <div key={att.id}>
                                <a 
                                  href={att.file_data} 
                                  download={att.file_name} 
                                  className="attachment-chip"
                                  target="_blank" 
                                  rel="noreferrer"
                                >
                                  <FileText size={15} />
                                  <span>{att.file_name}</span>
                                  <small>({(att.file_size / 1024).toFixed(0)} KB)</small>
                                  <Download size={14} />
                                </a>
                                {isImg && (
                                  <img 
                                    src={att.file_data} 
                                    alt={att.file_name} 
                                    className="attachment-preview-img"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* Message Input or Closed Notice */}
        {!showHistory && (
          <div className="ticket-reply-box">
            {isClosed ? (
              <div className="closed-ticket-notice">
                <b>این تیکت بسته شده است.</b>
                <span>برای ارسال پیام یا پیگیری مجدد، ابتدا روی دکمه «بازگشایی تیکت» کلیک کنید.</span>
                <button type="button" onClick={handleReopenTicket} style={{ padding: '8px 20px', borderRadius: 8 }}>
                  بازگشایی مجدد تیکت
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendReply}>
                <textarea 
                  rows={3}
                  placeholder={isAdmin ? 'پاسخ پشتیبان به کاربر را اینجا بنویسید...' : 'پاسخ خود را اینجا بنویسید...'}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />

                {replyAttachments.length > 0 && (
                  <div className="attached-files-list">
                    {replyAttachments.map((f, idx) => (
                      <div key={idx} className="attached-file-pill">
                        <span>{f.file_name}</span>
                        <small>({(f.file_size / 1024).toFixed(0)} KB)</small>
                        <button type="button" onClick={() => removeAttachment(idx)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="ticket-reply-toolbar">
                  <div className="reply-tool-group">
                    <label className="attach-btn-label">
                      <Paperclip size={15} />
                      پیوست فایل
                      <input 
                        type="file" 
                        multiple 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }}
                      />
                    </label>

                    <label className="security-toggle-label">
                      <input 
                        type="checkbox" 
                        checked={isSecurityReply}
                        onChange={e => setIsSecurityReply(e.target.checked)}
                        style={{ accentColor: '#d97706' }}
                      />
                      <Lock size={14} />
                      اطلاعات امنیتی محرمانه
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={sending || !replyText.trim()}
                    style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <Send size={15} />
                    <span>{sending ? 'در حال ارسال…' : 'ارسال پاسخ'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal for closing ticket */}
      {showCloseConfirm && (
        <div className="modal-backdrop" style={{ zIndex: 1001 }} onClick={() => setShowCloseConfirm(false)}>
          <div className="modal-card" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>تأیید بستن تیکت</h3>
              <button className="modal-close" onClick={() => setShowCloseConfirm(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>آیا از بستن این تیکت مطمئن هستید؟</p>
              <small style={{ color: 'var(--muted)', display: 'block', marginBottom: 16 }}>
                پس از بسته شدن، امکان ارسال پیام در تیکت تا زمان بازگشایی مجدد غیرفعال خواهد بود.
              </small>
            </div>
            <div className="modal-foot">
              <button 
                type="button" 
                className="btn-secondary outline" 
                onClick={() => setShowCloseConfirm(false)}
              >
                <span>انصراف</span>
              </button>
              <button 
                type="button" 
                className="btn-danger"
                disabled={sending}
                onClick={handleCloseTicket}
              >
                <span>{sending ? 'در حال ثبت…' : 'بستن تیکت'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
