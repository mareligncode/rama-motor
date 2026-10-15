import express from 'express';
import {
  getProfileController,
  updateProfileController,
  updateNationalIdController,
  getAllUsersController,
  getUserByIdController,
  updateUserStatusController,
  verifyUserNationalIdController,
} from '../controllers/user.js';
import { protect, authorize } from '../middleware/auth.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();

// Current user profile endpoints
router.get('/profile', protect, getProfileController);
router.put('/profile', protect, updateProfileController);
router.post('/national-id', protect, updateNationalIdController);

// Admin & Staff user management endpoints
router.get('/', protect, authorize('admin', 'staff'), getAllUsersController);
router.get('/:id', protect, authorize('admin', 'staff'), getUserByIdController);
router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'staff'),
  requireFields(['status']),
  updateUserStatusController
);
router.patch(
  '/:id/verify-national-id',
  protect,
  authorize('admin', 'staff'),
  verifyUserNationalIdController
);

export default router;
