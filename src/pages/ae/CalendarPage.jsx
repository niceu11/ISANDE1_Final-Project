import Sidebar from '../../components/Sidebar';
import Calendar from '../../components/Calendar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

const EVENTS = [
  { date: '2026-07-26', status: 'confirmed' },
  { date: '2026-07-28', status: 'pencil' },
  { date: '2026-07-30', status: 'confirmed' },
  { date: '2026-08-05', status: 'pencil' },
  { date: '2026-08-12', status: 'confirmed' },
  { date: '2026-08-20', status: 'pencil' },
  { date: '2026-09-03', status: 'confirmed' },
  { date: '2026-09-14', status: 'confirmed' },
];

const UPCOMING_LIST = [
  { client: 'Reyes Wedding',    date: 'Jul 26',  venue: 'Garden Pavilion', status: 'confirmed' },
  { client: 'Garcia Debut',     date: 'Jul 28',  venue: 'Grand Ballroom',  status: 'pencil' },
  { client: 'Cruz Anniversary', date: 'Jul 30',  venue: 'Terrace Hall',    status: 'confirmed' },
  { client: 'Santos Family',    date: 'Aug 12',  venue: 'Garden Pavilion', status: 'confirmed' },
];

export default function CalendarPage() {
  return (
    <div className="app-shell">
      <Sidebar role="ae" />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Booking Calendar</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          <Calendar events={EVENTS} />

          <Card title="Upcoming Events" accent="sage">
            {UPCOMING_LIST.map((e, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < UPCOMING_LIST.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{e.client}</div>
                  <Badge variant={e.status} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-sub)', marginTop: 2 }}>{e.date} · {e.venue}</div>
              </div>
            ))}
          </Card>
        </div>
      </main>
    </div>
  );
}
