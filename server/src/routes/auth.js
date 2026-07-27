import { Router } from 'express';
import User from '../models/User.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ name: user.name, email: user.email, role: user.role, title: user.title });
}));

export default router;
