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
