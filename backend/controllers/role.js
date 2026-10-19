import Role from '../models/role.js';
import Staff from '../models/staff.js';
import { ALL_PERMISSIONS } from '../utils/seedRoles.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc Get catalog of all system permissions
 * @route GET /api/v1/roles/permissions
 * @access Private (admin, staff)
 */
export async function getPermissionsListController(req, res, next) {
  try {
    return successResponse(res, {
      statusCode: 200,
      message: 'System permissions retrieved',
      data: {
        permissions: ALL_PERMISSIONS,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get all roles with optional filtering
 * @route GET /api/v1/roles
 * @access Private (admin, staff)
 */
export async function getAllRolesController(req, res, next) {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && ['active', 'inactive'].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const roles = await Role.find(query).sort({ createdAt: -1 });

    // Include assigned staff count for each role
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const staffCount = await Staff.countDocuments({
          roleId: role._id,
          deletedAt: null,
        });
        const roleObj = role.toObject();
        roleObj.staffCount = staffCount;
        return roleObj;
      })
    );

    return successResponse(res, {
      statusCode: 200,
      message: 'Roles retrieved successfully',
      data: {
        roles: rolesWithCounts,
        total: rolesWithCounts.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get single role by ID
 * @route GET /api/v1/roles/:id
 * @access Private (admin, staff)
 */
export async function getRoleByIdController(req, res, next) {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Role not found',
      });
    }

    const staffCount = await Staff.countDocuments({
      roleId: role._id,
      deletedAt: null,
    });

    const roleData = role.toObject();
    roleData.staffCount = staffCount;

    return successResponse(res, {
      statusCode: 200,
      data: { role: roleData },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Create new role
 * @route POST /api/v1/roles
 * @access Private (admin, staff with roles:write)
 */
export async function createRoleController(req, res, next) {
  try {
    const { name, description, permissions = [], status = 'active' } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Role name is required',
      });
    }

    const existingRole = await Role.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
    });

    if (existingRole) {
      return errorResponse(res, {
        statusCode: 409,
        message: `Role with name '${name.trim()}' already exists`,
      });
    }

    const role = await Role.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      permissions: Array.isArray(permissions) ? permissions : [],
      status: ['active', 'inactive'].includes(status) ? status : 'active',
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Role created successfully',
      data: { role },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Update existing role
 * @route PUT /api/v1/roles/:id
 * @access Private (admin, staff with roles:write)
 */
export async function updateRoleController(req, res, next) {
  try {
    const { name, description, permissions, status } = req.body;
    const role = await Role.findById(req.params.id);

    if (!role) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Role not found',
      });
    }

    if (name && name.trim() !== role.name) {
      const existingName = await Role.findOne({
        _id: { $ne: role._id },
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
      });
      if (existingName) {
        return errorResponse(res, {
          statusCode: 409,
          message: `Role with name '${name.trim()}' already exists`,
        });
      }
      role.name = name.trim();
    }

    if (description !== undefined) role.description = description.trim();
    if (permissions !== undefined && Array.isArray(permissions)) {
      role.permissions = permissions;
    }
    if (status && ['active', 'inactive'].includes(status)) {
      role.status = status;
    }

    await role.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Role updated successfully',
      data: { role },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Delete or deactivate a role
 * @route DELETE /api/v1/roles/:id
 * @access Private (admin, staff with roles:delete)
 */
export async function deleteRoleController(req, res, next) {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Role not found',
      });
    }

    // Safety check: Cannot delete if assigned to active staff members
    const assignedStaffCount = await Staff.countDocuments({
      roleId: role._id,
      deletedAt: null,
    });

    if (assignedStaffCount > 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Cannot delete role. It is currently assigned to ${assignedStaffCount} staff member(s). Reassign them first or set role status to inactive.`,
      });
    }

    // Protect Super Admin role from deletion
    if (role.name.toLowerCase() === 'super admin') {
      return errorResponse(res, {
        statusCode: 403,
        message: 'The Super Admin role cannot be deleted',
      });
    }

    await Role.findByIdAndDelete(role._id);

    return successResponse(res, {
      statusCode: 200,
      message: 'Role deleted successfully',
      data: { id: role._id },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getPermissionsListController,
  getAllRolesController,
  getRoleByIdController,
  createRoleController,
  updateRoleController,
  deleteRoleController,
};
