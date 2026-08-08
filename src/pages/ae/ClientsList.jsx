import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import Badge from '../../components/Badge';
import Toast from '../../components/Toast';
import { api, formatDate } from '../../api/client';
import { usePolling } from '../../hooks/usePolling';
import { getCurrentUser } from '../../components/RequireAuth';
import { generateClientsPdf } from '../../pdf/generateClientsPdf';
import { csvToClientRows, downloadClientImportTemplate } from '../../utils/csv';

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
  const fileInputRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    api.getEvents()
      .then(data => { setEvents(data); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  usePolling(() => load(true));

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 4000);
  };

  const handleExportPdf = () => {
    generateClientsPdf(events, getCurrentUser()?.name);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const rows = csvToClientRows(text);
      if (rows.length === 0) {
        showToast('No rows found in that file — check it matches the template format.', 'error');
        return;
      }
      const result = await api.importClients(rows);
      load();
      showToast(`Imported ${result.imported} client${result.imported === 1 ? '' : 's'}${result.skipped ? ` — skipped ${result.skipped} row${result.skipped === 1 ? '' : 's'} missing a Client Name` : ''}.`);
    } catch (err) {
      showToast(err.message || 'Import failed.', 'error');
    } finally {
      setImporting(false);
    }
  };

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
        <div style={{ display: 'flex', gap: 8 }}>
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportFile} />
          <button className="btn btn-secondary" style={{ fontSize: 12.5 }} onClick={downloadClientImportTemplate}>
            Download Template
          </button>
          <button className="btn btn-secondary" style={{ fontSize: 12.5 }} onClick={handleImportClick} disabled={importing}>
            {importing ? 'Importing…' : 'Import Clients (CSV)'}
          </button>
          <button className="btn btn-primary" style={{ fontSize: 12.5 }} onClick={handleExportPdf} disabled={events.length === 0}>
            Export PDF
          </button>
        </div>
      </div>

      <div className="filters-row">
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span style={{ fontSize: 11.5, color: 'var(--color-text-sub)' }}>
          Import expects: {['Client Name', 'Contact', 'Email', 'Event Date', 'Event Type', 'Venue', 'Guest Count', 'Status', 'Contract Status'].join(', ')} — download the template for the exact format.
        </span>
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

      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </AppLayout>
  );
}
