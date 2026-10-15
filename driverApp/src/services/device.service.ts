import { apiClient } from './api.client';
import { API_ENDPOINTS } from '../constants/api';
import { RegisterDevicePayload, UserDevice } from '../types/device.types';
import { ApiResponse } from '../types/api.types';

export const deviceService = {
  async registerDevice(payload: RegisterDevicePayload): Promise<ApiResponse<{ device: UserDevice }>> {
    return apiClient.post<{ device: UserDevice }>(API_ENDPOINTS.DEVICES.REGISTER, payload);
  },

  async unregisterDevice(deviceToken: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(API_ENDPOINTS.DEVICES.UNREGISTER(encodeURIComponent(deviceToken)));
  },

  async getMyDevices(): Promise<ApiResponse<{ devices: UserDevice[] }>> {
    return apiClient.get<{ devices: UserDevice[] }>(API_ENDPOINTS.DEVICES.LIST);
  },
};
