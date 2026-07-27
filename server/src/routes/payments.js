import { Router } from 'express';
import Payment from '../models/Payment.js';
import Event from '../models/Event.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

router.get('/featured', asyncHandler(async (req, res) => {
  const featuredEvent = await Event.findOne({ featured: true });
  const payment = featuredEvent
    ? await Payment.findOne({ eventId: featuredEvent._id })
    : await Payment.findOne().sort({ createdAt: 1 });
  if (!payment) return res.status(404).json({ error: 'No payments found' });
  res.json(payment);
}));

router.get('/', asyncHandler(async (req, res) => {
  const payments = await Payment.find().sort({ eventDate: 1 });
  res.json(payments);
}));

router.get('/event/:eventId', asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ eventId: req.params.eventId });
  if (!payment) return res.status(404).json({ error: 'Payment not found for this event' });
  res.json(payment);
}));

router.patch('/event/:eventId/verify', asyncHandler(async (req, res) => {
  const { field } = req.body; // 'downpayment' | 'balance'
  if (!['downpayment', 'balance'].includes(field)) {
    return res.status(400).json({ error: 'field must be "downpayment" or "balance"' });
  }
  const payment = await Payment.findOne({ eventId: req.params.eventId });
  if (!payment) return res.status(404).json({ error: 'Payment not found for this event' });

  payment[field].status = 'verified';
  payment.history.push({
    label: `${field === 'downpayment' ? 'Downpayment' : 'Balance'} verified`,
    date: new Date(),
    amount: payment[field].amount,
    status: 'verified',
  });
  await payment.save();
  res.json(payment);
}));

export default router;
