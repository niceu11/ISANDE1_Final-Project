import './EventDay.css';

const EVENT = {
  client:    'Santos Family',
  type:      'Wedding Reception',
  date:      'August 12, 2026',
  time:      '4:00 PM – 10:00 PM',
  venue:     'Garden Pavilion',
  guestCount: 180,
  coordinator: 'Miss Paula',
};

const SUPPLIERS = [
  { role: 'Catering',       company: 'La Mesa Catering',    contact: '+63 917 111 2222', status: 'confirmed' },
  { role: 'Florals',        company: 'Bloom & Petal Co.',   contact: '+63 920 333 4444', status: 'confirmed' },
  { role: 'Photographer',   company: 'Lens & Light Studio', contact: '+63 915 555 6666', status: 'confirmed' },
  { role: 'Sounds/AV',      company: 'SoundMax Events',     contact: '+63 918 777 8888', status: 'pending'   },
  { role: 'Hair & Makeup',  company: 'Glow Up Artists',     contact: '+63 916 999 0000', status: 'confirmed' },
];

const INSTRUCTIONS = [
  'Gates open at 3:00 PM for supplier setup. Guest arrival at 4:00 PM.',
  'Cocktail hour at the garden foyer — coordinate with florist for centerpiece placement by 3:30 PM.',
  'Strict no-flash photography policy during the ceremony. Relay to photo team.',
  'Client requested NO slideshow background music — check with AV team on arrival.',
  'Emergency contact for bride: +63 917 123 4567 (Ms. Santos). For groom: +63 920 987 6543.',
];

export default function EventDay() {
  return (
    <div className="event-day-bg">
      <div className="event-day-container">
        {/* Header */}
        <div className="event-day-header">
          <div className="event-day-brand">Soirée Hub · Event Day View</div>
          <div className="event-day-date">{EVENT.date}</div>
        </div>

        {/* Hero event card */}
        <div className="event-hero-card">
          <div className="event-hero-label">Today's Event</div>
          <h1 className="event-hero-title">{EVENT.client}</h1>
          <p className="event-hero-type">{EVENT.type}</p>
          <div className="event-hero-meta">
            <span>🕓 {EVENT.time}</span>
            <span>📍 {EVENT.venue}</span>
            <span>👥 {EVENT.guestCount} guests</span>
            <span>📋 Coord: {EVENT.coordinator}</span>
          </div>
        </div>

        {/* Suppliers table */}
        <div className="event-section">
          <h2 className="event-section-title">Assigned Suppliers</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {SUPPLIERS.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{s.role}</td>
                  <td>{s.company}</td>
                  <td style={{ color: 'var(--color-text-sub)' }}>{s.contact}</td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                      background: s.status === 'confirmed' ? '#d1fae5' : '#fef3c7',
                      color:      s.status === 'confirmed' ? '#065f46' : '#92400e',
                    }}>
                      {s.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Client instructions */}
        <div className="event-section">
          <h2 className="event-section-title">Client Instructions</h2>
          <div className="event-instructions-card">
            <ul className="event-instructions-list">
              {INSTRUCTIONS.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
