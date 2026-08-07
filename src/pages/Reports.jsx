import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { getCurrentUser } from '../components/RequireAuth';
import { api, formatCurrency } from '../api/client';
import { usePolling } from '../hooks/usePolling';
import { generateReportPdf } from '../pdf/generateReportPdf';

const STATUS_ORDER = ['hot', 'warm', 'cold', 'pencil', 'confirmed'];
const STATUS_LABEL = { hot: 'Hot', warm: 'Warm', cold: 'Cold', pencil: 'Pencil', confirmed: 'Confirmed' };
const TRANCHE_LABEL = { verified: 'Verified', pending: 'Pending', overdue: 'Overdue' };

export default function Reports() {
  const role = getCurrentUser()?.role ?? 'manager';
  const [events, setEvents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    Promise.all([api.getEvents(), api.getPayments()])
      .then(([ev, pay]) => { setEvents(ev); setPayments(pay); setError(''); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  usePolling(() => load(true));

  // --- Revenue & outstanding ---
  let totalRevenue = 0;
  let totalOutstanding = 0;
  const tranches = { verified: { count: 0, amount: 0 }, pending: { count: 0, amount: 0 }, overdue: { count: 0, amount: 0 } };

  payments.forEach(p => {
    ['downpayment', 'balance'].forEach(field => {
      const t = p[field];
      if (!t) return;
      if (tranches[t.status]) {
        tranches[t.status].count += 1;
        tranches[t.status].amount += t.amount || 0;
      }
      if (t.status === 'verified') totalRevenue += t.amount || 0;
      else totalOutstanding += t.amount || 0;
    });
  });

  const avgBookingValue = payments.length
    ? payments.reduce((sum, p) => sum + (p.totalAmount || 0), 0) / payments.length
    : 0;

  // --- Pipeline breakdown ---
  const statusCounts = Object.fromEntries(STATUS_ORDER.map(s => [s, 0]));
  events.forEach(e => { if (statusCounts[e.status] !== undefined) statusCounts[e.status] += 1; });

  const confirmedCount = statusCounts.confirmed;
  const conversionRate = events.length ? Math.round((confirmedCount / events.length) * 100) : 0;

  // --- Bookings by month ---
  const monthly = {};
  events
    .filter(e => ['confirmed', 'pencil'].includes(e.status) && e.eventDate)
    .forEach(e => {
      const key = new Date(e.eventDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthly[key] = (monthly[key] || 0) + 1;
    });
  const monthEntries = Object.entries(monthly).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  const maxMonthCount = Math.max(1, ...monthEntries.map(([, c]) => c));

  const handleExportPdf = () => {
    generateReportPdf({
      totalRevenue,
      totalOutstanding,
      conversionRate,
      confirmedCount,
      totalEvents: events.length,
      avgBookingValue,
      monthEntries,
      tranches,
      statusCounts,
      generatedBy: getCurrentUser()?.name,
    });
  };

  return (
    <AppLayout role={role}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Reports &amp; Analytics</h1>
            <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginTop: 4 }}>
              Live figures across {events.length} tracked inquiries and {payments.length} active payment records.
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleExportPdf} disabled={loading || !!error}>
            Download PDF Report
          </button>
        </div>

        {loading && <p style={{ color: 'var(--color-text-sub)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--terracotta-text)' }}>{error}</p>}

        {!loading && !error && (
          <>
            {/* Headline stats */}
            <div className="stats-grid" style={{ marginBottom: 28 }}>
              <Card accent="sage">
                <div style={{ fontSize: 13, color: 'var(--color-text-sub)', marginBottom: 6 }}>Total Revenue (Verified)</div>
                <div style={{ fontSize: 30, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)' }}>{formatCurrency(totalRevenue)}</div>
              </Card>
              <Card accent="terracotta">
                <div style={{ fontSize: 13, color: 'var(--color-text-sub)', marginBottom: 6 }}>Outstanding Balance</div>
                <div style={{ fontSize: 30, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)' }}>{formatCurrency(totalOutstanding)}</div>
              </Card>
              <Card accent="gold">
                <div style={{ fontSize: 13, color: 'var(--color-text-sub)', marginBottom: 6 }}>Conversion Rate</div>
                <div style={{ fontSize: 30, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)' }}>{conversionRate}%</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>{confirmedCount} confirmed ÷ {events.length} total</div>
              </Card>
              <Card accent="navy">
                <div style={{ fontSize: 13, color: 'var(--color-text-sub)', marginBottom: 6 }}>Avg. Booking Value</div>
                <div style={{ fontSize: 30, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)' }}>{formatCurrency(avgBookingValue)}</div>
              </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, marginBottom: 24, alignItems: 'start' }}>
              {/* Bookings by month */}
              <Card title="Bookings by Month" subtitle="Confirmed + pencil bookings, by event date" accent="navy">
                {monthEntries.length === 0 && <p style={{ color: 'var(--color-text-sub)', fontSize: 13 }}>No bookings yet.</p>}
                {monthEntries.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 160, paddingTop: 8 }}>
                    {monthEntries.map(([month, count]) => (
                      <div key={month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>{count}</div>
                        <div
                          style={{
                            width: '100%',
                            maxWidth: 36,
                            height: `${(count / maxMonthCount) * 110 + 6}px`,
                            background: 'var(--navy)',
                            borderRadius: '4px 4px 2px 2px',
                          }}
                        />
                        <div style={{ fontSize: 11, color: 'var(--color-text-sub)', marginTop: 6, whiteSpace: 'nowrap' }}>{month}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Payment status breakdown */}
              <Card title="Payment Tranche Status" subtitle="Across all downpayment + balance tranches" accent="gold">
                {['verified', 'pending', 'overdue'].map((status, i, arr) => (
                  <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge variant={status} label={TRANCHE_LABEL[status]} />
                      <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>{tranches[status].count} tranches</span>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{formatCurrency(tranches[status].amount)}</span>
                  </div>
                ))}
              </Card>
            </div>

            {/* Pipeline breakdown */}
            <Card title="Inquiry Pipeline" subtitle="Every tracked event, by current status" accent="sage">
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {STATUS_ORDER.map(status => (
                  <div key={status} style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ fontSize: 26, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--navy)' }}>{statusCounts[status]}</div>
                    <Badge variant={status} label={STATUS_LABEL[status]} />
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
    </AppLayout>
  );
}
