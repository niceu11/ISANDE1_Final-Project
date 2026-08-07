import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatDate } from '../api/client';
import { computeNotifications } from '../notifications';
import { usePolling } from '../hooks/usePolling';
import { getCurrentUser } from './RequireAuth';
import './NotificationPanel.css';

const SECTIONS = [
  { key: 'followup',     title: 'Follow-ups' },
  { key: 'inquiry',      title: 'New Inquiries' },
  { key: 'upcoming',     title: 'Upcoming Events' },
  { key: 'deadline',     title: 'Deadlines' },
  { key: 'announcement', title: 'Announcements' },
  { key: 'note',         title: 'Notes' },
];

const MAX_VISIBLE_PER_SECTION = 4;

function destinationFor(item, role) {
  if (item.type === 'inquiry' || item.type === 'followup') {
    return role === 'ae' ? `/ae/clients/${item.entityId}` : null;
  }
  return '/calendar';
}

export default function NotificationPanel() {
  const [items, setItems] = useState([]);
  const [pulse, setPulse] = useState(false);
  const navigate = useNavigate();
  const role = getCurrentUser()?.role;

  const load = () => {
    Promise.all([api.getEvents(), api.getCalendarNotes()])
      .then(([events, calendarNotes]) => {
        setItems(computeNotifications({ events, calendarNotes }));
        setPulse(true);
        setTimeout(() => setPulse(false), 700);
      })
      .catch(() => {});
  };

  useEffect(load, []);
  usePolling(load);

  const grouped = SECTIONS
    .map(s => ({ ...s, items: items.filter(i => i.type === s.key) }))
    .filter(s => s.items.length > 0);

  const urgentCount = items.filter(i => i.priority === 'urgent').length;

  return (
    <aside className="notif-panel">
      <div className="notif-panel-header">
        <div>
          <span className="notif-panel-eyebrow">Live overview</span>
          <h2 className="notif-panel-title">Notifications</h2>
        </div>
        <div className={`notif-live ${pulse ? 'notif-live-pulse' : ''}`}>
          <span className="notif-live-dot" />
          Live
        </div>
      </div>

      {urgentCount > 0 && (
        <div className="notif-urgent-banner">
          <span className="notif-urgent-banner-dot" />
          {urgentCount} need{urgentCount === 1 ? 's' : ''} your attention first
        </div>
      )}

      <div className="notif-panel-body">
        {items.length === 0 && (
          <div className="notif-panel-empty">
            <span className="notif-panel-empty-icon">✓</span>
            <span>You're all caught up.</span>
          </div>
        )}

        {grouped.map(section => {
          const visible = section.items.slice(0, MAX_VISIBLE_PER_SECTION);
          const hidden = section.items.length - visible.length;
          return (
            <div key={section.key} className="notif-section">
              <div className="notif-section-head">
                <span className="notif-section-title">{section.title}</span>
                <span className="notif-section-count">{section.items.length}</span>
              </div>
              <div className="notif-section-list">
                {visible.map(item => {
                  const dest = destinationFor(item, role);
                  const Tag = dest ? 'button' : 'div';
                  return (
                    <Tag
                      key={item.id}
                      type={dest ? 'button' : undefined}
                      className={`notif-row ${item.priority === 'urgent' ? 'notif-row-urgent' : ''} ${dest ? 'notif-row-clickable' : ''}`}
                      onClick={dest ? () => navigate(dest) : undefined}
                    >
                      <span className={`notif-row-dot notif-row-dot-${item.type} ${item.priority === 'urgent' ? 'notif-row-dot-urgent' : ''}`} />
                      <div className="notif-row-body">
                        <p className="notif-row-text">{item.text}</p>
                        <span className="notif-row-date">{formatDate(item.date, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </Tag>
                  );
                })}
                {hidden > 0 && (
                  <div className="notif-row-more">+{hidden} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
