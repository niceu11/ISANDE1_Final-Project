const DAY_MS = 24 * 60 * 60 * 1000;

const TYPE_LABEL = {
  inquiry: 'New Inquiry',
  followup: 'Follow-up',
  upcoming: 'Upcoming Event',
  deadline: 'Deadline',
  announcement: 'Announcement',
  note: 'Note',
};

const PRIORITY_RANK = { urgent: 0, normal: 1, low: 2 };

export function computeNotifications({ events = [], calendarNotes = [] }) {
  const now = Date.now();
  const items = [];

  events.forEach(e => {
    if (e.createdAt && now - new Date(e.createdAt).getTime() < DAY_MS) {
      items.push({
        id: `inquiry-${e._id}`,
        type: 'inquiry',
        entityId: e._id,
        text: `New inquiry logged: ${e.clientName}`,
        date: e.createdAt,
        priority: 'low',
      });
    }

    if (['hot', 'warm'].includes(e.status) && e.followupsCompleted < e.followupsTotal) {
      items.push({
        id: `followup-${e._id}`,
        type: 'followup',
        entityId: e._id,
        text: `Follow-up due: ${e.clientName}`,
        date: e.lastActivityAt || e.createdAt,
        priority: e.status === 'hot' ? 'urgent' : 'normal',
      });
    }

    if (['confirmed', 'pencil'].includes(e.status) && e.eventDate) {
      const daysOut = (new Date(e.eventDate).getTime() - now) / DAY_MS;
      if (daysOut >= 0 && daysOut <= 7) {
        const roundedDays = Math.ceil(daysOut);
        items.push({
          id: `upcoming-${e._id}`,
          type: 'upcoming',
          entityId: e._id,
          text: `${e.clientName} in ${roundedDays === 0 ? 'today' : `${roundedDays}d`}`,
          date: e.eventDate,
          priority: roundedDays <= 1 ? 'urgent' : 'normal',
        });
      }
    }
  });

  calendarNotes.forEach(n => {
    const daysOut = (new Date(n.date).getTime() - now) / DAY_MS;
    if (daysOut >= -1 && daysOut <= 14) {
      const isPastDue = n.type === 'deadline' && daysOut < 0;
      items.push({
        id: `note-${n._id}`,
        type: n.type,
        entityId: n._id,
        text: isPastDue ? `Overdue: ${n.text}` : n.text,
        date: n.date,
        priority: isPastDue ? 'urgent' : n.type === 'deadline' ? 'normal' : 'low',
      });
    }
  });

  items.sort((a, b) => {
    const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (rankDiff !== 0) return rankDiff;
    return new Date(a.date) - new Date(b.date);
  });

  return items.map(item => ({ ...item, typeLabel: TYPE_LABEL[item.type] ?? item.type }));
}
