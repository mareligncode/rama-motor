import User from '../models/user.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc Get current user profile
 * @route GET /api/v1/users/profile
 * @access Private
 */
export async function getProfileController(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, {
      statusCode: 200,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Update current user profile
 * @route PUT /api/v1/users/profile
 * @access Private
 */
export async function updateProfileController(req, res, next) {
  try {
    const { fullName, profileImageUrl } = req.body;
    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName.trim();
    if (profileImageUrl !== undefined) user.profileImageUrl = profileImageUrl;

    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Submit or update National ID information
 * @route POST /api/v1/users/national-id
 * @access Private
 */
export async function updateNationalIdController(req, res, next) {
  try {
    const { fanNumber, finNumber, frontImage, backImage } = req.body;
    const user = await User.findById(req.user._id);

    user.nationalIdDetail = {
      fanNumber: fanNumber || user.nationalIdDetail?.fanNumber || null,
      finNumber: finNumber || user.nationalIdDetail?.finNumber || null,
      image: {
        front: frontImage || user.nationalIdDetail?.image?.front || null,
        back: backImage || user.nationalIdDetail?.image?.back || null,
      },
    };

    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'National ID details saved successfully',
      data: {
        nationalIdDetail: user.nationalIdDetail,
        nationalIdVerifiedAt: user.nationalIdVerifiedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get list of all users (Admin/Staff only)
 * @route GET /api/v1/users
 * @access Private (Admin, Staff)
 */
export async function getAllUsersController(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
    } = req.query;

    const query = { deletedAt: null };

    if (role) {
      query.roles = role;
    }
    if (status) {
      query.accountStatus = status;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { normalizedPhone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    return successResponse(res, {
      statusCode: 200,
      data: { users },
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get user by ID (Admin/Staff)
 * @route GET /api/v1/users/:id
 * @access Private (Admin, Staff)
 */
export async function getUserByIdController(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'User not found',
      });
    }

    return successResponse(res, {
      statusCode: 200,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Update user account status (suspend, activate, deactivate)
 * @route PATCH /api/v1/users/:id/status
 * @access Private (Admin, Staff)
 */
export async function updateUserStatusController(req, res, next) {
  try {
    const { status, suspensionReason } = req.body;

    if (!['pending', 'active', 'suspended', 'deactivated'].includes(status)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid status. Must be pending, active, suspended, or deactivated',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'User not found',
      });
    }

    user.accountStatus = status;
    user.suspensionReason = status === 'suspended' ? suspensionReason || null : null;
    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: `User status updated to ${status}`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Verify or reject a user's National ID (Admin/Staff)
 * @route PATCH /api/v1/users/:id/verify-national-id
 * @access Private (Admin, Staff)
 */
export async function verifyUserNationalIdController(req, res, next) {
  try {
    const { verified = true } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'User not found',
      });
    }

    user.nationalIdVerifiedAt = verified ? new Date() : null;
    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: verified ? 'National ID marked as verified' : 'National ID marked as unverified',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getProfileController,
  updateProfileController,
  updateNationalIdController,
  getAllUsersController,
  getUserByIdController,
  updateUserStatusController,
  verifyUserNationalIdController,
};
