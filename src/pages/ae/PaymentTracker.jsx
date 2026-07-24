import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

const PAYMENTS = {
  1: {
    client: 'Santos Family',
    eventDate: 'Aug 12, 2026',
    totalAmount: '₱200,000',
    downpayment: { amount: '₱50,000', due: 'Jun 30, 2026', status: 'verified', proofUploaded: true },
    balance:     { amount: '₱150,000', due: 'Aug 10, 2026', status: 'pending',  proofUploaded: false },
    history: [
      { label: 'Downpayment received',  date: 'Jun 30, 2026', amount: '₱50,000', status: 'verified' },
      { label: 'Second payment overdue',date: 'Jul 15, 2026', amount: '₱25,000', status: 'overdue' },
    ],
  },
  2: {
    client: 'Rivera, Andrea',
    eventDate: 'Sep 03, 2026',
    totalAmount: '₱100,000',
    downpayment: { amount: '₱30,000', due: 'Jul 01, 2026', status: 'verified', proofUploaded: true },
    balance:     { amount: '₱70,000', due: 'Sep 01, 2026', status: 'pending',  proofUploaded: false },
    history: [
      { label: 'Downpayment received', date: 'Jul 01, 2026', amount: '₱30,000', status: 'verified' },
    ],
  },
};

export default function PaymentTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = PAYMENTS[id] ?? PAYMENTS[1];

  return (
    <div className="app-shell">
      <Sidebar role="ae" />
      <main className="main-content">
        <div className="page-header">
          <div>
            <button onClick={() => navigate(`/ae/clients/${id}`)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-sub)', fontSize: 13, cursor: 'pointer', marginBottom: 6, padding: 0 }}>
              ← Back to Client Profile
            </button>
            <h1 className="page-title">Payment Tracker</h1>
            <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginTop: 4 }}>
              {data.client} · {data.eventDate} · Total: <strong>{data.totalAmount}</strong>
            </p>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-sub)', background: 'var(--champagne)', padding: '6px 14px', borderRadius: 20 }}>
            AE Read-Only View
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <Card title="Downpayment" accent={data.downpayment.status === 'verified' ? 'sage' : 'terracotta'}>
            <div style={{ fontSize: 36, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
              {data.downpayment.amount}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Badge variant={data.downpayment.status} />
              <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>Due {data.downpayment.due}</span>
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: data.downpayment.proofUploaded ? 'var(--sage)' : 'var(--terracotta)' }}>
              {data.downpayment.proofUploaded ? '✓ Proof of payment uploaded' : '⚠ No proof uploaded yet'}
            </div>
          </Card>

          <Card title="Remaining Balance" accent={data.balance.status === 'overdue' ? 'terracotta' : 'gold'}>
            <div style={{ fontSize: 36, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
              {data.balance.amount}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Badge variant={data.balance.status} />
              <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>Due {data.balance.due}</span>
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: data.balance.proofUploaded ? 'var(--sage)' : 'var(--color-text-sub)' }}>
              {data.balance.proofUploaded ? '✓ Proof of payment uploaded' : 'Awaiting payment'}
            </div>
            <button className="btn btn-secondary" style={{ marginTop: 14, fontSize: 12, width: '100%', justifyContent: 'center' }}>
              Upload Proof of Payment
            </button>
          </Card>
        </div>

        <Card title="Payment History" accent="navy">
          <table className="data-table" style={{ boxShadow: 'none', border: 'none' }}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.history.map((h, i) => (
                <tr key={i}>
                  <td>{h.label}</td>
                  <td>{h.date}</td>
                  <td style={{ fontWeight: 600 }}>{h.amount}</td>
                  <td><Badge variant={h.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
}
