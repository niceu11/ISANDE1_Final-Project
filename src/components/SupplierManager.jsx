import { useState } from 'react';
import Badge from './Badge';
import { api, formatDate, openSmsComposer } from '../api/client';

const CATEGORY_OPTIONS = ['Catering', 'Florals', 'Photographer', 'Videographer', 'Sounds/AV', 'Hair & Makeup', 'Decor', 'Transport', 'Other'];

function contactMessage(event, supplier) {
  const when = event.eventDate ? ` on ${formatDate(event.eventDate)}` : '';
  return `Hi, this is ${event.coordinator || 'the Soirée Events Place team'} checking in on ${supplier.role} for ${event.clientName}'s event${when}. Please confirm your availability at your earliest convenience.`;
}

export default function SupplierManager({ event, onUpdated }) {
  const [addingSupplier, setAddingSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ role: '', company: '', contact: '' });
  const [addingAltFor, setAddingAltFor] = useState(null);
  const [newAlt, setNewAlt] = useState({ name: '', contact: '' });
  const [saving, setSaving] = useState(false);

  const run = async (promise) => {
    setSaving(true);
    try {
      const updated = await promise;
      onUpdated(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    run(api.addSupplier(event._id, newSupplier)).then(() => {
      setNewSupplier({ role: '', company: '', contact: '' });
      setAddingSupplier(false);
    });
  };

  const handleAddAlt = (e, supplierId) => {
    e.preventDefault();
    run(api.addAlternateSupplier(event._id, supplierId, newAlt)).then(() => {
      setNewAlt({ name: '', contact: '' });
      setAddingAltFor(null);
    });
  };

  const markStatus = (supplierId, status) => run(api.updateSupplier(event._id, supplierId, { status }));
  const promote = (supplierId, altId) => run(api.promoteAlternate(event._id, supplierId, altId));

  return (
    <>
      {event.suppliers.length === 0 && (
        <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No suppliers assigned yet.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {event.suppliers.map(s => (
          <div key={s._id} data-testid={`supplier-row-${s._id}`} style={{ padding: 12, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.role}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>{s.company}</div>
                <div style={{ fontSize: 11.5, color: 'var(--color-text-sub)' }}>{s.contact}</div>
              </div>
              <Badge variant={s.status === 'no-response' ? 'overdue' : s.status} label={s.status === 'no-response' ? 'No Response' : undefined} />
            </div>

            {s.status !== 'confirmed' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 11.5 }}
                  onClick={() => openSmsComposer(s.contact, contactMessage(event, s))}>
                  Contact
                </button>
                <button type="button" className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 11.5 }}
                  onClick={() => markStatus(s._id, 'confirmed')} disabled={saving}>
                  Mark Confirmed
                </button>
                {s.status !== 'no-response' && (
                  <button type="button" className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 11.5, color: 'var(--terracotta-text)', borderColor: '#e0c4b8' }}
                    onClick={() => markStatus(s._id, 'no-response')} disabled={saving}>
                    Mark No Response
                  </button>
                )}
              </div>
            )}

            {(s.status === 'no-response' || s.alternates.length > 0) && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--color-border)' }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: s.status === 'no-response' ? 'var(--terracotta-text)' : 'var(--color-text-sub)', marginBottom: 6 }}>
                  {s.status === 'no-response' ? 'Not responding — alternate suppliers' : 'Backup suppliers on file'}
                </div>
                {s.alternates.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>No alternates on file yet.</p>
                )}
                {s.alternates.map(a => (
                  <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                    <div style={{ fontSize: 12.5 }}>
                      {a.name} <span style={{ color: 'var(--color-text-sub)' }}>· {a.contact}</span>
                    </div>
                    {s.status === 'no-response' && (
                      <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => promote(s._id, a._id)} disabled={saving}>
                        Use Instead
                      </button>
                    )}
                  </div>
                ))}

                {s.status === 'no-response' && (
                  addingAltFor === s._id ? (
                    <form onSubmit={(e) => handleAddAlt(e, s._id)} style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <input className="form-input" style={{ fontSize: 12, padding: 6 }} placeholder="Alternate company name"
                        value={newAlt.name} onChange={e => setNewAlt(a => ({ ...a, name: e.target.value }))} required />
                      <input className="form-input" style={{ fontSize: 12, padding: 6, maxWidth: 150 }} placeholder="Contact"
                        value={newAlt.contact} onChange={e => setNewAlt(a => ({ ...a, contact: e.target.value }))} required />
                      <button type="submit" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }} disabled={saving}>Add</button>
                    </form>
                  ) : (
                    <button type="button" onClick={() => setAddingAltFor(s._id)}
                      style={{ background: 'none', border: 'none', color: 'var(--gold-text)', fontSize: 11.5, cursor: 'pointer', padding: 0, marginTop: 4 }}>
                      + Add alternate supplier
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {addingSupplier ? (
        <form onSubmit={handleAddSupplier} style={{ marginTop: 14, padding: 12, background: 'var(--off-white)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <select className="form-select" value={newSupplier.role} onChange={e => setNewSupplier(s => ({ ...s, role: e.target.value }))} required>
            <option value="" disabled>Select category</option>
            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="form-input" placeholder="Company name" value={newSupplier.company}
            onChange={e => setNewSupplier(s => ({ ...s, company: e.target.value }))} required />
          <input className="form-input" placeholder="Contact number" value={newSupplier.contact}
            onChange={e => setNewSupplier(s => ({ ...s, contact: e.target.value }))} required />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }} onClick={() => setAddingSupplier(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }} disabled={saving}>Add Supplier</button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn btn-secondary" style={{ marginTop: 14, fontSize: 12, width: '100%', justifyContent: 'center' }}
          onClick={() => setAddingSupplier(true)}>
          + Add Supplier
        </button>
      )}
    </>
  );
}
