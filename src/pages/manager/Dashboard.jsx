import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Calendar from '../../components/Calendar';
import { api, formatCurrency, formatDate, daysOverdue } from '../../api/client';

function currentUserName() {
  try {
    return JSON.parse(localStorage.getItem('soiree-user'))?.name?.split(' ').pop() ?? 'there';
  } catch {
    return 'there';
  }
}

export default function ManagerDashboard() {
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

  const handleVerify = async (eventId, field) => {
    try {
      await api.verifyPayment(eventId, field);
      load();
    } catch (err) {
      alert(err.message || 'Could not verify payment');
    }
  };

  const calendarEvents = events
    .filter(e => ['confirmed', 'pencil'].includes(e.status) && e.eventDate)
    .map(e => ({ date: e.eventDate, status: e.status }));

  const pendingVerifications = [];
  payments.forEach(p => {
    ['downpayment', 'balance'].forEach(field => {
      if (p[field]?.status === 'pending' && p[field]?.proofUploaded) {
        pendingVerifications.push({
          eventId: p.eventId, client: p.clientName,
          label: field === 'downpayment' ? 'Downpayment' : 'Balance',
          amount: formatCurrency(p[field].amount),
          field,
        });
      }
    });
  });

  const overdue = [];
  payments.forEach(p => {
    ['downpayment', 'balance'].forEach(field => {
      if (p[field]?.status === 'overdue') {
        overdue.push({
          client: p.clientName,
          amount: formatCurrency(p[field].amount),
          daysOverdue: daysOverdue(p[field].dueDate),
          event: formatDate(p.eventDate),
        });
      }
    });
  });

  return (
    <div className="app-shell">
      <Sidebar role="manager" />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Good morning, {currentUserName()}.</h1>
            <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginTop: 4 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {loading && <p style={{ color: 'var(--color-text-sub)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--terracotta)' }}>{error}</p>}

        {!loading && !error && (
          <>
            {/* Calendar hero */}
            <div style={{ marginBottom: 28 }}>
              <Calendar events={calendarEvents} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Pending verifications */}
              <Card title="Pending Payment Verification" subtitle={`${pendingVerifications.length} awaiting review`} accent="gold">
                {pendingVerifications.length === 0 && <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>Nothing awaiting review.</p>}
                {pendingVerifications.map((p, i) => (
                  <div key={`${p.eventId}-${p.field}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < pendingVerifications.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{p.client}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>{p.label} · {p.amount}</div>
                    </div>
                    <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}
                      onClick={() => handleVerify(p.eventId, p.field)}>
                      Verify
                    </button>
                  </div>
                ))}
              </Card>

              {/* Overdue payments */}
              <Card title="Overdue Payments" subtitle={`${overdue.length} clients past due`} accent="terracotta">
                {overdue.length === 0 && <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No overdue payments.</p>}
                {overdue.map((o, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < overdue.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{o.client}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>Event: {o.event}</div>
                      <Badge variant="overdue" label={`${o.daysOverdue} days overdue`} />
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--terracotta)', fontSize: 14 }}>{o.amount}</span>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
