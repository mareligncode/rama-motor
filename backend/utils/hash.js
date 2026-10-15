import crypto from 'crypto';

/**
 * Creates SHA-256 hash for OTP code
 * @param {string} code
 * @returns {string} Hex encoded hash
 */
export function hashOtp(code) {
  if (!code || typeof code !== 'string') {
    throw new Error('Code must be a string');
  }
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
}

/**
 * Secure constant-time comparison of OTP code with stored hash
 * @param {string} code - Plaintext OTP
 * @param {string} storedHash - Stored hex hash
 * @returns {boolean}
 */
export function verifyOtpHash(code, storedHash) {
  if (!code || !storedHash) return false;
  try {
    const computedHash = hashOtp(code);
    const bufA = Buffer.from(computedHash, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export default {
  hashOtp,
  verifyOtpHash,
};
