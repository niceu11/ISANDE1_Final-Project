import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { getCurrentUser } from '../components/RequireAuth';
import { api } from '../api/client';
import { usePolling } from '../hooks/usePolling';

const ACTION_LABEL = {
  'event.created': 'Inquiry Logged',
  'event.status_changed': 'Status Changed',
  'event.date_set': 'Event Date Updated',
  'event.package_sent': 'Package Sent',
  'followup.sent': 'Follow-Up Sent',
  'supplier.added': 'Supplier Added',
  'supplier.status_changed': 'Supplier Status Changed',
  'supplier.alternate_promoted': 'Alternate Supplier Promoted',
  'payment.proof_uploaded': 'Proof of Payment Uploaded',
  'payment.verified': 'Payment Verified',
};

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Filter: All Activity' },
  { value: 'payment', label: 'Payments' },
  { value: 'event.status_changed', label: 'Status Changes' },
  { value: 'event.date_set', label: 'Date Changes' },
  { value: 'followup.sent', label: 'Follow-Ups' },
  { value: 'supplier', label: 'Suppliers' },
];

function matchesCategory(action, category) {
  if (category === 'all') return true;
  if (category === 'payment') return action.startsWith('payment.');
  if (category === 'supplier') return action.startsWith('supplier.');
  return action === category;
}

function formatTimestamp(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function History() {
  const role = getCurrentUser()?.role ?? 'manager';
  const [logs, setLogs] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    api.getAuditLogs()
      .then(data => { setLogs(data); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  usePolling(() => load(true));

  const filtered = logs.filter(l => matchesCategory(l.action, category));

  return (
    <AppLayout role={role}>
      <div className="page-header">
        <div>
          <h1 className="page-title">History</h1>
          <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginTop: 4 }}>
            Who did what, and when — verifications, status changes, follow-ups, and supplier updates across the system.
          </p>
        </div>
      </div>

      <div className="filters-row">
        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading && <p style={{ color: 'var(--color-text-sub)' }}>Loading…</p>}
      {error && <p style={{ color: 'var(--terracotta-text)' }}>{error}</p>}

      {!loading && !error && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Client / Event</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log._id}>
                <td style={{ color: 'var(--color-text-sub)', whiteSpace: 'nowrap' }}>{formatTimestamp(log.createdAt)}</td>
                <td style={{ fontWeight: 500 }}>
                  {log.actorName || 'System'}
                  {log.actorRole && <span style={{ color: 'var(--color-text-sub)', fontWeight: 400 }}> ({log.actorRole})</span>}
                </td>
                <td>{ACTION_LABEL[log.action] ?? log.action}</td>
                <td>{log.entityLabel || '—'}</td>
                <td style={{ color: 'var(--color-text-sub)' }}>{log.detail}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-sub)', padding: 32 }}>No activity recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </AppLayout>
  );
}
