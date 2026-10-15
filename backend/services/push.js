import axios from 'axios';

const EXPO_PUSH_URL = process.env.EXPO_PUSH_URL || 'https://exp.host/--/api/v2/push/send';

/**
 * Sends push notification(s) via Expo Push API
 * @param {object} params
 * @param {string|string[]} params.to - Expo push token or array of tokens
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body
 * @param {object} [params.data] - Custom data payload
 * @param {string} [params.sound] - Notification sound (default: 'default')
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function sendPushNotification({
  to,
  title,
  body,
  data = {},
  sound = 'default',
}) {
  try {
    if (!to || (Array.isArray(to) && to.length === 0)) {
      throw new Error('Push token ("to") is required');
    }

    const payload = {
      to,
      sound,
      title,
      body,
      data,
    };

    const response = await axios.post(EXPO_PUSH_URL, payload, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      'Failed to send push notification';

    console.error(`[Push Service Error] ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export default {
  sendPushNotification,
};
