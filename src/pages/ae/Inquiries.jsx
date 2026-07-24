import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Badge from '../../components/Badge';
import InquiryModal from './InquiryModal';

const INQUIRIES = [
  { id: 1, client: 'Santos Family',    date: 'Aug 12, 2026', status: 'hot',  lastActivity: '2 days ago', followups: '1 of 3' },
  { id: 2, client: 'Rivera, Andrea',   date: 'Sep 03, 2026', status: 'warm', lastActivity: '5 days ago', followups: '2 of 3' },
  { id: 3, client: 'Lim & Co.',        date: 'Oct 15, 2026', status: 'cold', lastActivity: '9 days ago', followups: '3 of 3' },
  { id: 4, client: 'Cruz, Maria',      date: 'Nov 20, 2026', status: 'warm', lastActivity: '1 day ago',  followups: '0 of 3' },
  { id: 5, client: 'Tan Wedding',      date: 'Dec 05, 2026', status: 'hot',  lastActivity: 'Today',      followups: '1 of 3' },
  { id: 6, client: 'Garcia Debut',     date: 'Jan 10, 2027', status: 'warm', lastActivity: '3 days ago', followups: '2 of 3' },
  { id: 7, client: 'Reyes, Carla',     date: '—',            status: 'cold', lastActivity: '14 days ago',followups: '3 of 3' },
];

export default function Inquiries() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter]     = useState('all');
  const [showModal, setShowModal]       = useState(false);
  const navigate = useNavigate();

  const filtered = INQUIRIES.filter(i => statusFilter === 'all' || i.status === statusFilter);

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
              <tr key={row.id}>
                <td style={{ fontWeight: 500 }}>{row.client}</td>
                <td>{row.date}</td>
                <td><Badge variant={row.status} /></td>
                <td style={{ color: 'var(--color-text-sub)' }}>{row.lastActivity}</td>
                <td>{row.followups}</td>
                <td>
                  <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}
                    onClick={() => navigate(`/ae/clients/${row.id}`)}>
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

        <div style={{ marginTop: 20, display: 'flex', gap: 24 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}><Badge variant="hot" /> Serious lead — act today</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}><Badge variant="warm" /> Engaged — needs follow-up</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}><Badge variant="cold" /> Unresponsive after 3 follow-ups</span>
        </div>

        {showModal && <InquiryModal onClose={() => setShowModal(false)} />}
      </main>
    </div>
  );
}
