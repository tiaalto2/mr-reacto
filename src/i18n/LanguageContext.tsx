import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import fi from './fi';
import en from './en';

// Type for our translations
export type TranslationType = typeof fi;

// Available languages
export type Language = 'fi' | 'en';

// Language storage key
const LANGUAGE_STORAGE_KEY = 'mr-reacto-language';

// Map of languages to their translation files
const translations: Record<Language, TranslationType> = {
  fi,
  en
};

// Interface for our language context
interface LanguageContextType {
  language: Language;
  t: TranslationType;
  setLanguage: (lang: Language) => void;
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'fi',
  t: fi,
  setLanguage: () => {}
});

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Provider component to wrap our app
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Default to Finnish, but check localStorage
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return (savedLanguage === 'en' ? 'en' : 'fi') as Language;
  });

  // Get the translations for the current language
  const t = translations[language];

  // Function to change language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  // Update document title when language changes
  useEffect(() => {
    document.title = `${t.appName} - ${t.appTagline}`;
  }, [language, t]);

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext; 
