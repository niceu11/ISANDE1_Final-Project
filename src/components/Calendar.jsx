import { useState } from 'react';
import './Calendar.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

export default function Calendar({ events = [] }) {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

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
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <div key={i} className={`cal-cell ${day ? '' : 'cal-cell-empty'} ${isToday ? 'cal-cell-today' : ''}`}>
              {day && (
                <>
                  <span className="cal-day-num">{day}</span>
                  <div className="cal-dots">
                    {statuses.map((s, j) => (
                      <span key={j} className={`cal-dot cal-dot-${s}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="cal-legend">
        <span className="cal-legend-item"><span className="cal-dot cal-dot-confirmed" />Confirmed</span>
        <span className="cal-legend-item"><span className="cal-dot cal-dot-pencil" />Pencil Booking</span>
        <span className="cal-legend-item"><span className="cal-dot cal-dot-available" />Available</span>
      </div>
    </div>
  );
}
