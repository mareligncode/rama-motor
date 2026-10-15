import React, { createContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { Appearance, ColorSchemeName, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';
import { ThemeMode, ThemeColors, LIGHT_THEME, DARK_THEME } from '../constants/theme';

export interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [activeSystemScheme, setActiveSystemScheme] = useState<ColorSchemeName>(
    systemScheme || Appearance.getColorScheme() || 'light'
  );

  useEffect(() => {
    // Load persisted theme
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemeModeState(saved as ThemeMode);
        }
      } catch (err) {
        console.warn('Failed to load theme preference', err);
      }
    };
    loadTheme();

    // Listen to OS appearance changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setActiveSystemScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    } catch (err) {
      console.warn('Failed to persist theme preference', err);
    }
  };

  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return activeSystemScheme === 'dark';
  }, [themeMode, activeSystemScheme]);

  const colors = useMemo(() => {
    return isDark ? DARK_THEME : LIGHT_THEME;
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, colors, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
