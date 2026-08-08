import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { api, formatCurrency, formatDate } from '../../api/client';
import { getCurrentUser } from '../../components/RequireAuth';

function TrancheProof({ tranche, field, uploading, onUpload }) {
  const inputRef = useRef(null);

  if (tranche.status === 'verified') {
    return (
      <div className="proof-status proof-status-verified">
        ✓ Proof of payment uploaded{tranche.proofFileName ? ` — ${tranche.proofFileName}` : ''}
      </div>
    );
  }

  if (tranche.proofUploaded) {
    return (
      <div className="proof-status proof-status-pending">
        <span>📎 {tranche.proofFileName || 'proof-of-payment'} — awaiting verification</span>
        {tranche.proofUploadedAt && (
          <span className="proof-status-meta">Submitted {formatDate(tranche.proofUploadedAt, { month: 'short', day: 'numeric' })}</span>
        )}
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onUpload(field, file.name);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        className="upload-dropzone"
        onClick={() => inputRef.current?.click()}
        disabled={uploading === field}
      >
        <span className="upload-dropzone-icon">⬆</span>
        <span>{uploading === field ? 'Uploading…' : 'Upload Proof of Payment'}</span>
        <span className="upload-dropzone-hint">Click to choose an image or PDF</span>
      </button>
    </>
  );
}

export default function PaymentTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(null);

  const load = () => {
    setLoading(true);
    const promise = id ? api.getPaymentByEvent(id) : api.getFeaturedPayment();
    promise
      .then(pay => { setData(pay); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleUpload = async (field, fileName) => {
    setUploading(field);
    try {
      const user = getCurrentUser();
      const updated = await api.uploadProof(data.eventId, field, fileName, user?.name, user?.role);
      setData(updated);
    } catch (err) {
      alert(err.message || 'Could not upload proof of payment');
    } finally {
      setUploading(null);
    }
  };

  return (
    <AppLayout role="ae">
        {loading && <p style={{ color: 'var(--color-text-sub)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--terracotta-text)' }}>{error}</p>}

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
                AE — Verification requires a Manager
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
                <div style={{ marginTop: 14 }}>
                  <TrancheProof tranche={data.downpayment} field="downpayment" uploading={uploading} onUpload={handleUpload} />
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
                <div style={{ marginTop: 14 }}>
                  <TrancheProof tranche={data.balance} field="balance" uploading={uploading} onUpload={handleUpload} />
                </div>
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
