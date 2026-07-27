import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { api, formatCurrency, formatDate } from '../../api/client';

export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const eventPromise = id ? api.getEvent(id) : api.getFeaturedEvent();
    eventPromise
      .then(async (event) => {
        setClient(event);
        setError('');
        try {
          const pay = await api.getPaymentByEvent(event._id);
          setPayment(pay);
        } catch {
          setPayment(null);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AppLayout role="ae">
        {loading && <p style={{ color: 'var(--color-text-sub)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--terracotta)' }}>{error}</p>}

        {!loading && !error && client && (
          <>
            <div className="page-header">
              <div>
                <button onClick={() => navigate('/ae/inquiries')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-sub)', fontSize: 13, cursor: 'pointer', marginBottom: 6, padding: 0 }}>
                  ← Back to Inquiries
                </button>
                <h1 className="page-title">{client.clientName}</h1>
              </div>
              <Badge variant={client.contractStatus === 'signed' ? 'confirmed' : 'pending'}
                label={client.contractStatus === 'signed' ? 'Contract Signed' : 'Contract Pending'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              {/* Contact info */}
              <Card title="Contact Information" accent="navy">
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['Phone', client.contact],
                      ['Email', client.email],
                      ['Event Date', formatDate(client.eventDate)],
                      ['Event Type', client.eventType],
                      ['Venue', client.venue],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={{ padding: '8px 0', color: 'var(--color-text-sub)', width: 110, fontWeight: 500 }}>{label}</td>
                        <td style={{ padding: '8px 0' }}>{value || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              {/* Payment history (read-only) */}
              <Card title="Payment History" subtitle="Read-only — manage via Payments tab" accent="gold">
                {!payment && <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No payments recorded yet.</p>}
                {payment && [
                  { label: 'Downpayment', ...payment.downpayment },
                  { label: 'Balance', ...payment.balance },
                ].map((p, i, arr) => (
                  <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>Due {formatDate(p.dueDate)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{formatCurrency(p.amount)}</div>
                      <Badge variant={p.status} />
                    </div>
                  </div>
                ))}
                {payment && (
                  <button className="btn btn-secondary" style={{ marginTop: 14, fontSize: 12, width: '100%', justifyContent: 'center' }}
                    onClick={() => navigate(`/ae/payments/${client._id}`)}>
                    View Full Payment Tracker
                  </button>
                )}
              </Card>
            </div>

            {/* Notes log */}
            <Card title="Notes Log" accent="sage">
              {client.notes.length === 0 && <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No notes yet.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {client.notes.map((note, i) => (
                  <div key={i} style={{ paddingBottom: 16, borderBottom: i < client.notes.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{note.author}</span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>{formatDate(note.date)}</span>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.6 }}>{note.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
    </AppLayout>
  );
}
