import { Router } from 'express';
import Payment from '../models/Payment.js';
import Event from '../models/Event.js';
import { asyncHandler } from '../asyncHandler.js';
import { logAudit } from '../audit.js';

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

router.patch('/event/:eventId/upload-proof', asyncHandler(async (req, res) => {
  const { field, fileName, author = '', authorRole = '' } = req.body; // 'downpayment' | 'balance'
  if (!['downpayment', 'balance'].includes(field)) {
    return res.status(400).json({ error: 'field must be "downpayment" or "balance"' });
  }
  const payment = await Payment.findOne({ eventId: req.params.eventId });
  if (!payment) return res.status(404).json({ error: 'Payment not found for this event' });

  payment[field].proofUploaded = true;
  payment[field].proofFileName = fileName || 'proof-of-payment';
  payment[field].proofUploadedAt = new Date();
  if (payment[field].status !== 'verified') payment[field].status = 'pending';

  payment.history.push({
    label: `${field === 'downpayment' ? 'Downpayment' : 'Balance'} proof submitted — awaiting verification`,
    date: new Date(),
    amount: payment[field].amount,
    status: 'pending',
  });
  await payment.save();

  await logAudit({
    action: 'payment.proof_uploaded',
    entityType: 'payment',
    entityId: payment._id,
    entityLabel: payment.clientName,
    actorName: author,
    actorRole: authorRole,
    detail: `Uploaded proof of payment for ${field} (${payment[field].proofFileName})`,
  });
  res.json(payment);
}));

router.patch('/event/:eventId/verify', asyncHandler(async (req, res) => {
  const { field, author = '', authorRole = '' } = req.body; // 'downpayment' | 'balance'
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

  await logAudit({
    action: 'payment.verified',
    entityType: 'payment',
    entityId: payment._id,
    entityLabel: payment.clientName,
    actorName: author,
    actorRole: authorRole,
    detail: `Verified ${field} of ${payment[field].amount.toLocaleString('en-PH')} for ${payment.clientName}`,
  });
  res.json(payment);
}));

export default router;
