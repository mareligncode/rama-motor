import React, { createContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';
import {
  LanguageCode,
  LanguageOption,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  DEFAULT_LANGUAGE,
  TranslationKeys,
} from '../constants/i18n';

export interface LanguageContextType {
  language: LanguageCode;
  translations: TranslationKeys;
  supportedLanguages: LanguageOption[];
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (keyPath: string, fallback?: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE_CODE);
        if (saved && (saved === 'en' || saved === 'am' || saved === 'or' || saved === 'ti')) {
          setLanguageState(saved as LanguageCode);
        }
      } catch (err) {
        console.warn('Failed to load saved language', err);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE_CODE, lang);
    } catch (err) {
      console.warn('Failed to persist language', err);
    }
  };

  const translations = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Type-safe dot notation translator: t('auth.loginTitle')
  const t = (keyPath: string, fallback?: string): string => {
    const parts = keyPath.split('.');
    let current: any = translations;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        // Fallback to English if missing
        let fallbackVal: any = TRANSLATIONS.en;
        for (const fPart of parts) {
          if (fallbackVal && typeof fallbackVal === 'object' && fPart in fallbackVal) {
            fallbackVal = fallbackVal[fPart];
          } else {
            fallbackVal = undefined;
            break;
          }
        }
        return typeof fallbackVal === 'string' ? fallbackVal : fallback || keyPath;
      }
    }
    return typeof current === 'string' ? current : fallback || keyPath;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        translations,
        supportedLanguages: SUPPORTED_LANGUAGES,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
