import { apiClient } from './api.client';
import { API_ENDPOINTS } from '../constants/api';
import {
  RequestOtpPayload,
  RequestOtpResponseData,
  VerifyOtpPayload,
  VerifyOtpResponseData,
  VerifyFaydaPayload,
  VerifyFaydaResponseData,
} from '../types/auth.types';
import { User } from '../types/user.types';
import { ApiResponse } from '../types/api.types';

export const authService = {
  /**
   * Request OTP for login or phone verification
   */
  async requestOtp(payload: RequestOtpPayload): Promise<ApiResponse<RequestOtpResponseData>> {
    return apiClient.post<RequestOtpResponseData>(API_ENDPOINTS.AUTH.REQUEST_OTP, {
      phoneNumber: payload.phoneNumber,
      purpose: payload.purpose || 'login',
    });
  },

  /**
   * Verify OTP and get JWT authentication token
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<ApiResponse<VerifyOtpResponseData>> {
    return apiClient.post<VerifyOtpResponseData>(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      phoneNumber: payload.phoneNumber,
      code: payload.code,
      purpose: payload.purpose || 'login',
      fullName: payload.fullName,
      role: payload.role || 'sender',
    });
  },

  /**
   * Verify Ethiopian Fayda National ID
   */
  async verifyFayda(payload: VerifyFaydaPayload): Promise<ApiResponse<VerifyFaydaResponseData>> {
    return apiClient.post<VerifyFaydaResponseData>(API_ENDPOINTS.AUTH.VERIFY_FAYDA, payload);
  },

  /**
   * Get authenticated user profile
   */
  async getMe(): Promise<ApiResponse<{ user: User }>> {
    return apiClient.get<{ user: User }>(API_ENDPOINTS.AUTH.ME);
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<null>> {
    return apiClient.post<null>(API_ENDPOINTS.AUTH.LOGOUT);
  },
};
