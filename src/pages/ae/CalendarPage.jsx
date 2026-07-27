import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Calendar from '../../components/Calendar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { api, formatDate } from '../../api/client';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getEvents()
      .then(data => { setEvents(data); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const calendarEvents = events
    .filter(e => ['confirmed', 'pencil'].includes(e.status) && e.eventDate)
    .map(e => ({ date: e.eventDate, status: e.status }));

  const upcomingList = events
    .filter(e => ['confirmed', 'pencil'].includes(e.status) && e.eventDate)
    .slice(0, 6);

  return (
    <div className="app-shell">
      <Sidebar role="ae" />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Booking Calendar</h1>
        </div>

        {loading && <p style={{ color: 'var(--color-text-sub)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--terracotta)' }}>{error}</p>}

        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
            <Calendar events={calendarEvents} />

            <Card title="Upcoming Events" accent="sage">
              {upcomingList.length === 0 && <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No upcoming events.</p>}
              {upcomingList.map((e, i) => (
                <div key={e._id} style={{ padding: '10px 0', borderBottom: i < upcomingList.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{e.clientName}</div>
                    <Badge variant={e.status} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-sub)', marginTop: 2 }}>{formatDate(e.eventDate, { month: 'short', day: 'numeric' })} · {e.venue}</div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
