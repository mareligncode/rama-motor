export type DevicePlatform = 'android' | 'ios' | 'web';
export type DeviceProvider = 'expo' | 'fcm';

export interface UserDevice {
  _id: string;
  userId: string;
  deviceToken: string;
  platform: DevicePlatform;
  provider: DeviceProvider;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterDevicePayload {
  deviceToken: string;
  platform: DevicePlatform;
  provider?: DeviceProvider;
}
