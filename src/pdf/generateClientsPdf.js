import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const NAVY = [0, 32, 74];
const GOLD = [220, 175, 97];
const CHAMPAGNE = [232, 213, 181];
const SAGE = [124, 148, 115];
const TERRACOTTA = [185, 105, 74];
const TEXT_SUB = [107, 101, 96];
const INK = [26, 26, 26];

const SECTIONS = [
  { key: 'confirmed', label: 'Confirmed — Awaiting Event Day', color: SAGE },
  { key: 'pencil',    label: 'Pencil-Booked',                  color: GOLD },
  { key: 'hot',       label: 'Hot Leads',                      color: TERRACOTTA },
  { key: 'warm',      label: 'Warm Leads',                     color: GOLD },
  { key: 'cold',      label: 'Cold Leads',                     color: TEXT_SUB },
];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function generateClientsPdf(events, generatedBy) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

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
  doc.text('Every event. One place. — Client / Booking List', margin, 58);

  const now = new Date();
  doc.setFontSize(9);
  doc.setTextColor(...CHAMPAGNE);
  doc.text(`${events.length} total clients`, margin, 76);
  doc.text(
    `Generated ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${generatedBy ? ` by ${generatedBy}` : ''}`,
    pageWidth - margin, 76, { align: 'right' },
  );

  let y = 120;

  for (const section of SECTIONS) {
    const rows = events.filter(e => e.status === section.key);
    if (rows.length === 0) continue;

    if (y > 700) { doc.addPage(); y = 60; }

    doc.setTextColor(...INK);
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text(`${section.label} (${rows.length})`, margin, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'striped',
      styles: { font: 'helvetica', fontSize: 9.5, cellPadding: 7, textColor: INK },
      headStyles: { fillColor: section.color, textColor: 255, fontStyle: 'bold' },
      head: [['Client Name', 'Event Date', 'Contract', 'Venue']],
      body: rows
        .slice()
        .sort((a, b) => {
          if (!a.eventDate) return 1;
          if (!b.eventDate) return -1;
          return new Date(a.eventDate) - new Date(b.eventDate);
        })
        .map(e => [
          e.clientName,
          formatDate(e.eventDate),
          e.contractStatus === 'signed' ? 'Signed' : 'Pending',
          e.venue || '—',
        ]),
    });

    y = doc.lastAutoTable.finalY + 26;
  }

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

  doc.save(`soiree-hub-clients-${now.toISOString().slice(0, 10)}.pdf`);
}
