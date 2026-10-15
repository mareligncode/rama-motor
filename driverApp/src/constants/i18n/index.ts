import { en } from './en';
import { am } from './am';
import { or } from './or';
import { ti } from './ti';
import { LanguageCode, TranslationKeys } from './types';

export * from './types';

export const TRANSLATIONS: Record<LanguageCode, TranslationKeys> = {
  en,
  am,
  or,
  ti,
};

export const DEFAULT_LANGUAGE: LanguageCode = 'en';
