export type Language = 'en' | 'ky';

export interface TranslationObject {
  [key: string]: string | TranslationObject;
}

export interface Translations {
  en: TranslationObject;
  ky: TranslationObject;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export interface I18nConfig {
  defaultLanguage: Language;
  fallbackLanguage: Language;
  storageKey: string;
}