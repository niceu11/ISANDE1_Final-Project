import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import Badge from '../../components/Badge';
import InquiryModal from './InquiryModal';
import { api, formatDate, buildFollowUpMessage, openSmsComposer } from '../../api/client';
import { usePolling } from '../../hooks/usePolling';
import { getCurrentUser } from '../../components/RequireAuth';

export default function Inquiries() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter]     = useState('all');
  const [showModal, setShowModal]       = useState(false);
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    api.getEvents()
      .then(data => {
        setEvents(prev => {
          if (!silent || !editingId) return data;
          // Don't clobber a quick-note the user is actively typing during a background poll.
          return data.map(e => {
            if (e._id !== editingId) return e;
            const existing = prev.find(p => p._id === editingId);
            return existing ? { ...e, quickNote: existing.quickNote } : e;
          });
        });
        setError('');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  usePolling(() => load(true));

  const setNote = (id, value) =>
    setEvents(rows => rows.map(r => (r._id === id ? { ...r, quickNote: value } : r)));

  const saveNote = (id, value) => {
    api.updateQuickNote(id, value).catch(err => setError(err.message));
  };

  const user = getCurrentUser();
  const handleTextFollowUp = async (row) => {
    if (!row.contact) {
      alert(`No phone number on file for ${row.clientName}.`);
      return;
    }
    openSmsComposer(row.contact, buildFollowUpMessage(row, user?.name));
    try {
      await api.logFollowUp(row._id, 'sms', user?.name, user?.role);
      load(true);
    } catch {
      // SMS composer already opened; logging failure isn't worth blocking the user over.
    }
  };

  const filtered = events.filter(i => statusFilter === 'all' || i.status === statusFilter);

  return (
    <AppLayout role="ae">
        <div className="page-header">
          <h1 className="page-title">Inquiry Management</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add inquiry
          </button>
        </div>

        <div className="filters-row">
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Filter: All Statuses</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
          <select className="filter-select" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
            <option value="all">Filter: All Dates</option>
            <option value="thisMonth">This Month</option>
            <option value="nextMonth">Next Month</option>
            <option value="thisYear">This Year</option>
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
                <th>Last Activity</th>
                <th>Follow-ups</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row._id}>
                  <td style={{ fontWeight: 500 }}>{row.clientName}</td>
                  <td>{formatDate(row.eventDate)}</td>
                  <td><Badge variant={row.status} /></td>
                  <td style={{ color: 'var(--color-text-sub)' }}>{formatDate(row.lastActivityAt, { month: 'short', day: 'numeric' })}</td>
                  <td>{row.followupsCompleted} of {row.followupsTotal}</td>
                  <td>
                    <input
                      className="form-input"
                      style={{ padding: '5px 8px', fontSize: 12, minWidth: 140 }}
                      placeholder="Add note..."
                      value={row.quickNote ?? ''}
                      onFocus={() => setEditingId(row._id)}
                      onChange={e => setNote(row._id, e.target.value)}
                      onBlur={e => { saveNote(row._id, e.target.value); setEditingId(null); }}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}
                        onClick={() => navigate(`/ae/clients/${row._id}`)}>
                        View
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}
                        onClick={() => handleTextFollowUp(row)}
                        title={`Send SMS to ${row.clientName} privately (not via Messenger/social)`}>
                        SMS
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-sub)', padding: 32 }}>No inquiries found.</td></tr>
              )}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: 20, display: 'flex', gap: 24 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}><Badge variant="hot" /> Serious lead — act today</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}><Badge variant="warm" /> Engaged — needs follow-up</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}><Badge variant="cold" /> Unresponsive after 3 follow-ups</span>
        </div>

        {showModal && <InquiryModal onClose={() => setShowModal(false)} onSaved={load} />}
    </AppLayout>
  );
}
