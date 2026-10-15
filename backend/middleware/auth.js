import User from '../models/user.js';
import { verifyJwt } from '../utils/jwt.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Authentication Middleware
 * Protects routes requiring valid JWT token
 */
export async function protect(req, res, next) {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Not authorized. No token provided.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyJwt(token);
    } catch (jwtError) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Not authorized. Token is invalid or expired.',
        error: jwtError.message,
      });
    }

    // Find active user
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Check account status
    if (user.accountStatus === 'suspended' || user.accountStatus === 'deactivated') {
      return errorResponse(res, {
        statusCode: 403,
        message: `Account is ${user.accountStatus}. ${user.suspensionReason || ''}`,
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-based Authorization Middleware
 * @param  {...string} allowedRoles
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Not authenticated.',
      });
    }

    const userRoles = req.user.roles || [];
    const hasRole = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return errorResponse(res, {
        statusCode: 403,
        message: `Forbidden: requires one of the following roles: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
}

export default {
  protect,
  authorize,
};
