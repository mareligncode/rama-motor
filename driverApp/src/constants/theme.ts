export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  mint: string;
  mintText: string;
  softMint: string;
  secondary: string;
  accent: string;
  warning: string;
  danger: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  border: string;
  inputBackground: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
}

export const LIGHT_THEME: ThemeColors = {
  primary: '#00684A',
  primaryDark: '#005038',
  primaryLight: '#008E5E',
  mint: '#E6F4EE',
  mintText: '#00684A',
  softMint: '#F0F9F5',
  secondary: '#111827',
  accent: '#00A86B',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F8FAF9',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  card: '#FFFFFF',
  border: '#E2E8F0',
  inputBackground: '#F8FAF9',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
};

export const DARK_THEME: ThemeColors = {
  primary: '#00A86B',
  primaryDark: '#00684A',
  primaryLight: '#34D399',
  mint: '#0E3A2B',
  mintText: '#4ADE80',
  softMint: '#0B291E',
  secondary: '#F8FAFC',
  accent: '#10B981',
  warning: '#FBBF24',
  danger: '#F87171',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceVariant: '#334155',
  card: '#1E293B',
  border: '#334155',
  inputBackground: '#131F33',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',
};

export const THEME = {
  colors: LIGHT_THEME,
  darkColors: DARK_THEME,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};
