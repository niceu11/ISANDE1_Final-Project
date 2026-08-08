// Minimal CSV handling for client import/export. Deliberately dependency-free:
// the `xlsx` package on npm is stuck on an old build with unresolved high-severity
// prototype-pollution/ReDoS advisories, and `exceljs` drags in a heavy legacy toolchain
// for a feature this small. Excel opens/saves CSV natively, so it covers the same workflow.

const HEADER_MAP = {
  'client name': 'clientName',
  'contact': 'contact',
  'email': 'email',
  'event date': 'eventDate',
  'event type': 'eventType',
  'venue': 'venue',
  'guest count': 'guestCount',
  'status': 'status',
  'contract status': 'contractStatus',
};

export const TEMPLATE_HEADERS = ['Client Name', 'Contact', 'Email', 'Event Date', 'Event Type', 'Venue', 'Guest Count', 'Status', 'Contract Status'];
const TEMPLATE_EXAMPLE = ['Dela Cruz Wedding', '+63 917 000 0000', 'delacruz@email.com', '2026-11-20', 'Wedding Reception', 'Grand Ballroom', '150', 'confirmed', 'signed'];

function parseCsvText(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  const pushField = () => { row.push(field); field = ''; };
  const pushRow = () => { rows.push(row); row = []; };

  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += char; i++; continue;
    }
    if (char === '"') { inQuotes = true; i++; continue; }
    if (char === ',') { pushField(); i++; continue; }
    if (char === '\r') { i++; continue; }
    if (char === '\n') { pushField(); pushRow(); i++; continue; }
    field += char; i++;
  }
  if (field.length > 0 || row.length > 0) { pushField(); pushRow(); }

  return rows.filter(r => r.some(cell => cell.trim() !== ''));
}

export function csvToClientRows(text) {
  const table = parseCsvText(text);
  if (table.length < 2) return [];
  const headers = table[0].map(h => HEADER_MAP[h.trim().toLowerCase()] ?? null);
  return table.slice(1).map(cells => {
    const obj = {};
    headers.forEach((key, idx) => {
      if (key) obj[key] = (cells[idx] ?? '').trim();
    });
    return obj;
  });
}

function csvEscape(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function downloadTextFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadClientImportTemplate() {
  const csv = [TEMPLATE_HEADERS, TEMPLATE_EXAMPLE].map(row => row.map(csvEscape).join(',')).join('\r\n');
  downloadTextFile('soiree-hub-client-import-template.csv', csv, 'text/csv;charset=utf-8;');
}
