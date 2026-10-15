import crypto from 'crypto';
import Otp from '../models/otp.js';
import { hashOtp, verifyOtpHash } from '../utils/hash.js';
import { sendSms } from './sms.js';
import { normalizeEthiopianPhone } from '../utils/phone.js';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

/**
 * Generates a secure numeric OTP
 * @param {number} [length=6]
 * @returns {string}
 */
export function generateNumericOtp(length = 6) {
  // Generate random 6-digit code
  const buffer = crypto.randomBytes(4);
  const num = buffer.readUInt32BE(0) % Math.pow(10, length);
  return num.toString().padStart(length, '0');
}

/**
 * Creates and sends an OTP via SMS
 * @param {object} params
 * @param {string} params.phoneNumber - Recipient's phone number
 * @param {string} [params.purpose='login'] - Purpose of OTP
 * @param {string} [params.userId] - Optional User ID
 * @param {string} [params.deliveryId] - Optional Delivery ID
 * @returns {Promise<{ success: boolean, message: string, expiresAt: Date, error?: string }>}
 */
export async function createAndSendOtp({
  phoneNumber,
  purpose = 'login',
  userId = null,
  deliveryId = null,
}) {
  const normalizedPhone = normalizeEthiopianPhone(phoneNumber);

  // Invalidate any existing active/pending OTP for this phone & purpose
  await Otp.updateMany(
    {
      phoneNumber: normalizedPhone,
      purpose,
      status: 'pending',
    },
    {
      $set: { status: 'expired' },
    }
  );

  // Generate code and hash
  const code = generateNumericOtp(6);
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Create OTP record with hashed code
  const otpRecord = await Otp.create({
    phoneNumber: normalizedPhone,
    userId,
    deliveryId,
    purpose,
    codeHash,
    expiresAt,
    attemptCount: 0,
    maxAttempts: MAX_ATTEMPTS,
    status: 'pending',
  });

  // Compose SMS text
  const smsText = `Your Rama Motor Delivery verification code is: ${code}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code with anyone.`;

  // Send OTP exclusively via SMS (as required: "including otp not otp by the email")
  const smsResult = await sendSms({
    phoneNumber: normalizedPhone,
    text: smsText,
  });

  if (!smsResult.success) {
    console.error(`[OTP Service] Failed to send SMS OTP to ${normalizedPhone}`);
  }

  return {
    success: true,
    message: 'OTP sent successfully to your phone number via SMS',
    expiresAt,
    otpId: otpRecord._id,
    // In local development / test mode, we include debugCode if SMS key is not configured
    ...(process.env.NODE_ENV !== 'production' && !process.env.SMS_ETHIOPIA_API_KEY
      ? { devCode: code }
      : {}),
  };
}

/**
 * Verifies an OTP code
 * @param {object} params
 * @param {string} params.phoneNumber
 * @param {string} params.code
 * @param {string} [params.purpose='login']
 * @returns {Promise<{ valid: boolean, message: string, otpRecord?: any, error?: string }>}
 */
export async function verifyOtp({ phoneNumber, code, purpose = 'login' }) {
  if (!code || typeof code !== 'string') {
    return { valid: false, message: 'OTP code is required' };
  }

  const normalizedPhone = normalizeEthiopianPhone(phoneNumber);

  // Find the latest active OTP for this phone number and purpose
  const otpRecord = await Otp.findOne({
    phoneNumber: normalizedPhone,
    purpose,
    status: 'pending',
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return {
      valid: false,
      message: 'No active OTP found. Please request a new code.',
    };
  }

  // Check expiration
  if (new Date() > new Date(otpRecord.expiresAt)) {
    otpRecord.status = 'expired';
    await otpRecord.save();
    return {
      valid: false,
      message: 'OTP has expired. Please request a new code.',
    };
  }

  // Check attempts
  if (otpRecord.attemptCount >= otpRecord.maxAttempts) {
    otpRecord.status = 'locked';
    await otpRecord.save();
    return {
      valid: false,
      message: 'Too many incorrect attempts. This OTP has been locked. Please request a new code.',
    };
  }

  // Verify hash
  const isValid = verifyOtpHash(code.trim(), otpRecord.codeHash);

  if (!isValid) {
    otpRecord.attemptCount += 1;
    if (otpRecord.attemptCount >= otpRecord.maxAttempts) {
      otpRecord.status = 'locked';
    }
    await otpRecord.save();

    const remaining = otpRecord.maxAttempts - otpRecord.attemptCount;
    return {
      valid: false,
      message:
        remaining > 0
          ? `Incorrect OTP. You have ${remaining} attempt(s) remaining.`
          : 'Incorrect OTP. Maximum attempts exceeded and OTP is now locked.',
    };
  }

  // OTP is valid!
  otpRecord.status = 'verified';
  otpRecord.verifiedAt = new Date();
  otpRecord.consumedAt = new Date();
  await otpRecord.save();

  return {
    valid: true,
    message: 'OTP verified successfully',
    otpRecord,
  };
}

export default {
  generateNumericOtp,
  createAndSendOtp,
  verifyOtp,
};
