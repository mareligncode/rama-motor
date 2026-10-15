import { User, UserRole } from './user.types';

export type OtpPurpose =
  | 'login'
  | 'phone_verification'
  | 'password_reset'
  | 'delivery_pickup'
  | 'delivery_dropoff';

export interface RequestOtpPayload {
  phoneNumber: string;
  purpose?: OtpPurpose;
}

export interface RequestOtpResponseData {
  expiresAt: string;
  otpId: string;
  devCode?: string;
}

export interface VerifyOtpPayload {
  phoneNumber: string;
  code: string;
  purpose?: OtpPurpose;
  fullName?: string;
  role?: UserRole;
}

export interface VerifyOtpResponseData {
  token: string;
  isNewUser: boolean;
  user: User;
}

export interface VerifyFaydaPayload {
  fanNumber?: string;
  finNumber?: string;
  testOtp?: string;
  accessToken?: string;
}

export interface VerifyFaydaResponseData {
  nationalIdDetail: {
    fanNumber?: string | null;
    finNumber?: string | null;
  };
  nationalIdVerifiedAt: string;
}
