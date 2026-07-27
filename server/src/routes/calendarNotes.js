import { Router } from 'express';
import CalendarNote from '../models/CalendarNote.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const notes = await CalendarNote.find().sort({ date: 1 });
  res.json(notes);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { date, text, type, createdBy, createdByRole } = req.body;
  if (!date || !text) return res.status(400).json({ error: 'date and text are required' });
  const note = await CalendarNote.create({
    date,
    text,
    type: ['note', 'deadline', 'announcement'].includes(type) ? type : 'note',
    createdBy,
    createdByRole,
  });
  res.status(201).json(note);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const note = await CalendarNote.findByIdAndDelete(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json({ ok: true });
}));

export default router;
