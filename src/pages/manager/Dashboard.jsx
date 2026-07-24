import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Calendar from '../../components/Calendar';

const EVENTS = [
  { date: '2026-07-26', status: 'confirmed' },
  { date: '2026-07-28', status: 'pencil' },
  { date: '2026-07-30', status: 'confirmed' },
  { date: '2026-08-12', status: 'confirmed' },
];

const PENDING_VERIFICATIONS = [
  { client: 'Santos Family',  label: 'Second Payment', amount: '₱25,000', submitted: 'Jul 18, 2026' },
  { client: 'Tan Wedding',    label: 'Downpayment',    amount: '₱40,000', submitted: 'Jul 17, 2026' },
  { client: 'Cruz, Maria',    label: 'Balance',        amount: '₱90,000', submitted: 'Jul 16, 2026' },
];

const OVERDUE = [
  { client: 'Santos Family', amount: '₱25,000', daysOverdue: 5,  event: 'Aug 12, 2026' },
  { client: 'Tan Wedding',   amount: '₱18,500', daysOverdue: 12, event: 'Dec 05, 2026' },
  { client: 'Lim & Co.',     amount: '₱60,000', daysOverdue: 20, event: 'Oct 15, 2026' },
];

export default function ManagerDashboard() {
  const handleVerify = (client) => alert(`Payment for ${client} marked as Verified.`);

  return (
    <div className="app-shell">
      <Sidebar role="manager" />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Good morning, Christine.</h1>
            <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginTop: 4 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Calendar hero */}
        <div style={{ marginBottom: 28 }}>
          <Calendar events={EVENTS} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Pending verifications */}
          <Card title="Pending Payment Verification" subtitle={`${PENDING_VERIFICATIONS.length} awaiting review`} accent="gold">
            {PENDING_VERIFICATIONS.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < PENDING_VERIFICATIONS.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{p.client}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>{p.label} · {p.amount}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>Submitted {p.submitted}</div>
                </div>
                <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}
                  onClick={() => handleVerify(p.client)}>
                  Verify
                </button>
              </div>
            ))}
          </Card>

          {/* Overdue payments */}
          <Card title="Overdue Payments" subtitle={`${OVERDUE.length} clients past due`} accent="terracotta">
            {OVERDUE.map((o, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < OVERDUE.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
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
      </main>
    </div>
  );
}
