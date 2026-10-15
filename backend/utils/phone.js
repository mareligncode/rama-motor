/**
 * Ethiopian Phone Number Utility
 * Handles normalization and formatting for:
 * - Ethio Telecom (starts with 09 / +2519 / 9)
 * - Safaricom Ethiopia (starts with 07 / +2517 / 7)
 */

/**
 * Normalizes any valid Ethiopian phone format to standard international E.164: +251XXXXXXXXX
 * @param {string} phone
 * @returns {string} Normalized phone number (+251911223344)
 */
export function normalizeEthiopianPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone number must be a non-empty string');
  }

  // Remove whitespace, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '').trim();

  // If starts with 00251...
  if (cleaned.startsWith('00251')) {
    cleaned = '+' + cleaned.substring(2);
  }

  // If starts with 09 or 07
  if (/^0[79]\d{8}$/.test(cleaned)) {
    return `+251${cleaned.substring(1)}`;
  }

  // If starts with 9 or 7 (9 digits total)
  if (/^[79]\d{8}$/.test(cleaned)) {
    return `+251${cleaned}`;
  }

  // If starts with 251 (no plus)
  if (/^251[79]\d{8}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  // If already starts with +251
  if (/^\+251[79]\d{8}$/.test(cleaned)) {
    return cleaned;
  }

  throw new Error(
    `Invalid Ethiopian phone number: "${phone}". Expected format: 09XXXXXXXX, 07XXXXXXXX, or +251XXXXXXXXX`
  );
}

/**
 * Converts phone number to MSISDN format required by smsethiopia.com (251XXXXXXXXX without '+')
 * @param {string} phone
 * @returns {string}
 */
export function toSmsMsisdn(phone) {
  const normalized = normalizeEthiopianPhone(phone);
  return normalized.replace('+', '');
}

/**
 * Checks if a phone number is a valid Ethiopian mobile number
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidEthiopianPhone(phone) {
  try {
    normalizeEthiopianPhone(phone);
    return true;
  } catch {
    return false;
  }
}

export default {
  normalizeEthiopianPhone,
  toSmsMsisdn,
  isValidEthiopianPhone,
};
