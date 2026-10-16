import { Platform } from 'react-native';

const getDevBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api/v1';
  }
  return 'http://localhost:3000/api/v1';
};

export const API_BASE_URL = getDevBaseUrl();

export const API_ENDPOINTS = {
  AUTH: {
    REQUEST_OTP: '/auth/request-otp',
    VERIFY_OTP: '/auth/verify-otp',
    VERIFY_FAYDA: '/auth/fayda/verify',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    PROFILE: '/users/profile',
    NATIONAL_ID: '/users/national-id',
  },
  DEVICES: {
    REGISTER: '/devices/register',
    UNREGISTER: (token: string) => `/devices/${token}`,
    LIST: '/devices',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
};

export const API_TIMEOUT_MS = 15000;
