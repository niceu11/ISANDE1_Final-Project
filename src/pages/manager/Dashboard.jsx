import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Calendar from '../../components/Calendar';
import DashboardSkeleton from '../../components/Skeleton';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';
import { getCurrentUser } from '../../components/RequireAuth';
import { api, formatCurrency, formatDate, daysOverdue } from '../../api/client';
import { usePolling } from '../../hooks/usePolling';

function currentUserName() {
  return getCurrentUser()?.name?.split(' ').pop() ?? 'there';
}

export default function ManagerDashboard() {
  const user = getCurrentUser();
  const [events, setEvents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingVerify, setPendingVerify] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [toast, setToast] = useState(null);

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    Promise.all([api.getEvents(), api.getPayments(), api.getCalendarNotes()])
      .then(([ev, pay, calendarNotes]) => { setEvents(ev); setPayments(pay); setNotes(calendarNotes); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  usePolling(() => load(true));

  const requestVerify = (p) => setPendingVerify(p);

  const confirmVerify = async () => {
    if (!pendingVerify) return;
    setVerifying(true);
    try {
      await api.verifyPayment(pendingVerify.eventId, pendingVerify.field, user?.name, user?.role);
      load();
      setToast(`Verified: ${pendingVerify.label} for ${pendingVerify.client} (${pendingVerify.amount})`);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      alert(err.message || 'Could not verify payment');
    } finally {
      setVerifying(false);
      setPendingVerify(null);
    }
  };

  const handleAddNote = async (date, text, type) => {
    await api.createCalendarNote({
      date,
      text,
      type,
      createdBy: user?.name ?? '',
      createdByRole: 'manager',
    });
    load(true);
  };

  const calendarEvents = events
    .filter(e => ['confirmed', 'pencil'].includes(e.status) && e.eventDate)
    .map(e => ({ id: e._id, date: e.eventDate, status: e.status, clientName: e.clientName, venue: e.venue }));

  const pendingVerifications = [];
  payments.forEach(p => {
    ['downpayment', 'balance'].forEach(field => {
      if (p[field]?.status === 'pending' && p[field]?.proofUploaded) {
        pendingVerifications.push({
          eventId: p.eventId, client: p.clientName,
          label: field === 'downpayment' ? 'Downpayment' : 'Balance',
          amount: formatCurrency(p[field].amount),
          proofFileName: p[field].proofFileName,
          proofUploadedAt: p[field].proofUploadedAt,
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
    <AppLayout role="manager">
        <div className="page-header">
          <div>
            <h1 className="page-title">Good morning, {currentUserName()}.</h1>
            <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginTop: 4 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {loading && <DashboardSkeleton statCount={0} showHero />}
        {error && <p style={{ color: 'var(--terracotta-text)' }}>{error}</p>}

        {!loading && !error && (
          <>
            {/* Calendar hero */}
            <div style={{ marginBottom: 28 }}>
              <Calendar events={calendarEvents} notes={notes} onAddNote={handleAddNote} role="manager" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Pending verifications */}
              <Card
                title="Pending Payment Verification"
                subtitle={`${pendingVerifications.length} awaiting review`}
                accent="gold"
                urgent={pendingVerifications.length > 0}
                badge={pendingVerifications.length > 0 ? pendingVerifications.length : null}
              >
                {pendingVerifications.length === 0 && <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>Nothing awaiting review.</p>}
                {pendingVerifications.map((p, i) => (
                  <div key={`${p.eventId}-${p.field}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < pendingVerifications.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{p.client}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>{p.label} · {p.amount}</div>
                      <div className="proof-status proof-status-pending" style={{ marginTop: 6, padding: '6px 10px' }}>
                        <span>📎 {p.proofFileName || 'proof-of-payment'}</span>
                        {p.proofUploadedAt && (
                          <span className="proof-status-meta">Submitted {formatDate(p.proofUploadedAt, { month: 'short', day: 'numeric' })}</span>
                        )}
                      </div>
                    </div>
                    <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}
                      onClick={() => requestVerify(p)}>
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
                    <span style={{ fontWeight: 700, color: 'var(--terracotta-text)', fontSize: 14 }}>{o.amount}</span>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}

        {pendingVerify && (
          <ConfirmDialog
            title="Verify this payment?"
            message={`${pendingVerify.client}'s ${pendingVerify.label.toLowerCase()} of ${pendingVerify.amount} — proof submitted: "${pendingVerify.proofFileName || 'proof-of-payment'}"${pendingVerify.proofUploadedAt ? ` on ${formatDate(pendingVerify.proofUploadedAt, { month: 'short', day: 'numeric' })}` : ''}. Confirm you've checked this against the bank record. This marks it as verified and can't be undone from here.`}
            confirmLabel="Verify Payment"
            busy={verifying}
            onConfirm={confirmVerify}
            onCancel={() => setPendingVerify(null)}
          />
        )}

        {toast && <Toast message={toast} />}
    </AppLayout>
  );
}
