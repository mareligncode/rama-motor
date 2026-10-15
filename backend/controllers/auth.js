import User from '../models/user.js';
import { createAndSendOtp, verifyOtp } from '../services/otp.js';
import { verifyFaydaNationalId } from '../services/fayda.js';
import { normalizeEthiopianPhone } from '../utils/phone.js';
import { signJwt } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc Request OTP for phone login or verification
 * @route POST /api/v1/auth/request-otp
 * @access Public
 */
export async function requestOtpController(req, res, next) {
  try {
    const { phoneNumber, purpose = 'login' } = req.body;

    const result = await createAndSendOtp({
      phoneNumber,
      purpose,
    });

    return successResponse(res, {
      statusCode: 200,
      message: result.message,
      data: {
        expiresAt: result.expiresAt,
        otpId: result.otpId,
        ...(result.devCode ? { devCode: result.devCode } : {}),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Verify OTP and authenticate/register user
 * @route POST /api/v1/auth/verify-otp
 * @access Public
 */
export async function verifyOtpController(req, res, next) {
  try {
    const { phoneNumber, code, purpose = 'login', fullName, role = 'sender' } = req.body;

    const verification = await verifyOtp({
      phoneNumber,
      code,
      purpose,
    });

    if (!verification.valid) {
      return errorResponse(res, {
        statusCode: 400,
        message: verification.message,
      });
    }

    const normalizedPhone = normalizeEthiopianPhone(phoneNumber);

    // Find or create user
    let user = await User.findOne({ normalizedPhone });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = await User.create({
        fullName: fullName || `User_${normalizedPhone.slice(-4)}`,
        phoneCountryCode: '+251',
        phoneNumber: normalizedPhone.replace('+251', '0'),
        normalizedPhone,
        phoneVerifiedAt: new Date(),
        roles: [role],
        accountStatus: 'active',
        lastLoginAt: new Date(),
      });
    } else {
      user.phoneVerifiedAt = user.phoneVerifiedAt || new Date();
      user.lastLoginAt = new Date();
      await user.save();
    }

    // Link OTP to user
    if (verification.otpRecord) {
      verification.otpRecord.userId = user._id;
      await verification.otpRecord.save();
    }

    // Generate JWT Token
    const token = signJwt({
      id: user._id,
      phone: user.normalizedPhone,
      roles: user.roles,
    });

    return successResponse(res, {
      statusCode: isNewUser ? 201 : 200,
      message: isNewUser ? 'User registered and authenticated' : 'Authenticated successfully',
      data: {
        token,
        isNewUser,
        user: {
          id: user._id,
          fullName: user.fullName,
          phoneCountryCode: user.phoneCountryCode,
          phoneNumber: user.phoneNumber,
          normalizedPhone: user.normalizedPhone,
          roles: user.roles,
          accountStatus: user.accountStatus,
          nationalIdVerified: !!user.nationalIdVerifiedAt,
          profileImageUrl: user.profileImageUrl,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Verify Fayda National ID for current user
 * @route POST /api/v1/auth/fayda/verify
 * @access Private
 */
export async function verifyFaydaController(req, res, next) {
  try {
    const { fanNumber, finNumber, testOtp, accessToken } = req.body;
    const userId = req.user._id;

    if (!fanNumber && !finNumber && !accessToken) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Please provide fanNumber, finNumber, or an eSignet accessToken',
      });
    }

    const faydaResult = await verifyFaydaNationalId({
      fanNumber,
      finNumber,
      testOtp,
      accessToken,
    });

    if (!faydaResult.verified) {
      return errorResponse(res, {
        statusCode: 400,
        message: faydaResult.error || 'Failed to verify National ID with Fayda',
      });
    }

    // Update user record
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'User not found' });
    }

    user.nationalIdDetail = {
      ...(user.nationalIdDetail || {}),
      fanNumber: faydaResult.nationalIdDetail.fanNumber || user.nationalIdDetail?.fanNumber,
      finNumber: faydaResult.nationalIdDetail.finNumber || user.nationalIdDetail?.finNumber,
    };
    user.nationalIdVerifiedAt = new Date();
    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Fayda National ID verified successfully',
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
 * @desc Get current authenticated user profile
 * @route GET /api/v1/auth/me
 * @access Private
 */
export async function getMeController(req, res, next) {
  try {
    return successResponse(res, {
      statusCode: 200,
      message: 'User profile fetched successfully',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Logout user
 * @route POST /api/v1/auth/logout
 * @access Private
 */
export async function logoutController(req, res, next) {
  try {
    return successResponse(res, {
      statusCode: 200,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

export default {
  requestOtpController,
  verifyOtpController,
  verifyFaydaController,
  getMeController,
  logoutController,
};
