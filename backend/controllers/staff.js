import Staff from '../models/staff.js';
import User from '../models/user.js';
import Role from '../models/role.js';
import { normalizeEthiopianPhone } from '../utils/phone.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const VALID_DEPARTMENTS = [
  'operations',
  'finance',
  'accounting',
  'audit',
  'legal',
  'customer_support',
  'security',
  'management',
];

/**
 * @desc Get list of valid staff departments
 * @route GET /api/v1/staffs/departments
 * @access Private (admin, staff)
 */
export async function getStaffDepartmentsController(req, res, next) {
  try {
    return successResponse(res, {
      statusCode: 200,
      data: { departments: VALID_DEPARTMENTS },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get current authenticated staff member profile
 * @route GET /api/v1/staffs/me
 * @access Private (staff)
 */
export async function getStaffMeController(req, res, next) {
  try {
    const staff = await Staff.findOne({ userId: req.user._id, deletedAt: null })
      .populate('userId', 'fullName phoneNumber normalizedPhone profileImageUrl accountStatus')
      .populate('roleId', 'name description permissions status')
      .populate('assignedBy', 'fullName');

    if (!staff) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'No active staff profile found for current user account',
      });
    }

    return successResponse(res, {
      statusCode: 200,
      data: { staff },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get all staff members with filtering and search
 * @route GET /api/v1/staffs
 * @access Private (admin, staff)
 */
export async function getAllStaffsController(req, res, next) {
  try {
    const { department, status, search, roleId } = req.query;
    const query = { deletedAt: null };

    if (department && VALID_DEPARTMENTS.includes(department)) {
      query.department = department;
    }

    if (status && ['active', 'suspended', 'inactive'].includes(status)) {
      query.status = status;
    }

    if (roleId) {
      query.roleId = roleId;
    }

    let staffs = await Staff.find(query)
      .populate('userId', 'fullName phoneNumber normalizedPhone profileImageUrl accountStatus')
      .populate('roleId', 'name description permissions status')
      .populate('assignedBy', 'fullName')
      .sort({ createdAt: -1 });

    if (search) {
      const searchLower = search.toLowerCase();
      staffs = staffs.filter((s) => {
        const staffCodeMatch = s.staffCode?.toLowerCase().includes(searchLower);
        const nameMatch = s.userId?.fullName?.toLowerCase().includes(searchLower);
        const phoneMatch = s.userId?.phoneNumber?.includes(searchLower);
        const roleMatch = s.roleId?.name?.toLowerCase().includes(searchLower);
        return staffCodeMatch || nameMatch || phoneMatch || roleMatch;
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Staff members retrieved successfully',
      data: {
        staffs,
        total: staffs.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get single staff profile by ID
 * @route GET /api/v1/staffs/:id
 * @access Private (admin, staff)
 */
export async function getStaffByIdController(req, res, next) {
  try {
    const staff = await Staff.findOne({ _id: req.params.id, deletedAt: null })
      .populate('userId', 'fullName phoneNumber normalizedPhone profileImageUrl accountStatus nationalIdDetail')
      .populate('roleId', 'name description permissions status')
      .populate('assignedBy', 'fullName');

    if (!staff) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Staff member not found',
      });
    }

    return successResponse(res, {
      statusCode: 200,
      data: { staff },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Create / Register a new staff member
 * @route POST /api/v1/staffs
 * @access Private (admin, staff with staff:write)
 */
export async function createStaffController(req, res, next) {
  try {
    const {
      userId,
      phoneNumber,
      fullName,
      roleId,
      department,
      staffCode,
      status = 'active',
    } = req.body;

    if (!roleId) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Role ID is required',
      });
    }

    if (!department || !VALID_DEPARTMENTS.includes(department)) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Department is invalid. Allowed: ${VALID_DEPARTMENTS.join(', ')}`,
      });
    }

    // Verify role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Assigned role does not exist',
      });
    }

    let targetUserId = userId;

    // If userId not provided, locate or create user via phoneNumber
    if (!targetUserId) {
      if (!phoneNumber) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'Either userId or phoneNumber + fullName must be provided',
        });
      }

      const normalizedPhone = normalizeEthiopianPhone(phoneNumber);
      let user = await User.findOne({ normalizedPhone });

      if (!user) {
        user = await User.create({
          fullName: fullName ? fullName.trim() : `Staff_${normalizedPhone.slice(-4)}`,
          phoneCountryCode: '+251',
          phoneNumber: normalizedPhone.replace('+251', '0'),
          normalizedPhone,
          phoneVerifiedAt: new Date(),
          roles: ['staff'],
          accountStatus: 'active',
        });
      } else {
        if (!user.roles.includes('staff')) {
          user.roles.push('staff');
          await user.save();
        }
      }
      targetUserId = user._id;
    } else {
      const user = await User.findById(targetUserId);
      if (!user) {
        return errorResponse(res, {
          statusCode: 404,
          message: 'User not found',
        });
      }
      if (!user.roles.includes('staff')) {
        user.roles.push('staff');
        await user.save();
      }
    }

    // Check if user already has an active staff profile
    const existingStaff = await Staff.findOne({ userId: targetUserId, deletedAt: null });
    if (existingStaff) {
      return errorResponse(res, {
        statusCode: 409,
        message: 'This user already has an active staff profile',
      });
    }

    // Auto-generate staff code if not supplied
    let resolvedCode = staffCode ? staffCode.trim().toUpperCase() : null;
    if (!resolvedCode) {
      const count = await Staff.countDocuments();
      resolvedCode = `STF-${String(count + 1).padStart(4, '0')}`;
    }

    // Verify staffCode uniqueness
    const codeConflict = await Staff.findOne({ staffCode: resolvedCode });
    if (codeConflict) {
      return errorResponse(res, {
        statusCode: 409,
        message: `Staff code '${resolvedCode}' is already taken`,
      });
    }

    const newStaff = await Staff.create({
      userId: targetUserId,
      roleId: role._id,
      staffCode: resolvedCode,
      department,
      assignedBy: req.user ? req.user._id : null,
      status: ['active', 'suspended', 'inactive'].includes(status) ? status : 'active',
    });

    const populatedStaff = await Staff.findById(newStaff._id)
      .populate('userId', 'fullName phoneNumber normalizedPhone profileImageUrl accountStatus')
      .populate('roleId', 'name description permissions status')
      .populate('assignedBy', 'fullName');

    return successResponse(res, {
      statusCode: 201,
      message: 'Staff member created successfully',
      data: { staff: populatedStaff },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Update staff details (role, department, staffCode)
 * @route PUT /api/v1/staffs/:id
 * @access Private (admin, staff with staff:write)
 */
export async function updateStaffController(req, res, next) {
  try {
    const { roleId, department, staffCode } = req.body;
    const staff = await Staff.findOne({ _id: req.params.id, deletedAt: null });

    if (!staff) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Staff member not found',
      });
    }

    if (roleId) {
      const role = await Role.findById(roleId);
      if (!role) {
        return errorResponse(res, {
          statusCode: 404,
          message: 'Assigned role does not exist',
        });
      }
      staff.roleId = roleId;
    }

    if (department) {
      if (!VALID_DEPARTMENTS.includes(department)) {
        return errorResponse(res, {
          statusCode: 400,
          message: `Department is invalid. Allowed: ${VALID_DEPARTMENTS.join(', ')}`,
        });
      }
      staff.department = department;
    }

    if (staffCode && staffCode.trim().toUpperCase() !== staff.staffCode) {
      const resolvedCode = staffCode.trim().toUpperCase();
      const codeConflict = await Staff.findOne({
        _id: { $ne: staff._id },
        staffCode: resolvedCode,
      });
      if (codeConflict) {
        return errorResponse(res, {
          statusCode: 409,
          message: `Staff code '${resolvedCode}' is already taken`,
        });
      }
      staff.staffCode = resolvedCode;
    }

    await staff.save();

    const updatedStaff = await Staff.findById(staff._id)
      .populate('userId', 'fullName phoneNumber normalizedPhone profileImageUrl accountStatus')
      .populate('roleId', 'name description permissions status')
      .populate('assignedBy', 'fullName');

    return successResponse(res, {
      statusCode: 200,
      message: 'Staff profile updated successfully',
      data: { staff: updatedStaff },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Update staff member status (active, suspended, inactive)
 * @route PATCH /api/v1/staffs/:id/status
 * @access Private (admin, staff with staff:write)
 */
export async function updateStaffStatusController(req, res, next) {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'inactive'].includes(status)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Status must be active, suspended, or inactive',
      });
    }

    const staff = await Staff.findOne({ _id: req.params.id, deletedAt: null });
    if (!staff) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Staff member not found',
      });
    }

    staff.status = status;
    await staff.save();

    return successResponse(res, {
      statusCode: 200,
      message: `Staff status updated to ${status}`,
      data: { id: staff._id, status: staff.status },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Soft delete a staff member
 * @route DELETE /api/v1/staffs/:id
 * @access Private (admin, staff with staff:delete)
 */
export async function deleteStaffController(req, res, next) {
  try {
    const staff = await Staff.findOne({ _id: req.params.id, deletedAt: null });
    if (!staff) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Staff member not found',
      });
    }

    staff.deletedAt = new Date();
    staff.status = 'inactive';
    await staff.save();

    // Optionally remove 'staff' role from user if they don't have another profile
    const user = await User.findById(staff.userId);
    if (user && user.roles.includes('staff')) {
      user.roles = user.roles.filter((r) => r !== 'staff');
      if (user.roles.length === 0) user.roles = ['sender'];
      await user.save();
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Staff member removed successfully',
      data: { id: staff._id },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getStaffDepartmentsController,
  getStaffMeController,
  getAllStaffsController,
  getStaffByIdController,
  createStaffController,
  updateStaffController,
  updateStaffStatusController,
  deleteStaffController,
};
