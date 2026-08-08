import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Toast from '../../components/Toast';
import SupplierManager from '../../components/SupplierManager';
import { getCurrentUser } from '../../components/RequireAuth';
import {
  api, formatCurrency, formatDate, openSmsComposer, determineFollowUp,
} from '../../api/client';

const STATUS_OPTIONS = [
  { value: 'hot', label: 'Hot' },
  { value: 'warm', label: 'Warm' },
  { value: 'cold', label: 'Cold' },
  { value: 'pencil', label: 'Pencil-Booked' },
  { value: 'confirmed', label: 'Confirmed' },
];

export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [client, setClient] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const [statusDraft, setStatusDraft] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  const [editingDate, setEditingDate] = useState(false);
  const [dateDraft, setDateDraft] = useState('');
  const [savingDate, setSavingDate] = useState(false);
  const [dateError, setDateError] = useState('');

  const [savingPackage, setSavingPackage] = useState(false);
  const [sendingFollowUp, setSendingFollowUp] = useState(false);

  const load = () => {
    setLoading(true);
    const eventPromise = id ? api.getEvent(id) : api.getFeaturedEvent();
    eventPromise
      .then(async (event) => {
        setClient(event);
        setStatusDraft(event.status);
        setError('');
        try {
          const pay = await api.getPaymentByEvent(event._id);
          setPayment(pay);
        } catch {
          setPayment(null);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 4000);
  };

  const isLocked = client?.status === 'confirmed';

  const handleSaveStatus = async () => {
    if (statusDraft === client.status) return;
    setStatusError('');
    setSavingStatus(true);
    try {
      const updated = await api.updateEventStatus(client._id, statusDraft, user?.name, user?.role);
      setClient(updated);
      showToast(`Status updated to ${STATUS_OPTIONS.find(o => o.value === statusDraft)?.label ?? statusDraft}.`);
    } catch (err) {
      setStatusError(err.message || 'Could not update status');
      setStatusDraft(client.status);
    } finally {
      setSavingStatus(false);
    }
  };

  const startEditDate = () => {
    setDateDraft(client.eventDate ? client.eventDate.slice(0, 10) : '');
    setDateError('');
    setEditingDate(true);
  };

  const handleSaveDate = async () => {
    setDateError('');
    setSavingDate(true);
    try {
      const updated = await api.updateEventDate(client._id, dateDraft || null, user?.name, user?.role);
      setClient(updated);
      setEditingDate(false);
      showToast('Event date updated.');
    } catch (err) {
      setDateError(err.message || 'Could not update date');
    } finally {
      setSavingDate(false);
    }
  };

  const handleTogglePackage = async () => {
    setSavingPackage(true);
    try {
      const updated = await api.updateEventPackageSent(client._id, !client.packageSent, user?.name, user?.role);
      setClient(updated);
      showToast(updated.packageSent ? 'Marked package as sent.' : 'Package-sent status cleared.');
    } catch (err) {
      showToast(err.message || 'Could not update package status', 'error');
    } finally {
      setSavingPackage(false);
    }
  };

  const handleSendFollowUp = async () => {
    if (!client.contact) {
      showToast('No phone number on file for this client.', 'error');
      return;
    }
    const followUp = determineFollowUp(client, payment);
    setSendingFollowUp(true);
    openSmsComposer(client.contact, followUp.message);
    try {
      const updated = await api.logFollowUp(client._id, 'sms', user?.name, user?.role);
      setClient(updated);
      showToast(`SMS follow-up sent to ${client.clientName} — ${followUp.label}.`);
    } catch {
      showToast('SMS composer opened, but the follow-up could not be logged.', 'error');
    } finally {
      setSendingFollowUp(false);
    }
  };

  const followUpNotes = client?.notes.filter(n => n.text.startsWith('Follow-up sent')) ?? [];

  return (
    <AppLayout role="ae">
        {loading && <p style={{ color: 'var(--color-text-sub)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--terracotta-text)' }}>{error}</p>}

        {!loading && !error && client && (
          <>
            <div className="page-header">
              <div>
                <button onClick={() => navigate('/ae/inquiries')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-sub)', fontSize: 13, cursor: 'pointer', marginBottom: 6, padding: 0 }}>
                  ← Back to Inquiries
                </button>
                <h1 className="page-title">{client.clientName}</h1>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {client.packageSent && <Badge variant="confirmed" label="📦 Package Sent" />}
                <Badge variant={client.contractStatus === 'signed' ? 'confirmed' : 'pending'}
                  label={client.contractStatus === 'signed' ? 'Contract Signed' : 'Contract Pending'} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              {/* Contact info */}
              <Card title="Contact Information" accent="navy">
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['Phone', client.contact],
                      ['Email', client.email],
                      ['Event Type', client.eventType],
                      ['Venue', client.venue],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={{ padding: '8px 0', color: 'var(--color-text-sub)', width: 110, fontWeight: 500 }}>{label}</td>
                        <td style={{ padding: '8px 0' }}>{value || '—'}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ padding: '8px 0', color: 'var(--color-text-sub)', width: 110, fontWeight: 500 }}>Event Date</td>
                      <td style={{ padding: '8px 0' }}>
                        {isLocked ? (
                          <span title="Locked — event is confirmed">🔒 {formatDate(client.eventDate)}</span>
                        ) : editingDate ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            <input type="date" className="form-input" style={{ padding: '4px 8px', fontSize: 12.5, width: 150 }}
                              value={dateDraft} onChange={e => setDateDraft(e.target.value)} />
                            <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 11.5 }} disabled={savingDate} onClick={handleSaveDate}>
                              {savingDate ? 'Saving…' : 'Save'}
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 11.5 }} onClick={() => setEditingDate(false)}>Cancel</button>
                            {dateError && <span style={{ color: 'var(--terracotta-text)', fontSize: 11, width: '100%' }}>{dateError}</span>}
                          </div>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            {formatDate(client.eventDate)}
                            <button onClick={startEditDate}
                              style={{ background: 'none', border: 'none', color: 'var(--gold-text)', fontSize: 11.5, cursor: 'pointer', padding: 0 }}>
                              Edit
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Card>

              {/* Payment history (read-only) */}
              <Card title="Payment History" subtitle="Read-only — manage via Payments tab" accent="gold">
                {!payment && <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No payments recorded yet.</p>}
                {payment && [
                  { label: 'Downpayment', ...payment.downpayment },
                  { label: 'Balance', ...payment.balance },
                ].map((p, i, arr) => (
                  <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>Due {formatDate(p.dueDate)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{formatCurrency(p.amount)}</div>
                      <Badge variant={p.status} />
                    </div>
                  </div>
                ))}
                {payment && (
                  <button className="btn btn-secondary" style={{ marginTop: 14, fontSize: 12, width: '100%', justifyContent: 'center' }}
                    onClick={() => navigate(`/ae/payments/${client._id}`)}>
                    View Full Payment Tracker
                  </button>
                )}
              </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              {/* Booking status */}
              <Card title="Booking Status" subtitle={isLocked ? 'Confirmed — date is locked from further edits' : 'Update once the date is finalized'} accent="navy">
                {isLocked ? (
                  <Badge variant="confirmed" label="✓ Confirmed" />
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select className="form-select" style={{ maxWidth: 200 }} value={statusDraft} onChange={e => setStatusDraft(e.target.value)}>
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12.5 }}
                      disabled={savingStatus || statusDraft === client.status} onClick={handleSaveStatus}>
                      {savingStatus ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                )}
                {statusError && <p style={{ color: 'var(--terracotta-text)', fontSize: 12, marginTop: 8 }}>{statusError}</p>}
                {!isLocked && !client.eventDate && (
                  <p style={{ fontSize: 11.5, color: 'var(--color-text-sub)', marginTop: 8 }}>Set an event date before marking this Confirmed.</p>
                )}

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: 12.5, width: '100%', justifyContent: 'center' }}
                    disabled={savingPackage}
                    onClick={handleTogglePackage}
                  >
                    {savingPackage ? 'Saving…' : client.packageSent ? '✓ Package Sent — click to unmark' : '📦 Mark Package Sent'}
                  </button>
                </div>
              </Card>

              {/* Follow-ups */}
              <Card
                title="Follow-Ups"
                subtitle="SMS sent privately to the client — not via Messenger/social"
                accent="sage"
                badge={followUpNotes.length || null}
              >
                <button className="btn btn-primary" style={{ fontSize: 12.5, width: '100%', justifyContent: 'center', marginBottom: 12 }}
                  disabled={sendingFollowUp} onClick={handleSendFollowUp}>
                  {sendingFollowUp ? 'Opening SMS…' : 'Send Follow-Up (SMS)'}
                </button>
                {followUpNotes.length === 0 && <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No follow-ups sent yet.</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto' }}>
                  {followUpNotes.map((n, i) => (
                    <div key={i} style={{ paddingBottom: 10, borderBottom: i < followUpNotes.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{n.author}</span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>{formatDate(n.date)}</span>
                      </div>
                      <p style={{ fontSize: 12.5, marginTop: 2 }}>{n.text}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Suppliers */}
            <div style={{ marginBottom: 24 }}>
              <Card
                title="Suppliers"
                subtitle="Contact pending suppliers, or swap in a backup if one goes unresponsive"
                accent="terracotta"
                badge={client.suppliers.filter(s => s.status !== 'confirmed').length || null}
              >
                <SupplierManager event={client} onUpdated={setClient} />
              </Card>
            </div>

            {/* Notes log */}
            <Card title="Notes Log" accent="sage">
              {client.notes.length === 0 && <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No notes yet.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {client.notes.map((note, i) => (
                  <div key={i} style={{ paddingBottom: 16, borderBottom: i < client.notes.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{note.author}</span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>{formatDate(note.date)}</span>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.6 }}>{note.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {toast && <Toast message={toast.message} tone={toast.tone} />}
    </AppLayout>
  );
}
