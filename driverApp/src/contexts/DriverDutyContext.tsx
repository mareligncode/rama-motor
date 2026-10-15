import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storage';
import { DeliveryDutyStatus, PriorityLevel } from '../types/user.types';

interface DriverDutyContextType {
  isOnline: boolean;
  dutyStatus: DeliveryDutyStatus;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  todayDeliveries: number;
  todayEarnings: number;
  toggleDuty: () => Promise<void>;
  setOnlineStatus: (status: boolean) => Promise<void>;
}

export const DriverDutyContext = createContext<DriverDutyContextType | undefined>(undefined);

export const DriverDutyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [dutyStatus, setDutyStatus] = useState<DeliveryDutyStatus>('offline');
  const [priorityScore] = useState<number>(95);
  const [priorityLevel] = useState<PriorityLevel>('high');
  const [todayDeliveries] = useState<number>(8);
  const [todayEarnings] = useState<number>(1450);

  useEffect(() => {
    const restoreDuty = async () => {
      const stored = await storage.getItem<string>(STORAGE_KEYS.DUTY_STATUS);
      if (stored === 'available') {
        setIsOnline(true);
        setDutyStatus('available');
      } else {
        setIsOnline(false);
        setDutyStatus('offline');
      }
    };
    restoreDuty();
  }, []);

  const toggleDuty = async () => {
    const nextOnline = !isOnline;
    const nextStatus: DeliveryDutyStatus = nextOnline ? 'available' : 'offline';
    setIsOnline(nextOnline);
    setDutyStatus(nextStatus);
    await storage.setItem(STORAGE_KEYS.DUTY_STATUS, nextStatus);
  };

  const setOnlineStatus = async (status: boolean) => {
    const nextStatus: DeliveryDutyStatus = status ? 'available' : 'offline';
    setIsOnline(status);
    setDutyStatus(nextStatus);
    await storage.setItem(STORAGE_KEYS.DUTY_STATUS, nextStatus);
  };

  return (
    <DriverDutyContext.Provider
      value={{
        isOnline,
        dutyStatus,
        priorityScore,
        priorityLevel,
        todayDeliveries,
        todayEarnings,
        toggleDuty,
        setOnlineStatus,
      }}
    >
      {children}
    </DriverDutyContext.Provider>
  );
};
