import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import InquiryModal from './InquiryModal';
import { api, formatCurrency, formatDate, daysOverdue } from '../../api/client';

function currentUserName() {
  try {
    return JSON.parse(localStorage.getItem('soiree-user'))?.name?.split(' ').pop() ?? 'there';
  } catch {
    return 'there';
  }
}

export default function AEDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.getEvents(), api.getPayments()])
      .then(([ev, pay]) => { setEvents(ev); setPayments(pay); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const leadCounts = { hot: 0, warm: 0, cold: 0 };
  events.forEach(e => { if (leadCounts[e.status] !== undefined) leadCounts[e.status] += 1; });

  const followups = events
    .filter(e => ['hot', 'warm'].includes(e.status) && e.followupsCompleted < e.followupsTotal)
    .slice(0, 3);

  const upcoming = events
    .filter(e => ['confirmed', 'pencil'].includes(e.status))
    .slice(0, 3);

  const overdue = [];
  payments.forEach(p => {
    ['downpayment', 'balance'].forEach(field => {
      if (p[field]?.status === 'overdue') {
        overdue.push({ client: p.clientName, amount: formatCurrency(p[field].amount), daysOverdue: daysOverdue(p[field].dueDate) });
      }
    });
  });

  return (
    <div className="app-shell">
      <Sidebar role="ae" />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Good morning, {currentUserName()}.</h1>
            <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginTop: 4 }}>
              Here's your overview for today — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Inquiry
          </button>
        </div>

        {loading && <p style={{ color: 'var(--color-text-sub)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--terracotta)' }}>{error}</p>}

        {!loading && !error && (
          <>
            {/* Lead counts */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: 480, marginBottom: 28 }}>
              {Object.entries(leadCounts).map(([status, count]) => (
                <Card key={status} accent={status === 'hot' ? 'terracotta' : status === 'warm' ? 'gold' : 'navy'}>
                  <div style={{ fontSize: 32, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)' }}>{count}</div>
                  <Badge variant={status} />
                  <div style={{ fontSize: 11, color: 'var(--color-text-sub)', marginTop: 4 }}>leads</div>
                </Card>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
              {/* Follow-ups due today */}
              <Card title="Follow-ups Due Today" accent="gold">
                {followups.length === 0 && <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No follow-ups due.</p>}
                {followups.map((f, i) => (
                  <div key={f._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < followups.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{f.clientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>{f.eventType} · {formatDate(f.eventDate)}</div>
                    </div>
                    <Badge variant={f.status} />
                  </div>
                ))}
              </Card>

              {/* Upcoming bookings */}
              <Card title="Upcoming Bookings This Week" accent="sage">
                {upcoming.length === 0 && <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No upcoming bookings.</p>}
                {upcoming.map((b, i) => (
                  <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < upcoming.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{b.clientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>{formatDate(b.eventDate)} · {b.venue}</div>
                    </div>
                    <Badge variant={b.status} />
                  </div>
                ))}
              </Card>
            </div>

            {/* Overdue payments */}
            <Card title="Overdue Payment Alerts" accent="terracotta">
              {overdue.length === 0 ? (
                <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No overdue payments.</p>
              ) : (
                overdue.map((o, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < overdue.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{o.client}</div>
                      <div style={{ fontSize: 11, color: 'var(--terracotta)' }}>{o.daysOverdue} days overdue</div>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--terracotta)' }}>{o.amount}</span>
                  </div>
                ))
              )}
            </Card>
          </>
        )}

        {showModal && <InquiryModal onClose={() => setShowModal(false)} onSaved={load} />}
      </main>
    </div>
  );
}
