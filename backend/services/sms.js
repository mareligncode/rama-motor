import axios from 'axios';
import { toSmsMsisdn } from '../utils/phone.js';

const SMS_API_URL = process.env.SMS_ETHIOPIA_URL || 'https://smsethiopia.com/api/sms/send';

/**
 * Sends an SMS message using SMS Ethiopia gateway
 * @param {object} params
 * @param {string} params.phoneNumber - Recipient phone number (Ethiopian)
 * @param {string} params.text - Message content
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function sendSms({ phoneNumber, text }) {
  try {
    const apiKey = process.env.SMS_ETHIOPIA_API_KEY;
    const msisdn = toSmsMsisdn(phoneNumber);

    if (!apiKey || apiKey === 'YOUR_SMS_ETHIOPIA_API_KEY') {
      console.warn(
        `[SMS Service] Warning: SMS_ETHIOPIA_API_KEY not configured. [MOCK SMS] to ${msisdn}: "${text}"`
      );
      return {
        success: true,
        data: {
          mock: true,
          msisdn,
          text,
          messageId: `mock_${Date.now()}`,
        },
      };
    }

    const response = await axios.post(
      SMS_API_URL,
      {
        msisdn,
        text,
      },
      {
        headers: {
          KEY: apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to send SMS';

    console.error(`[SMS Service Error] To: ${phoneNumber} - ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export default {
  sendSms,
};
