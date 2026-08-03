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
