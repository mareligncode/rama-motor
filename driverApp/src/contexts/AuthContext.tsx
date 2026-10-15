import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/user.types';
import {
  RequestOtpPayload,
  RequestOtpResponseData,
  VerifyOtpPayload,
  VerifyFaydaPayload,
} from '../types/auth.types';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  requestOtp: (payload: RequestOtpPayload) => Promise<RequestOtpResponseData>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<{ isNewUser: boolean; user: User }>;
  verifyFayda: (payload: VerifyFaydaPayload) => Promise<void>;
  updateProfile: (data: { fullName?: string; profileImageUrl?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
        const storedUser = await storage.getItem<User>(STORAGE_KEYS.USER_DATA);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);

          try {
            const res = await authService.getMe();
            if (res?.data?.user) {
              setUser(res.data.user);
              await storage.setItem(STORAGE_KEYS.USER_DATA, res.data.user);
            }
          } catch {
            // Keep local user
          }
        }
      } catch (error) {
        console.warn('[Driver AuthContext] Session restore error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const requestOtp = useCallback(async (payload: RequestOtpPayload): Promise<RequestOtpResponseData> => {
    const res = await authService.requestOtp(payload);
    return res.data;
  }, []);

  const verifyOtp = useCallback(
    async (payload: VerifyOtpPayload): Promise<{ isNewUser: boolean; user: User }> => {
      const res = await authService.verifyOtp({
        ...payload,
        role: 'driver',
      });

      const { token: receivedToken, isNewUser, user: receivedUser } = res.data;

      setToken(receivedToken);
      setUser(receivedUser);

      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, receivedToken);
      await storage.setItem(STORAGE_KEYS.USER_DATA, receivedUser);

      return { isNewUser, user: receivedUser };
    },
    []
  );

  const verifyFayda = useCallback(async (payload: VerifyFaydaPayload): Promise<void> => {
    const res = await authService.verifyFayda(payload);
    if (res.data) {
      setUser((prev) => {
        if (!prev) return null;
        const updated: User = {
          ...prev,
          nationalIdDetail: {
            ...prev.nationalIdDetail,
            ...res.data.nationalIdDetail,
          },
          nationalIdVerifiedAt: res.data.nationalIdVerifiedAt,
          nationalIdVerified: true,
        };
        storage.setItem(STORAGE_KEYS.USER_DATA, updated);
        return updated;
      });
    }
  }, []);

  const updateProfile = useCallback(
    async (data: { fullName?: string; profileImageUrl?: string }): Promise<void> => {
      const res = await userService.updateProfile(data);
      if (res.data?.user) {
        setUser(res.data.user);
        await storage.setItem(STORAGE_KEYS.USER_DATA, res.data.user);
      }
    },
    []
  );

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const res = await authService.getMe();
      if (res?.data?.user) {
        setUser(res.data.user);
        await storage.setItem(STORAGE_KEYS.USER_DATA, res.data.user);
      }
    } catch (error) {
      console.warn('[Driver AuthContext] Failed to refresh user:', error);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch {
      // Proceed
    } finally {
      setToken(null);
      setUser(null);
      await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        requestOtp,
        verifyOtp,
        verifyFayda,
        updateProfile,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
