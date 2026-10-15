import express from 'express';
import {
  requestOtpController,
  verifyOtpController,
  verifyFaydaController,
  getMeController,
  logoutController,
} from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';
import { validatePhone, requireFields } from '../middleware/validate.js';

const router = express.Router();

// Public auth endpoints
router.post(
  '/request-otp',
  validatePhone('phoneNumber'),
  requestOtpController
);

router.post(
  '/verify-otp',
  requireFields(['phoneNumber', 'code']),
  validatePhone('phoneNumber'),
  verifyOtpController
);

// Protected auth endpoints
router.post('/fayda/verify', protect, verifyFaydaController);
router.get('/me', protect, getMeController);
router.post('/logout', protect, logoutController);

export default router;
