import { useState } from 'react';
import { api } from '../../api/client';

export default function InquiryModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    clientName: '', contact: '', eventDate: '',
    eventType: 'wedding', venue: '', ceremony: 'church', notes: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createEvent(form);
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
          {error && <p style={{ color: 'var(--terracotta)', fontSize: 12 }}>{error}</p>}
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
