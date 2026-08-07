import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import InquiryModal from './InquiryModal';
import DashboardSkeleton from '../../components/Skeleton';
import { api, formatCurrency, formatDate, daysOverdue, buildFollowUpMessage, openSmsComposer } from '../../api/client';
import { usePolling } from '../../hooks/usePolling';
import { getCurrentUser } from '../../components/RequireAuth';

function currentUserName() {
  return getCurrentUser()?.name?.split(' ').pop() ?? 'there';
}

export default function AEDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    Promise.all([api.getEvents(), api.getPayments()])
      .then(([ev, pay]) => { setEvents(ev); setPayments(pay); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  usePolling(() => load(true));

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

  const user = getCurrentUser();
  const handleTextFollowUp = async (event) => {
    if (!event.contact) {
      alert(`No phone number on file for ${event.clientName}.`);
      return;
    }
    openSmsComposer(event.contact, buildFollowUpMessage(event, user?.name));
    try {
      await api.logFollowUp(event._id, 'sms', user?.name, user?.role);
      load(true);
    } catch {
      // SMS composer already opened; logging failure isn't worth blocking the user over.
    }
  };

  return (
    <AppLayout role="ae">
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

        {loading && <DashboardSkeleton />}
        {error && <p style={{ color: 'var(--terracotta-text)' }}>{error}</p>}

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge variant={f.status} />
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => handleTextFollowUp(f)}
                        title={`Send SMS to ${f.clientName} privately (not via Messenger/social)`}
                      >
                        SMS
                      </button>
                    </div>
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
            <Card
              title="Overdue Payment Alerts"
              accent="terracotta"
              urgent={overdue.length > 0}
              badge={overdue.length > 0 ? overdue.length : null}
            >
              {overdue.length === 0 ? (
                <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No overdue payments — nothing to chase today.</p>
              ) : (
                overdue.map((o, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < overdue.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{o.client}</div>
                      <div style={{ fontSize: 11, color: 'var(--terracotta-text)' }}>{o.daysOverdue} days overdue</div>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--terracotta-text)' }}>{o.amount}</span>
                  </div>
                ))
              )}
            </Card>
          </>
        )}

        {showModal && <InquiryModal onClose={() => setShowModal(false)} onSaved={load} />}
    </AppLayout>
  );
}
