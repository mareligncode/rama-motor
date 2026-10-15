import { useContext } from 'react';
import { DriverDutyContext } from '../contexts/DriverDutyContext';

export function useDriverDuty() {
  const context = useContext(DriverDutyContext);
  if (!context) {
    throw new Error('useDriverDuty must be used within a DriverDutyProvider');
  }
  return context;
}
