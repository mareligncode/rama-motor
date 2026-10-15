import UserDevice from '../models/userDevice.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc Register or update device push token
 * @route POST /api/v1/devices/register
 * @access Private
 */
export async function registerDeviceController(req, res, next) {
  try {
    const { deviceToken, platform, provider = 'expo' } = req.body;
    const userId = req.user._id;

    if (!deviceToken || !platform) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'deviceToken and platform (android, ios, web) are required',
      });
    }

    if (!['android', 'ios', 'web'].includes(platform)) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'platform must be one of: android, ios, web',
      });
    }

    // Upsert device token
    const device = await UserDevice.findOneAndUpdate(
      { deviceToken },
      {
        userId,
        platform,
        provider,
        lastSeenAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return successResponse(res, {
      statusCode: 200,
      message: 'Device registered successfully',
      data: { device },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Unregister a device token (e.g. on logout)
 * @route DELETE /api/v1/devices/:deviceToken
 * @access Private
 */
export async function unregisterDeviceController(req, res, next) {
  try {
    const { deviceToken } = req.params;
    const userId = req.user._id;

    await UserDevice.findOneAndDelete({
      deviceToken,
      userId,
    });

    return successResponse(res, {
      statusCode: 200,
      message: 'Device unregistered successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get all registered devices for current user
 * @route GET /api/v1/devices
 * @access Private
 */
export async function getMyDevicesController(req, res, next) {
  try {
    const devices = await UserDevice.find({ userId: req.user._id }).sort({
      lastSeenAt: -1,
    });

    return successResponse(res, {
      statusCode: 200,
      data: { devices },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  registerDeviceController,
  unregisterDeviceController,
  getMyDevicesController,
};
