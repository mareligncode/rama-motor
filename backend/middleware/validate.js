import { errorResponse } from '../utils/apiResponse.js';
import { isValidEthiopianPhone } from '../utils/phone.js';

/**
 * Validates that specific required fields exist in req.body
 * @param {string[]} fields
 */
export function requireFields(fields = []) {
  return (req, res, next) => {
    const missing = fields.filter(
      (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ''
    );

    if (missing.length > 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Missing required field(s): ${missing.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Validates Ethiopian phone number in req.body
 * @param {string} [fieldName='phoneNumber']
 */
export function validatePhone(fieldName = 'phoneNumber') {
  return (req, res, next) => {
    const phone = req.body[fieldName];
    if (!phone) {
      return errorResponse(res, {
        statusCode: 400,
        message: `${fieldName} is required`,
      });
    }

    if (!isValidEthiopianPhone(phone)) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Invalid Ethiopian phone number in "${fieldName}". Expected format: 09XXXXXXXX, 07XXXXXXXX, or +251XXXXXXXXX`,
      });
    }

    next();
  };
}

export default {
  requireFields,
  validatePhone,
};
