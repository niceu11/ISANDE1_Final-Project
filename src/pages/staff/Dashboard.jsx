import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { getCurrentUser } from '../../components/RequireAuth';
import { api, formatDate } from '../../api/client';
import { usePolling } from '../../hooks/usePolling';

function firstName() {
  return getCurrentUser()?.name?.split(' ')[0] ?? 'there';
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    Promise.all([api.getFeaturedEvent(), api.getEvents()])
      .then(([f, ev]) => { setFeatured(f); setEvents(ev); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  usePolling(() => load(true));

  const upcoming = events
    .filter(e => ['confirmed', 'pencil'].includes(e.status) && e.eventDate)
    .slice(0, 5);

  const confirmedSuppliers = featured?.suppliers?.filter(s => s.status === 'confirmed').length ?? 0;
  const totalSuppliers = featured?.suppliers?.length ?? 0;

  return (
    <AppLayout role="staff">
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome, {firstName()}.</h1>
            <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginTop: 4 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {loading && <p style={{ color: 'var(--color-text-sub)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--terracotta)' }}>{error}</p>}

        {!loading && !error && (
          <>
            {featured && (
              <Card title="Today's Featured Event" accent="navy" className="staff-hero-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 22, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)' }}>{featured.clientName}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-sub)', marginTop: 4 }}>
                      {featured.eventType} · {formatDate(featured.eventDate)} · {featured.venue}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-sub)', marginTop: 4 }}>
                      {featured.guestCount} guests · Coordinator: {featured.coordinator || '—'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>Suppliers confirmed</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)' }}>{confirmedSuppliers} / {totalSuppliers}</div>
                    <button className="btn btn-primary" style={{ marginTop: 10, fontSize: 12 }} onClick={() => navigate('/staff/event-day')}>
                      Open Event Day View
                    </button>
                  </div>
                </div>
              </Card>
            )}

            <div style={{ marginTop: 24 }}>
              <Card title="Upcoming Events" subtitle="Confirmed and pencil bookings" accent="sage">
                {upcoming.length === 0 && <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No upcoming events.</p>}
                {upcoming.map((e, i) => (
                  <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < upcoming.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{e.clientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>{formatDate(e.eventDate)} · {e.venue}</div>
                    </div>
                    <Badge variant={e.status} />
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}
    </AppLayout>
  );
}
