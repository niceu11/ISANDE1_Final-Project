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
  createEvent: (payload) =>
    request('/events', { method: 'POST', body: JSON.stringify(payload) }),

  getPayments: () => request('/payments'),
  getFeaturedPayment: () => request('/payments/featured'),
  getPaymentByEvent: (eventId) => request(`/payments/event/${eventId}`),
  verifyPayment: (eventId, field) =>
    request(`/payments/event/${eventId}/verify`, { method: 'PATCH', body: JSON.stringify({ field }) }),
};

export function formatCurrency(amount) {
  if (amount == null) return '—';
  return `₱${Number(amount).toLocaleString('en-PH')}`;
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
