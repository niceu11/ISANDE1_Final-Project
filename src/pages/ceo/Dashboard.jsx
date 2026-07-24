import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Calendar from '../../components/Calendar';

const EVENTS = [
  { date: '2026-07-26', status: 'confirmed' },
  { date: '2026-07-28', status: 'pencil' },
  { date: '2026-07-30', status: 'confirmed' },
  { date: '2026-08-05', status: 'pencil' },
  { date: '2026-08-12', status: 'confirmed' },
  { date: '2026-09-03', status: 'confirmed' },
];

const CONFIRMED = [
  { client: 'Reyes Wedding',    date: 'Jul 26, 2026', venue: 'Garden Pavilion' },
  { client: 'Cruz Anniversary', date: 'Jul 30, 2026', venue: 'Terrace Hall'    },
  { client: 'Santos Family',    date: 'Aug 12, 2026', venue: 'Garden Pavilion' },
  { client: 'Rivera Debut',     date: 'Sep 03, 2026', venue: 'Grand Ballroom'  },
];

export default function CEODashboard() {
  return (
    <div className="app-shell">
      <Sidebar role="ceo" />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Good morning, Rowena.</h1>
            <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginTop: 4 }}>
              Executive overview · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          {[
            { label: 'Confirmed Bookings', value: '4', accent: 'sage' },
            { label: 'Upcoming This Month', value: '3', accent: 'gold' },
            { label: 'Pencil Bookings',    value: '2', accent: 'navy' },
          ].map(s => (
            <Card key={s.label} accent={s.accent}>
              <div style={{ fontSize: 40, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-sub)', marginTop: 4 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Calendar (read-only) */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-sub)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Booking Calendar — Read Only</div>
          <Calendar events={EVENTS} />
        </div>

        {/* Confirmed bookings list */}
        <Card title="Confirmed Bookings" accent="sage" style={{ marginBottom: 24 }}>
          <table className="data-table" style={{ boxShadow: 'none', border: 'none' }}>
            <thead>
              <tr><th>Client</th><th>Event Date</th><th>Venue</th><th>Status</th></tr>
            </thead>
            <tbody>
              {CONFIRMED.map((b, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{b.client}</td>
                  <td>{b.date}</td>
                  <td>{b.venue}</td>
                  <td><Badge variant="confirmed" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Post-MVP placeholders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {['Total Revenue', 'Conversion Rate'].map(label => (
            <div key={label} style={{ background: 'var(--white)', border: '1.5px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', opacity: 0.5, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-sub)', marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-heading)', color: '#ccc' }}>—</div>
              <span style={{ display: 'inline-block', marginTop: 10, fontSize: 11, background: '#f0f0f0', color: '#999', padding: '3px 10px', borderRadius: 20 }}>Post-MVP</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
