import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const NAVY = [0, 32, 74];
const GOLD = [220, 175, 97];
const CHAMPAGNE = [232, 213, 181];
const SAGE = [124, 148, 115];
const TEXT_SUB = [107, 101, 96];
const INK = [26, 26, 26];

const STATUS_LABEL = { hot: 'Hot', warm: 'Warm', cold: 'Cold', pencil: 'Pencil', confirmed: 'Confirmed' };
const TRANCHE_LABEL = { verified: 'Verified', pending: 'Pending', overdue: 'Overdue' };

// jsPDF's built-in fonts (helvetica/times) don't cover the ₱ glyph (U+20B1) - it silently
// renders as "±". Use the ISO currency code instead, which is guaranteed to render correctly.
function formatCurrency(amount) {
  if (amount == null) return '—';
  return `PHP ${Math.round(Number(amount)).toLocaleString('en-PH')}`;
}

export function generateReportPdf({
  totalRevenue,
  totalOutstanding,
  conversionRate,
  confirmedCount,
  totalEvents,
  avgBookingValue,
  monthEntries,
  tranches,
  statusCounts,
  generatedBy,
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Header band
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 92, 'F');
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(2);
  doc.line(0, 92, pageWidth, 92);

  doc.setTextColor(...GOLD);
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.text('Soirée Hub', margin, 40);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Every event. One place. — Monthly Report & Analytics', margin, 58);

  const now = new Date();
  const period = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  doc.setFontSize(9);
  doc.setTextColor(...CHAMPAGNE);
  doc.text(`Period: ${period}`, margin, 76);
  doc.text(
    `Generated ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${generatedBy ? ` by ${generatedBy}` : ''}`,
    pageWidth - margin, 76, { align: 'right' },
  );

  let y = 120;

  // Headline metrics
  doc.setTextColor(...INK);
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('Key Metrics', margin, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 8, textColor: INK },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold' },
    head: [['Total Revenue (Verified)', 'Outstanding Balance', 'Conversion Rate', 'Avg. Booking Value']],
    body: [[
      formatCurrency(totalRevenue),
      formatCurrency(totalOutstanding),
      `${conversionRate}%  (${confirmedCount}/${totalEvents})`,
      formatCurrency(avgBookingValue),
    ]],
  });

  y = doc.lastAutoTable.finalY + 28;

  // Bookings by month
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('Bookings by Month', margin, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'striped',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 7, textColor: INK },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold' },
    head: [['Month', 'Confirmed + Pencil Bookings']],
    body: monthEntries.length ? monthEntries.map(([month, count]) => [month, String(count)]) : [['No bookings yet', '—']],
  });

  y = doc.lastAutoTable.finalY + 28;

  // Payment tranche status
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('Payment Tranche Status', margin, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'striped',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 7, textColor: INK },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold' },
    head: [['Status', 'Tranches', 'Amount']],
    body: ['verified', 'pending', 'overdue'].map(status => [
      TRANCHE_LABEL[status],
      String(tranches[status].count),
      formatCurrency(tranches[status].amount),
    ]),
  });

  y = doc.lastAutoTable.finalY + 28;

  // Inquiry pipeline
  if (y > 650) { doc.addPage(); y = 60; }
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('Inquiry Pipeline', margin, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 8, textColor: INK, halign: 'center' },
    headStyles: { fillColor: SAGE, textColor: 255, fontStyle: 'bold' },
    head: [Object.values(STATUS_LABEL)],
    body: [Object.keys(STATUS_LABEL).map(s => String(statusCounts[s] ?? 0))],
  });

  // Footer on every page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...CHAMPAGNE);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_SUB);
    doc.text('Soirée Events Place · Internal System', margin, pageHeight - 26);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 26, { align: 'right' });
  }

  const filename = `soiree-hub-report-${now.toISOString().slice(0, 7)}.pdf`;
  doc.save(filename);
}
