import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { computeNotifications } from '../notifications';
import { usePolling } from '../hooks/usePolling';
import './NotificationBell.css';

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const load = () => {
    Promise.all([api.getEvents(), api.getCalendarNotes()])
      .then(([events, calendarNotes]) => setItems(computeNotifications({ events, calendarNotes })))
      .catch(() => {});
  };

  useEffect(load, []);
  usePolling(load);

  return (
    <div className="notif-bell-wrap">
      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
      >
        <span>🔔</span>
        {items.length > 0 && (
          <span className="notif-bell-badge">{items.length > 9 ? '9+' : items.length}</span>
        )}
      </button>

      {open && (
        <>
          <div className="notif-bell-backdrop" onClick={() => setOpen(false)} />
          <div className="notif-bell-panel">
            <div className="notif-bell-header">Notifications</div>
            {items.length === 0 && (
              <div className="notif-bell-empty">You're all caught up.</div>
            )}
            <div className="notif-bell-list">
              {items.slice(0, 15).map(item => (
                <div key={item.id} className="notif-bell-item">
                  <span className={`notif-bell-tag notif-bell-tag-${item.type}`}>{item.typeLabel}</span>
                  <span className="notif-bell-text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
