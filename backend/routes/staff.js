import express from 'express';
import {
  getStaffDepartmentsController,
  getStaffMeController,
  getAllStaffsController,
  getStaffByIdController,
  createStaffController,
  updateStaffController,
  updateStaffStatusController,
  deleteStaffController,
} from '../controllers/staff.js';
import { protect, authorize } from '../middleware/auth.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();

// Current logged in staff profile
router.get('/me', protect, getStaffMeController);

// Reference data
router.get('/departments', protect, authorize('admin', 'staff'), getStaffDepartmentsController);

// Staffs CRUD
router.get('/', protect, authorize('admin', 'staff'), getAllStaffsController);
router.get('/:id', protect, authorize('admin', 'staff'), getStaffByIdController);
router.post(
  '/',
  protect,
  authorize('admin', 'staff'),
  requireFields(['roleId', 'department']),
  createStaffController
);
router.put('/:id', protect, authorize('admin', 'staff'), updateStaffController);
router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'staff'),
  requireFields(['status']),
  updateStaffStatusController
);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteStaffController);

export default router;
