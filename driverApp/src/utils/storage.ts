import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async getItem<T = string>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.warn(`[Storage] Failed to get item for key: ${key}`, error);
      return null;
    }
  },

  async setItem<T = any>(key: string, value: T): Promise<boolean> {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.warn(`[Storage] Failed to set item for key: ${key}`, error);
      return false;
    }
  },

  async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[Storage] Failed to remove item for key: ${key}`, error);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.warn(`[Storage] Failed to clear storage`, error);
      return false;
    }
  },
};
