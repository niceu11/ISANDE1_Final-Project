import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import Badge from '../../components/Badge';
import { api, formatDate } from '../../api/client';
import { usePolling } from '../../hooks/usePolling';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Filter: All Statuses' },
  { value: 'confirmed', label: 'Confirmed — awaiting event day' },
  { value: 'pencil', label: 'Pencil-booked' },
  { value: 'hot', label: 'Hot' },
  { value: 'warm', label: 'Warm' },
  { value: 'cold', label: 'Cold' },
];

export default function ClientsList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    api.getEvents()
      .then(data => { setEvents(data); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  usePolling(() => load(true));

  const filtered = events
    .filter(e => statusFilter === 'all' || e.status === statusFilter)
    .slice()
    .sort((a, b) => {
      if (!a.eventDate) return 1;
      if (!b.eventDate) return -1;
      return new Date(a.eventDate) - new Date(b.eventDate);
    });

  const confirmedUpcoming = events.filter(e => e.status === 'confirmed' && e.eventDate && new Date(e.eventDate) >= new Date()).length;

  return (
    <AppLayout role="ae">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginTop: 4 }}>
            {events.length} tracked clients · {confirmedUpcoming} confirmed and awaiting event day
          </p>
        </div>
      </div>

      <div className="filters-row">
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUS_OPTIONS.map(opt => (
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
              <th>Client Name</th>
              <th>Event Date</th>
              <th>Status</th>
              <th>Contract</th>
              <th>Venue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row._id}>
                <td style={{ fontWeight: 500 }}>{row.clientName}</td>
                <td>{formatDate(row.eventDate)}</td>
                <td><Badge variant={row.status} /></td>
                <td>
                  <Badge
                    variant={row.contractStatus === 'signed' ? 'confirmed' : 'pending'}
                    label={row.contractStatus === 'signed' ? 'Signed' : 'Pending'}
                  />
                </td>
                <td style={{ color: 'var(--color-text-sub)' }}>{row.venue || '—'}</td>
                <td>
                  <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}
                    onClick={() => navigate(`/ae/clients/${row._id}`)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-sub)', padding: 32 }}>No clients found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </AppLayout>
  );
}
