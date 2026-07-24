import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import InquiryModal from './InquiryModal';

const FOLLOWUPS = [
  { client: 'Santos Family',    event: 'Wedding Reception',  date: 'Aug 12, 2026', status: 'hot' },
  { client: 'Rivera, Andrea',   event: 'Debut – 18th',       date: 'Sep 03, 2026', status: 'warm' },
  { client: 'Lim & Co.',        event: 'Corporate Dinner',   date: 'Oct 15, 2026', status: 'warm' },
];

const LEAD_COUNTS = { hot: 4, warm: 9, cold: 3 };

const UPCOMING = [
  { client: 'Reyes Wedding',    date: 'Jul 26, 2026', venue: 'Garden Pavilion',   status: 'confirmed' },
  { client: 'Garcia Debut',     date: 'Jul 28, 2026', venue: 'Grand Ballroom',    status: 'pencil' },
  { client: 'Cruz Anniversary', date: 'Jul 30, 2026', venue: 'Terrace Hall',      status: 'confirmed' },
];

const OVERDUE = [
  { client: 'Santos Family',  amount: '₱25,000', daysOverdue: 5 },
  { client: 'Tan Wedding',    amount: '₱18,500', daysOverdue: 12 },
];

export default function AEDashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar role="ae" />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Good morning, Paula.</h1>
            <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginTop: 4 }}>
              Here's your overview for today — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Inquiry
          </button>
        </div>

        {/* Lead counts */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: 480, marginBottom: 28 }}>
          {Object.entries(LEAD_COUNTS).map(([status, count]) => (
            <Card key={status} accent={status === 'hot' ? 'terracotta' : status === 'warm' ? 'gold' : 'navy'}>
              <div style={{ fontSize: 32, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)' }}>{count}</div>
              <Badge variant={status} />
              <div style={{ fontSize: 11, color: 'var(--color-text-sub)', marginTop: 4 }}>leads</div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
          {/* Follow-ups due today */}
          <Card title="Follow-ups Due Today" accent="gold">
            {FOLLOWUPS.map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < FOLLOWUPS.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{f.client}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>{f.event} · {f.date}</div>
                </div>
                <Badge variant={f.status} />
              </div>
            ))}
          </Card>

          {/* Upcoming bookings */}
          <Card title="Upcoming Bookings This Week" accent="sage">
            {UPCOMING.map((b, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < UPCOMING.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{b.client}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>{b.date} · {b.venue}</div>
                </div>
                <Badge variant={b.status} />
              </div>
            ))}
          </Card>
        </div>

        {/* Overdue payments */}
        <Card title="Overdue Payment Alerts" accent="terracotta">
          {OVERDUE.length === 0 ? (
            <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No overdue payments.</p>
          ) : (
            OVERDUE.map((o, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < OVERDUE.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{o.client}</div>
                  <div style={{ fontSize: 11, color: 'var(--terracotta)' }}>{o.daysOverdue} days overdue</div>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--terracotta)' }}>{o.amount}</span>
              </div>
            ))
          )}
        </Card>

        {showModal && <InquiryModal onClose={() => setShowModal(false)} />}
      </main>
    </div>
  );
}
