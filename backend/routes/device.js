import express from 'express';
import {
  registerDeviceController,
  unregisterDeviceController,
  getMyDevicesController,
} from '../controllers/device.js';
import { protect } from '../middleware/auth.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();

// Protected device management routes
router.post(
  '/register',
  protect,
  requireFields(['deviceToken', 'platform']),
  registerDeviceController
);

router.delete('/:deviceToken', protect, unregisterDeviceController);
router.get('/', protect, getMyDevicesController);

export default router;
