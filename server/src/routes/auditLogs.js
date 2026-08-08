import { Router } from 'express';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(300);
  res.json(logs);
}));

export default router;
