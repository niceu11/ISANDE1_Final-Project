import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Badge from '../../components/Badge';
import InquiryModal from './InquiryModal';
import { api, formatDate } from '../../api/client';

export default function Inquiries() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter]     = useState('all');
  const [showModal, setShowModal]       = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api.getEvents()
      .then(data => { setEvents(data); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = events.filter(i => statusFilter === 'all' || i.status === statusFilter);

  return (
    <div className="app-shell">
      <Sidebar role="ae" />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Inquiries</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Inquiry
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
        {error && <p style={{ color: 'var(--terracotta)' }}>{error}</p>}

        {!loading && !error && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Event Date</th>
                <th>Status</th>
                <th>Last Activity</th>
                <th>Follow-ups</th>
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
                    <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}
                      onClick={() => navigate(`/ae/clients/${row._id}`)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-sub)', padding: 32 }}>No inquiries found.</td></tr>
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
      </main>
    </div>
  );
}
