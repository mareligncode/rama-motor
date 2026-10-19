import express from 'express';
import {
  getPermissionsListController,
  getAllRolesController,
  getRoleByIdController,
  createRoleController,
  updateRoleController,
  deleteRoleController,
} from '../controllers/role.js';
import { protect, authorize } from '../middleware/auth.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();

// Permissions catalog
router.get('/permissions', protect, authorize('admin', 'staff'), getPermissionsListController);

// Roles CRUD
router.get('/', protect, authorize('admin', 'staff'), getAllRolesController);
router.get('/:id', protect, authorize('admin', 'staff'), getRoleByIdController);
router.post('/', protect, authorize('admin', 'staff'), requireFields(['name']), createRoleController);
router.put('/:id', protect, authorize('admin', 'staff'), updateRoleController);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteRoleController);

export default router;
