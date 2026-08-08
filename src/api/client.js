const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getEvents: () => request('/events'),
  getFeaturedEvent: () => request('/events/featured'),
  getEvent: (id) => request(`/events/${id}`),
  checkAvailability: (date, excludeId) =>
    request(`/events/availability?date=${encodeURIComponent(date)}${excludeId ? `&excludeId=${excludeId}` : ''}`),
  createEvent: (payload) =>
    request('/events', { method: 'POST', body: JSON.stringify(payload) }),
  importClients: (rows) =>
    request('/events/import', { method: 'POST', body: JSON.stringify({ rows }) }),
  updateQuickNote: (id, quickNote) =>
    request(`/events/${id}/quick-note`, { method: 'PATCH', body: JSON.stringify({ quickNote }) }),
  logFollowUp: (id, method, author, authorRole) =>
    request(`/events/${id}/follow-up`, { method: 'PATCH', body: JSON.stringify({ method, author, authorRole }) }),
  updateEventStatus: (id, status, author, authorRole) =>
    request(`/events/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, author, authorRole }) }),
  updateEventDate: (id, eventDate, author, authorRole) =>
    request(`/events/${id}/date`, { method: 'PATCH', body: JSON.stringify({ eventDate, author, authorRole }) }),
  updateEventPackageSent: (id, packageSent, author, authorRole) =>
    request(`/events/${id}/package-sent`, { method: 'PATCH', body: JSON.stringify({ packageSent, author, authorRole }) }),

  addSupplier: (eventId, payload) =>
    request(`/events/${eventId}/suppliers`, { method: 'POST', body: JSON.stringify(payload) }),
  updateSupplier: (eventId, supplierId, payload) =>
    request(`/events/${eventId}/suppliers/${supplierId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  addAlternateSupplier: (eventId, supplierId, payload) =>
    request(`/events/${eventId}/suppliers/${supplierId}/alternates`, { method: 'POST', body: JSON.stringify(payload) }),
  promoteAlternate: (eventId, supplierId, altId) =>
    request(`/events/${eventId}/suppliers/${supplierId}/alternates/${altId}/promote`, { method: 'POST' }),

  getPayments: () => request('/payments'),
  getFeaturedPayment: () => request('/payments/featured'),
  getPaymentByEvent: (eventId) => request(`/payments/event/${eventId}`),
  verifyPayment: (eventId, field, author, authorRole) =>
    request(`/payments/event/${eventId}/verify`, { method: 'PATCH', body: JSON.stringify({ field, author, authorRole }) }),
  uploadProof: (eventId, field, fileName, author, authorRole) =>
    request(`/payments/event/${eventId}/upload-proof`, { method: 'PATCH', body: JSON.stringify({ field, fileName, author, authorRole }) }),

  getCalendarNotes: () => request('/calendar-notes'),
  createCalendarNote: (payload) =>
    request('/calendar-notes', { method: 'POST', body: JSON.stringify(payload) }),
  deleteCalendarNote: (id) =>
    request(`/calendar-notes/${id}`, { method: 'DELETE' }),

  getAuditLogs: () => request('/audit-logs'),
};

export function formatCurrency(amount) {
  if (amount == null) return '—';
  return `₱${Math.round(Number(amount)).toLocaleString('en-PH')}`;
}

export function formatDate(dateStr, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', opts);
}

export function daysOverdue(dueDate) {
  if (!dueDate) return 0;
  const diff = Date.now() - new Date(dueDate).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function buildFollowUpMessage(event, aeName) {
  const firstName = event.clientName?.split(/[ ,]/)[0] || event.clientName;
  const when = event.eventDate ? ` for ${formatDate(event.eventDate)}` : '';
  return `Hi ${firstName}, this is ${aeName || 'your Soirée Hub coordinator'} from Soirée Events Place following up on your ${event.eventType || 'event'} inquiry${when}. Let us know if you have any questions!`;
}

export function buildPaymentFollowUpMessage(tranche, tranchLabel) {
  const label = tranchLabel === 'balance' ? 'remaining balance' : 'down payment';
  return `Good day! We would like to follow up on your pending ${label} amounting to ${formatCurrency(tranche.amount)}. Kindly let us know if you have already scheduled the payment. You may settle it as early as today to avoid any penalties and to keep your reservation on track. Thank you!`;
}

export function buildPencilFollowUpMessage(event) {
  const firstName = event.clientName?.split(/[ ,]/)[0] || event.clientName;
  const when = event.eventDate ? formatDate(event.eventDate) : 'your requested date';
  return `Hi ${firstName}! We currently have ${when} pencil-booked for your event. Kindly confirm at your earliest convenience so we can finalize your reservation — we wouldn't want to release the date. Thank you!`;
}

// Decides which follow-up template applies: an overdue/pending payment takes priority
// (there's a concrete penalty for delay), then a pencil booking awaiting confirmation,
// falling back to the generic inquiry follow-up.
export function determineFollowUp(event, payment) {
  if (payment) {
    const dueTranche = ['downpayment', 'balance'].find(f => ['pending', 'overdue'].includes(payment[f]?.status));
    if (dueTranche) {
      return { type: 'payment', label: `${dueTranche === 'balance' ? 'Balance' : 'Down payment'} follow-up`, message: buildPaymentFollowUpMessage(payment[dueTranche], dueTranche) };
    }
  }
  if (event.status === 'pencil' && event.eventDate) {
    return { type: 'pencil', label: 'Booking confirmation follow-up', message: buildPencilFollowUpMessage(event) };
  }
  return { type: 'general', label: 'General follow-up', message: buildFollowUpMessage(event) };
}

export function openSmsComposer(phone, message) {
  window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
}
