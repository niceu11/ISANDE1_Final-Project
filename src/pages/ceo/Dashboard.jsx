import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Calendar from '../../components/Calendar';
import { api, formatDate } from '../../api/client';

function currentUserName() {
  try {
    return JSON.parse(localStorage.getItem('soiree-user'))?.name?.split(' ').pop() ?? 'there';
  } catch {
    return 'there';
  }
}

export default function CEODashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getEvents()
      .then(data => { setEvents(data); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="app-shell">
      <Sidebar role="ceo" />
      <main className="main-content">
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

            {/* Calendar (read-only) */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-sub)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Booking Calendar — Read Only</div>
              <Calendar events={calendarEvents} />
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

            {/* Post-MVP placeholders */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {['Total Revenue', 'Conversion Rate'].map(label => (
                <div key={label} style={{ background: 'var(--white)', border: '1.5px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', opacity: 0.5, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-sub)', marginBottom: 8 }}>{label}</div>
                  <div style={{ fontSize: 28, fontFamily: 'var(--font-heading)', color: '#ccc' }}>—</div>
                  <span style={{ display: 'inline-block', marginTop: 10, fontSize: 11, background: '#f0f0f0', color: '#999', padding: '3px 10px', borderRadius: 20 }}>Post-MVP</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
