import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Calendar from '../../components/Calendar';
import { getCurrentUser } from '../../components/RequireAuth';
import { api, formatDate } from '../../api/client';
import { usePolling } from '../../hooks/usePolling';

function currentUserName() {
  return getCurrentUser()?.name?.split(' ').pop() ?? 'there';
}

export default function CEODashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
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
      createdByRole: 'ceo',
    });
    load(true);
  };

  const now = new Date();
  const confirmed = events.filter(e => e.status === 'confirmed');
  const pencil = events.filter(e => e.status === 'pencil');
  const upcomingThisMonth = events.filter(e => {
    if (!e.eventDate) return false;
    const d = new Date(e.eventDate);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const calendarEvents = events
    .filter(e => ['confirmed', 'pencil'].includes(e.status) && e.eventDate)
    .map(e => ({ date: e.eventDate, status: e.status }));

  const stats = [
    { label: 'Confirmed Bookings', value: confirmed.length, accent: 'sage' },
    { label: 'Upcoming This Month', value: upcomingThisMonth.length, accent: 'gold' },
    { label: 'Pencil Bookings', value: pencil.length, accent: 'navy' },
  ];

  return (
    <AppLayout role="ceo">
        <div className="page-header">
          <div>
            <h1 className="page-title">Good morning, {currentUserName()}.</h1>
            <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginTop: 4 }}>
              Executive overview · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {loading && <p style={{ color: 'var(--color-text-sub)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--terracotta)' }}>{error}</p>}

        {!loading && !error && (
          <>
            {/* Stat cards */}
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              {stats.map(s => (
                <Card key={s.label} accent={s.accent}>
                  <div style={{ fontSize: 40, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)' }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-sub)', marginTop: 4 }}>{s.label}</div>
                </Card>
              ))}
            </div>

            {/* Calendar */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-sub)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Booking Calendar</div>
              <Calendar events={calendarEvents} notes={notes} onAddNote={handleAddNote} />
            </div>

            {/* Confirmed bookings list */}
            <Card title="Confirmed Bookings" accent="sage" style={{ marginBottom: 24 }}>
              <table className="data-table" style={{ boxShadow: 'none', border: 'none' }}>
                <thead>
                  <tr><th>Client</th><th>Event Date</th><th>Venue</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {confirmed.map((b) => (
                    <tr key={b._id}>
                      <td style={{ fontWeight: 500 }}>{b.clientName}</td>
                      <td>{formatDate(b.eventDate)}</td>
                      <td>{b.venue}</td>
                      <td><Badge variant="confirmed" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card accent="gold">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>Revenue, conversion rate, and full pipeline breakdown</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-sub)', marginTop: 2 }}>Live figures across every tracked inquiry and payment.</div>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/reports')}>
                  View Reports &amp; Analytics
                </button>
              </div>
            </Card>
          </>
        )}
    </AppLayout>
  );
}
