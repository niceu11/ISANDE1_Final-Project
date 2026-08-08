import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { getCurrentUser } from '../../components/RequireAuth';

export default function InquiryModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    clientName: '', contact: '', eventDate: '',
    eventType: 'wedding', venue: '', ceremony: 'church', notes: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState(null); // null | { checking } | { conflicts }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!form.eventDate) {
      setAvailability(null);
      return;
    }
    setAvailability({ checking: true });
    const timer = setTimeout(() => {
      api.checkAvailability(form.eventDate)
        .then(res => setAvailability({ conflicts: res.conflicts }))
        .catch(() => setAvailability(null));
    }, 400);
    return () => clearTimeout(timer);
  }, [form.eventDate]);

  const hasConflict = availability?.conflicts?.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const user = getCurrentUser();
      await api.createEvent({ ...form, author: user?.name, authorRole: user?.role });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save inquiry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Add inquiry</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Client Name</label>
            <input className="form-input" placeholder="Client name" value={form.clientName} onChange={e => set('clientName', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input className="form-input" placeholder="+63 9XX XXX XXXX" value={form.contact} onChange={e => set('contact', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Event Date</label>
            <input className="form-input" type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} />
            {availability?.checking && (
              <p style={{ fontSize: 11.5, color: 'var(--color-text-sub)', marginTop: 4 }}>Checking availability…</p>
            )}
            {availability?.conflicts && !availability.checking && (
              hasConflict ? (
                <div className="availability-warning">
                  <strong>⚠ Date already booked</strong>
                  <ul>
                    {availability.conflicts.map(c => (
                      <li key={c._id}>
                        {c.clientName} — {c.venue || 'venue TBD'} ({c.status === 'confirmed' ? 'Confirmed' : 'Pencil-booked'})
                      </li>
                    ))}
                  </ul>
                  <span style={{ fontSize: 11.5, opacity: 0.85 }}>You can still log this as a backup lead — just flagging it for you.</span>
                </div>
              ) : (
                <p style={{ fontSize: 11.5, color: '#4a5d44', marginTop: 4 }}>✓ Date is available</p>
              )
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Event Type</label>
              <select className="form-select" value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                <option value="wedding">Wedding</option>
                <option value="debut">Debut</option>
                <option value="corporate">Corporate</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ceremony Type</label>
              <select className="form-select" value={form.ceremony} onChange={e => set('ceremony', e.target.value)}>
                <option value="church">Church</option>
                <option value="garden">Garden</option>
                <option value="civil">Civil</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Venue Preference</label>
            <input className="form-input" placeholder="Venue preference" value={form.venue} onChange={e => set('venue', e.target.value)} />
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="notes-check" checked={form.notes} onChange={e => set('notes', e.target.checked)} />
            <label htmlFor="notes-check" style={{ fontSize: 13, cursor: 'pointer' }}>
              Add initial notes for this inquiry
            </label>
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-text-sub)', marginTop: 4 }}>
            New lead status defaults to <strong>Warm</strong> on save — change it manually from the pipeline view.
          </p>
          {error && <p style={{ color: 'var(--terracotta-text)', fontSize: 12 }}>{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
