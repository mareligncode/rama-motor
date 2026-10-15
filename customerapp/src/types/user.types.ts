export type UserRole = 'sender' | 'driver' | 'vehicle_owner' | 'staff' | 'admin';

export type AccountStatus = 'pending' | 'active' | 'suspended' | 'deactivated';

export interface NationalIdImage {
  front?: string | null;
  back?: string | null;
}

export interface NationalIdDetail {
  fanNumber?: string | null;
  finNumber?: string | null;
  image?: NationalIdImage | null;
}

export interface User {
  _id: string;
  id?: string;
  fullName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  normalizedPhone: string;
  roles: UserRole[];
  accountStatus: AccountStatus;
  suspensionReason?: string | null;
  nationalIdDetail?: NationalIdDetail | null;
  nationalIdVerifiedAt?: string | null;
  nationalIdVerified?: boolean;
  phoneVerifiedAt?: string | null;
  profileImageUrl?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
