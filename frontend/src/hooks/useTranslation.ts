import { useContext } from 'react';
import { LanguageContext } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/utils/language';
import { Language } from '@/types/i18n';

/**
 * Custom hook for accessing translations and language functionality
 */
export function useTranslation() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }

  const { language, setLanguage } = context;

  /**
   * Translate function that gets a translation for the current language
   * @param key - Translation key (e.g., "navigation.home")
   * @param params - Optional parameters for interpolation (e.g., {name: "John"})
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    return getTranslation(key, language, params);
  };

  /**
   * Switch to a specific language
   */
  const switchLanguage = (newLanguage: Language): void => {
    setLanguage(newLanguage);
  };

  /**
   * Toggle between English and Kyrgyz
   */
  const toggleLanguage = (): void => {
    const newLanguage = language === 'en' ? 'ky' : 'en';
    setLanguage(newLanguage);
  };

  return {
    language,
    t,
    setLanguage,
    switchLanguage,
    toggleLanguage
  };
}