import jwt from 'jsonwebtoken';

/**
 * Signs a JWT token with user payload
 * @param {object} payload
 * @param {string} [expiresIn]
 * @returns {string}
 */
export function signJwt(payload, expiresIn) {
  const secret = process.env.JWT_SECRET || 'rama_motor_delivery_jwt_secret_dev_key_2026';
  const duration = expiresIn || process.env.JWT_EXPIRES_IN || '30d';

  return jwt.sign(payload, secret, {
    expiresIn: duration,
  });
}

/**
 * Verifies and decodes a JWT token
 * @param {string} token
 * @returns {object} Decoded payload
 */
export function verifyJwt(token) {
  const secret = process.env.JWT_SECRET || 'rama_motor_delivery_jwt_secret_dev_key_2026';
  return jwt.verify(token, secret);
}

export default {
  signJwt,
  verifyJwt,
};
