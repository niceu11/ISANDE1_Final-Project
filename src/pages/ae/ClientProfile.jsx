import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

const CLIENTS = {
  1: {
    name: 'Santos Family',
    contact: '+63 917 123 4567',
    email: 'santos.family@email.com',
    eventDate: 'Aug 12, 2026',
    eventType: 'Wedding Reception',
    venue: 'Garden Pavilion',
    contractStatus: 'signed',
    notes: [
      { date: 'Jul 10, 2026', author: 'Paula', text: 'Client confirmed venue and finalized guest count at 180 pax.' },
      { date: 'Jul 05, 2026', author: 'Paula', text: 'Follow-up call completed. Bride prefers peach and gold color motif.' },
      { date: 'Jun 28, 2026', author: 'Paula', text: 'Initial inquiry received via referral from Garcia family.' },
    ],
    payments: [
      { label: 'Downpayment',   amount: '₱50,000',  status: 'verified',  date: 'Jun 30, 2026' },
      { label: 'Second Payment',amount: '₱25,000',  status: 'overdue',   date: 'Jul 15, 2026' },
      { label: 'Balance',       amount: '₱125,000', status: 'pending',   date: 'Aug 10, 2026' },
    ],
  },
  2: {
    name: 'Rivera, Andrea',
    contact: '+63 920 987 6543',
    email: 'andrea.rivera@email.com',
    eventDate: 'Sep 03, 2026',
    eventType: 'Debut – 18th Birthday',
    venue: 'Grand Ballroom',
    contractStatus: 'pending',
    notes: [
      { date: 'Jul 12, 2026', author: 'Paula', text: 'Client wants garden ceremony option — checking availability.' },
    ],
    payments: [
      { label: 'Downpayment', amount: '₱30,000', status: 'verified', date: 'Jul 01, 2026' },
      { label: 'Balance',     amount: '₱70,000', status: 'pending',  date: 'Sep 01, 2026' },
    ],
  },
};

export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = CLIENTS[id] ?? CLIENTS[1];

  return (
    <div className="app-shell">
      <Sidebar role="ae" />
      <main className="main-content">
        <div className="page-header">
          <div>
            <button onClick={() => navigate('/ae/inquiries')}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-sub)', fontSize: 13, cursor: 'pointer', marginBottom: 6, padding: 0 }}>
              ← Back to Inquiries
            </button>
            <h1 className="page-title">{client.name}</h1>
          </div>
          <Badge variant={client.contractStatus === 'signed' ? 'confirmed' : 'pending'}
            label={client.contractStatus === 'signed' ? 'Contract Signed' : 'Contract Pending'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Contact info */}
          <Card title="Contact Information" accent="navy">
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['Phone', client.contact],
                  ['Email', client.email],
                  ['Event Date', client.eventDate],
                  ['Event Type', client.eventType],
                  ['Venue', client.venue],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ padding: '8px 0', color: 'var(--color-text-sub)', width: 110, fontWeight: 500 }}>{label}</td>
                    <td style={{ padding: '8px 0' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Payment history (read-only) */}
          <Card title="Payment History" subtitle="Read-only — manage via Payments tab" accent="gold">
            {client.payments.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < client.payments.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>Due {p.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.amount}</div>
                  <Badge variant={p.status} />
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Notes log */}
        <Card title="Notes Log" accent="sage">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {client.notes.map((note, i) => (
              <div key={i} style={{ paddingBottom: 16, borderBottom: i < client.notes.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{note.author}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>{note.date}</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6 }}>{note.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
