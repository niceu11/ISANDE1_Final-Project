import { Router } from 'express';
import Event from '../models/Event.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

router.get('/featured', asyncHandler(async (req, res) => {
  const event = await Event.findOne({ featured: true }) ?? await Event.findOne().sort({ createdAt: 1 });
  if (!event) return res.status(404).json({ error: 'No events found' });
  res.json(event);
}));

router.get('/', asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ eventDate: 1 });
  res.json(events);
}));

router.get('/availability', asyncHandler(async (req, res) => {
  const { date, excludeId } = req.query;
  if (!date) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(dayStart.getTime())) return res.status(400).json({ error: 'Invalid date' });
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const query = {
    eventDate: { $gte: dayStart, $lt: dayEnd },
    status: { $in: ['confirmed', 'pencil'] },
  };
  if (excludeId) query._id = { $ne: excludeId };
  const conflicts = await Event.find(query).select('clientName venue status eventDate');
  res.json({ available: conflicts.length === 0, conflicts });
}));

const STATUS_VALUES = ['hot', 'warm', 'cold', 'pencil', 'confirmed'];
const CONTRACT_VALUES = ['signed', 'pending'];

router.post('/import', asyncHandler(async (req, res) => {
  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'rows array is required' });
  }

  const docs = rows
    .filter(r => r.clientName && String(r.clientName).trim())
    .map(r => {
      const parsedDate = r.eventDate ? new Date(r.eventDate) : null;
      return {
        clientName: String(r.clientName).trim(),
        contact: r.contact ? String(r.contact).trim() : '',
        email: r.email ? String(r.email).trim() : '',
        eventDate: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined,
        eventType: r.eventType ? String(r.eventType).trim() : '',
        venue: r.venue ? String(r.venue).trim() : '',
        guestCount: Number(r.guestCount) || 0,
        status: STATUS_VALUES.includes(r.status) ? r.status : 'warm',
        contractStatus: CONTRACT_VALUES.includes(r.contractStatus) ? r.contractStatus : 'pending',
        lastActivityAt: new Date(),
        notes: [{ date: new Date(), author: 'Import', text: 'Imported from spreadsheet.' }],
      };
    });

  if (docs.length === 0) {
    return res.status(400).json({ error: 'No valid rows to import — Client Name is required in every row' });
  }

  const inserted = await Event.insertMany(docs);
  res.status(201).json({ imported: inserted.length, skipped: rows.length - docs.length });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
}));

router.patch('/:id/quick-note', asyncHandler(async (req, res) => {
  const { quickNote } = req.body;
  const event = await Event.findByIdAndUpdate(req.params.id, { quickNote }, { new: true });
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
}));

const FOLLOWUP_LABEL = { sms: 'SMS', call: 'phone call', email: 'email' };

router.patch('/:id/follow-up', asyncHandler(async (req, res) => {
  const { method = 'sms', author = '', authorRole = '' } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const label = FOLLOWUP_LABEL[method] ?? method;
  event.notes.unshift({
    date: new Date(),
    author: author || authorRole || 'System',
    text: `Follow-up sent via ${label}.`,
  });
  event.followupsCompleted = Math.min(event.followupsCompleted + 1, event.followupsTotal);
  event.lastActivityAt = new Date();
  await event.save();
  res.json(event);
}));

router.post('/:id/suppliers', asyncHandler(async (req, res) => {
  const { role, company, contact } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  event.suppliers.push({ role, company, contact, status: 'pending' });
  await event.save();
  res.status(201).json(event);
}));

router.patch('/:id/suppliers/:supplierId', asyncHandler(async (req, res) => {
  const { status, contact, company } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const supplier = event.suppliers.id(req.params.supplierId);
  if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
  if (status) supplier.status = status;
  if (contact) supplier.contact = contact;
  if (company) supplier.company = company;
  await event.save();
  res.json(event);
}));

router.post('/:id/suppliers/:supplierId/alternates', asyncHandler(async (req, res) => {
  const { name, contact } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const supplier = event.suppliers.id(req.params.supplierId);
  if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
  supplier.alternates.push({ name, contact });
  await event.save();
  res.status(201).json(event);
}));

router.post('/:id/suppliers/:supplierId/alternates/:altId/promote', asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const supplier = event.suppliers.id(req.params.supplierId);
  if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
  const alt = supplier.alternates.id(req.params.altId);
  if (!alt) return res.status(404).json({ error: 'Alternate not found' });

  const previousPrimary = { name: supplier.company, contact: supplier.contact };
  supplier.company = alt.name;
  supplier.contact = alt.contact;
  supplier.status = 'pending';
  supplier.alternates.pull(alt._id);
  supplier.alternates.push(previousPrimary);
  await event.save();
  res.json(event);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { clientName, contact, eventDate, eventType, venue, ceremony, notes } = req.body;
  const event = await Event.create({
    clientName,
    contact,
    eventDate: eventDate || undefined,
    eventType: ceremony ? `${eventType} (${ceremony})` : eventType,
    venue,
    status: 'warm',
    contractStatus: 'pending',
    lastActivityAt: new Date(),
    notes: notes ? [{ date: new Date(), author: 'You', text: 'Initial inquiry logged.' }] : [],
  });
  res.status(201).json(event);
}));

export default router;
