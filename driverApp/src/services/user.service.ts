import { apiClient } from './api.client';
import { API_ENDPOINTS } from '../constants/api';
import { User, NationalIdDetail } from '../types/user.types';
import { ApiResponse } from '../types/api.types';

export const userService = {
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return apiClient.get<{ user: User }>(API_ENDPOINTS.USERS.PROFILE);
  },

  async updateProfile(data: {
    fullName?: string;
    profileImageUrl?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    return apiClient.put<{ user: User }>(API_ENDPOINTS.USERS.PROFILE, data);
  },

  async updateNationalId(data: {
    fanNumber?: string;
    finNumber?: string;
    frontImage?: string;
    backImage?: string;
  }): Promise<
    ApiResponse<{
      nationalIdDetail: NationalIdDetail;
      nationalIdVerifiedAt: string | null;
    }>
  > {
    return apiClient.post<{
      nationalIdDetail: NationalIdDetail;
      nationalIdVerifiedAt: string | null;
    }>(API_ENDPOINTS.USERS.NATIONAL_ID, data);
  },
};
