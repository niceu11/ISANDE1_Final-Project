import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { api, formatCurrency, formatDate } from '../../api/client';

export default function PaymentTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const promise = id ? api.getPaymentByEvent(id) : api.getFeaturedPayment();
    promise
      .then(pay => { setData(pay); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AppLayout role="ae">
        {loading && <p style={{ color: 'var(--color-text-sub)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--terracotta)' }}>{error}</p>}

        {!loading && !error && data && (
          <>
            <div className="page-header">
              <div>
                <button onClick={() => navigate(`/ae/clients/${data.eventId}`)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-sub)', fontSize: 13, cursor: 'pointer', marginBottom: 6, padding: 0 }}>
                  ← Back to Client Profile
                </button>
                <h1 className="page-title">Payment Tracker</h1>
                <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginTop: 4 }}>
                  {data.clientName} · {formatDate(data.eventDate)} · Total: <strong>{formatCurrency(data.totalAmount)}</strong>
                </p>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-sub)', background: 'var(--champagne)', padding: '6px 14px', borderRadius: 20 }}>
                AE Read-Only View
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <Card title="Downpayment" accent={data.downpayment.status === 'verified' ? 'sage' : 'terracotta'}>
                <div style={{ fontSize: 36, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
                  {formatCurrency(data.downpayment.amount)}
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Badge variant={data.downpayment.status} />
                  <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>Due {formatDate(data.downpayment.dueDate)}</span>
                </div>
                <div style={{ marginTop: 14, fontSize: 12, color: data.downpayment.proofUploaded ? 'var(--sage)' : 'var(--terracotta)' }}>
                  {data.downpayment.proofUploaded ? '✓ Proof of payment uploaded' : '⚠ No proof uploaded yet'}
                </div>
              </Card>

              <Card title="Remaining Balance" accent={data.balance.status === 'overdue' ? 'terracotta' : 'gold'}>
                <div style={{ fontSize: 36, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
                  {formatCurrency(data.balance.amount)}
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Badge variant={data.balance.status} />
                  <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>Due {formatDate(data.balance.dueDate)}</span>
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
                      <td>{formatDate(h.date)}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(h.amount)}</td>
                      <td><Badge variant={h.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        )}
    </AppLayout>
  );
}
