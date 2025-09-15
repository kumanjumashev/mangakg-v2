import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Language, LanguageContextType } from '@/types/i18n';
import { getStoredLanguage, storeLanguage } from '@/lib/i18n';
import { getTranslation } from '@/lib/utils/language';

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Initialize language state with stored preference or browser detection
  const [language, setLanguageState] = useState<Language>(() => {
    return getStoredLanguage();
  });

  // Function to change language and persist to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    storeLanguage(newLanguage);
  };

  // Translation function that uses current language
  const t = (key: string, params?: Record<string, string | number>): string => {
    return getTranslation(key, language, params);
  };

  // Initialize language on mount (client-side only)
  useEffect(() => {
    const initialLanguage = getStoredLanguage();
    if (initialLanguage !== language) {
      setLanguageState(initialLanguage);
    }
  }, []);

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}