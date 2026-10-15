import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';
import { deviceService } from '../services/device.service';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storage';
import { DevicePlatform } from '../types/device.types';

export function useDeviceRegistration() {
  const { isAuthenticated, user } = useAuth();
  const registeredRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      registeredRef.current = false;
      return;
    }

    if (registeredRef.current) return;

    const registerCurrentDevice = async () => {
      try {
        let deviceToken = await storage.getItem<string>(STORAGE_KEYS.DEVICE_TOKEN);

        if (!deviceToken) {
          // Generate an installation device UUID token
          const randomHex = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          deviceToken = `dev_${Platform.OS}_${Date.now()}_${randomHex}`;
          await storage.setItem(STORAGE_KEYS.DEVICE_TOKEN, deviceToken);
        }

        const platform: DevicePlatform =
          Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';

        await deviceService.registerDevice({
          deviceToken,
          platform,
          provider: 'expo',
        });

        registeredRef.current = true;
      } catch (error) {
        console.warn('[useDeviceRegistration] Failed to register device token:', error);
      }
    };

    registerCurrentDevice();
  }, [isAuthenticated, user]);
}
