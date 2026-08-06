import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatDate } from '../../api/client';
import { ClockIcon, LocationIcon, GuestsIcon, CoordinatorIcon } from '../../components/icons/MetaIcons';
import Badge from '../../components/Badge';
import './EventDay.css';

export default function EventDay() {
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getFeaturedEvent()
      .then(data => { setEvent(data); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="event-day-bg"><p style={{ padding: 40 }}>Loading…</p></div>;
  if (error || !event) return <div className="event-day-bg"><p style={{ padding: 40, color: '#b3543a' }}>{error || 'No event found.'}</p></div>;

  return (
    <div className="event-day-bg">
      <div className="event-day-container">
        {/* Header */}
        <div className="event-day-header">
          <button className="event-day-back" onClick={() => navigate('/staff/dashboard')}>← Dashboard</button>
          <div className="event-day-brand">Soirée Hub · Event Day View</div>
          <div className="event-day-date">{formatDate(event.eventDate, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </div>

        {/* Hero event card */}
        <div className="event-hero-card">
          <div className="event-hero-label">Today's Event</div>
          <h1 className="event-hero-title">{event.clientName}</h1>
          <p className="event-hero-type">{event.eventType}</p>
          <div className="event-hero-meta">
            <span><ClockIcon /> {event.time}</span>
            <span><LocationIcon /> {event.venue}</span>
            <span><GuestsIcon /> {event.guestCount} guests</span>
            <span><CoordinatorIcon /> Coord: {event.coordinator}</span>
          </div>
        </div>

        {/* Suppliers table */}
        <div className="event-section">
          <h2 className="event-section-title">Assigned Suppliers</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {event.suppliers.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 500 }}>{s.role}</td>
                  <td>{s.company}</td>
                  <td style={{ color: 'var(--color-text-sub)' }}>{s.contact}</td>
                  <td><Badge variant={s.status === 'no-response' ? 'overdue' : s.status} label={s.status === 'no-response' ? 'No Response' : undefined} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Client instructions */}
        <div className="event-section">
          <h2 className="event-section-title">Client Instructions</h2>
          <div className="event-instructions-card">
            <ul className="event-instructions-list">
              {event.instructions.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
