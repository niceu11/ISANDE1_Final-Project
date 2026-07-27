const DAY_MS = 24 * 60 * 60 * 1000;

const TYPE_LABEL = {
  inquiry: 'New Inquiry',
  followup: 'Follow-up',
  upcoming: 'Upcoming Event',
  deadline: 'Deadline',
  announcement: 'Announcement',
  note: 'Note',
};

export function computeNotifications({ events = [], calendarNotes = [] }) {
  const now = Date.now();
  const items = [];

  events.forEach(e => {
    if (e.createdAt && now - new Date(e.createdAt).getTime() < DAY_MS) {
      items.push({
        id: `inquiry-${e._id}`,
        type: 'inquiry',
        text: `New inquiry logged: ${e.clientName}`,
        date: e.createdAt,
      });
    }

    if (['hot', 'warm'].includes(e.status) && e.followupsCompleted < e.followupsTotal) {
      items.push({
        id: `followup-${e._id}`,
        type: 'followup',
        text: `Follow-up due: ${e.clientName}`,
        date: e.lastActivityAt || e.createdAt,
      });
    }

    if (['confirmed', 'pencil'].includes(e.status) && e.eventDate) {
      const daysOut = (new Date(e.eventDate).getTime() - now) / DAY_MS;
      if (daysOut >= 0 && daysOut <= 7) {
        const roundedDays = Math.ceil(daysOut);
        items.push({
          id: `upcoming-${e._id}`,
          type: 'upcoming',
          text: `${e.clientName} in ${roundedDays === 0 ? 'today' : `${roundedDays}d`}`,
          date: e.eventDate,
        });
      }
    }
  });

  calendarNotes.forEach(n => {
    const daysOut = (new Date(n.date).getTime() - now) / DAY_MS;
    if (daysOut >= -1 && daysOut <= 14) {
      items.push({
        id: `note-${n._id}`,
        type: n.type,
        text: n.text,
        date: n.date,
      });
    }
  });

  items.sort((a, b) => new Date(a.date) - new Date(b.date));
  return items.map(item => ({ ...item, typeLabel: TYPE_LABEL[item.type] ?? item.type }));
}
