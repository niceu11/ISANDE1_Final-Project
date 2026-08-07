import { useState } from 'react';
import './Calendar.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const NOTE_TYPES = [
  { value: 'note', label: 'Note' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'announcement', label: 'Announcement' },
];

function sameDate(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function Calendar({ events = [], notes = [], onAddNote }) {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDay, setSelectedDay] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [draftType, setDraftType] = useState('note');
  const [saving, setSaving] = useState(false);

  const { year, month } = current;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventMap = {};
  events.forEach(({ date, status }) => {
    const d = new Date(date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate();
      if (!eventMap[key]) eventMap[key] = [];
      eventMap[key].push(status);
    }
  });

  const noteMap = {};
  notes.forEach((n) => {
    const d = new Date(n.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate();
      if (!noteMap[key]) noteMap[key] = [];
      noteMap[key].push(n);
    }
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => {
    setCurrent(c => {
      const m = c.month === 0 ? 11 : c.month - 1;
      const y = c.month === 0 ? c.year - 1 : c.year;
      return { year: y, month: m };
    });
  };
  const next = () => {
    setCurrent(c => {
      const m = c.month === 11 ? 0 : c.month + 1;
      const y = c.month === 11 ? c.year + 1 : c.year;
      return { year: y, month: m };
    });
  };

  const openDay = (day) => {
    if (!day || !onAddNote) return;
    setSelectedDay(day);
    setDraftText('');
    setDraftType('note');
  };

  const closeDay = () => setSelectedDay(null);

  const selectedDate = selectedDay ? new Date(year, month, selectedDay) : null;
  const notesForSelected = selectedDay ? (noteMap[selectedDay] ?? []) : [];

  const handleAdd = async () => {
    if (!draftText.trim() || !onAddNote) return;
    setSaving(true);
    try {
      await onAddNote(selectedDate, draftText.trim(), draftType);
      setDraftText('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="cal-nav" onClick={prev}>‹</button>
        <span className="cal-title">{MONTHS[month]} {year}</span>
        <button className="cal-nav" onClick={next}>›</button>
      </div>

      <div className="calendar-grid">
        {DAYS.map(d => (
          <div key={d} className="cal-day-label">{d}</div>
        ))}
        {cells.map((day, i) => {
          const statuses = day ? (eventMap[day] ?? []) : [];
          const dayNotes = day ? (noteMap[day] ?? []) : [];
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isClickable = Boolean(day && onAddNote);
          const Tag = isClickable ? 'button' : 'div';
          return (
            <Tag
              key={i}
              type={isClickable ? 'button' : undefined}
              className={`cal-cell ${day ? '' : 'cal-cell-empty'} ${isToday ? 'cal-cell-today' : ''} ${isClickable ? 'cal-cell-clickable' : ''}`}
              onClick={isClickable ? () => openDay(day) : undefined}
              aria-label={day ? `${MONTHS[month]} ${day}, ${year}${isClickable ? ' — add a note or deadline' : ''}` : undefined}
              disabled={!isClickable && !day}
            >
              {day && (
                <>
                  <span className="cal-day-num">{day}</span>
                  <div className="cal-dots">
                    {statuses.map((s, j) => (
                      <span key={`e${j}`} className={`cal-dot cal-dot-${s}`} />
                    ))}
                    {dayNotes.map((n, j) => (
                      <span key={`n${j}`} className={`cal-dot cal-dot-${n.type}`} title={n.text} />
                    ))}
                  </div>
                </>
              )}
            </Tag>
          );
        })}
      </div>

      <div className="cal-legend">
        <span className="cal-legend-item"><span className="cal-dot cal-dot-confirmed" />Confirmed</span>
        <span className="cal-legend-item"><span className="cal-dot cal-dot-pencil" />Pencil Booking</span>
        <span className="cal-legend-item"><span className="cal-dot cal-dot-deadline" />Deadline</span>
        <span className="cal-legend-item"><span className="cal-dot cal-dot-announcement" />Announcement</span>
      </div>

      {selectedDay && (
        <div className="modal-overlay" onClick={closeDay}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">
              {MONTHS[month]} {selectedDay}, {year}
            </h2>

            {notesForSelected.length > 0 && (
              <div className="cal-day-notes">
                {notesForSelected.map(n => (
                  <div key={n._id} className="cal-day-note">
                    <span className={`cal-day-note-tag cal-day-note-tag-${n.type}`}>{n.type}</span>
                    <span className="cal-day-note-text">{n.text}</span>
                    {n.createdBy && <span className="cal-day-note-author">— {n.createdBy}</span>}
                  </div>
                ))}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Add a note or deadline</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="e.g. Site visit at 2 PM, or a payment deadline…"
                value={draftText}
                onChange={e => setDraftText(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={draftType} onChange={e => setDraftType(e.target.value)}>
                {NOTE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={closeDay}>Close</button>
              <button type="button" className="btn btn-primary" disabled={saving || !draftText.trim()} onClick={handleAdd}>
                {saving ? 'Saving…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
