import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import Calendar from '../components/Calendar';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { getCurrentUser } from '../components/RequireAuth';
import { api, formatDate } from '../api/client';
import { usePolling } from '../hooks/usePolling';

export default function CalendarPage() {
  const user = getCurrentUser();
  const role = user?.role ?? 'ae';
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    Promise.all([api.getEvents(), api.getCalendarNotes()])
      .then(([ev, calendarNotes]) => { setEvents(ev); setNotes(calendarNotes); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  usePolling(() => load(true));

  const handleAddNote = async (date, text, type) => {
    await api.createCalendarNote({
      date,
      text,
      type,
      createdBy: user?.name ?? '',
      createdByRole: role,
    });
    load(true);
  };

  const calendarEvents = events
    .filter(e => ['confirmed', 'pencil'].includes(e.status) && e.eventDate)
    .map(e => ({ date: e.eventDate, status: e.status }));

  const upcomingList = events
    .filter(e => ['confirmed', 'pencil'].includes(e.status) && e.eventDate)
    .slice(0, 6);

  return (
    <AppLayout role={role}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Booking Calendar</h1>
            <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginTop: 4 }}>
              Click any date to add a note or deadline — visible to everyone on the team.
            </p>
          </div>
        </div>

        {loading && <p style={{ color: 'var(--color-text-sub)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--terracotta-text)' }}>{error}</p>}

        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
            <Calendar events={calendarEvents} notes={notes} onAddNote={handleAddNote} />

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
    </AppLayout>
  );
}
