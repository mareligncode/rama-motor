import { apiClient } from './api.client';
import { API_ENDPOINTS } from '../constants/api';
import { RegisterDevicePayload, UserDevice } from '../types/device.types';
import { ApiResponse } from '../types/api.types';

export const deviceService = {
  /**
   * Register or update push notification device token
   */
  async registerDevice(payload: RegisterDevicePayload): Promise<ApiResponse<{ device: UserDevice }>> {
    return apiClient.post<{ device: UserDevice }>(API_ENDPOINTS.DEVICES.REGISTER, payload);
  },

  /**
   * Unregister a device token (e.g., on logout)
   */
  async unregisterDevice(deviceToken: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(API_ENDPOINTS.DEVICES.UNREGISTER(encodeURIComponent(deviceToken)));
  },

  /**
   * Get all registered devices for the current user
   */
  async getMyDevices(): Promise<ApiResponse<{ devices: UserDevice[] }>> {
    return apiClient.get<{ devices: UserDevice[] }>(API_ENDPOINTS.DEVICES.LIST);
  },
};
