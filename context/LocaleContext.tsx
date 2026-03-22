
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

// Define the shape of the locale context
interface LocaleContextType {
  locale: string;
  setLocale: (newLocale: string) => void;
  t: (key: string) => string; // Translation function
}

// Create the context with a default (null) value
const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Load translations dynamically
const loadTranslations = async (locale: string) => {
  try {
    const response = await fetch(`/locales/${locale}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for locale: ${locale}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error loading translations for ${locale}:`, error);
    return {};
  }
};

// Locale Provider component
export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>(() => {
    // Initialize locale from localStorage or default to 'en'
    return localStorage.getItem('dreamWeaverLocale') || 'en';
  });
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Load translations whenever the locale changes
    loadTranslations(locale).then(setTranslations);
    // REMOVED: localStorage.setItem('dreamWeaverLocale', locale); from here.
    // Saving to localStorage should only happen when the user explicitly selects a language
    // via handleLanguageSelect in App.tsx. This prevents 'en' from being written
    // immediately on first load, allowing the language selector to appear.
  }, [locale]);

  // Translation function
  const t = useCallback((key: string): string => {
    return translations[key] || key; // Return key if translation not found
  }, [translations]);

  // Function to update the locale
  const setLocale = useCallback((newLocale: string) => {
    setLocaleState(newLocale);
    // localStorage.setItem('dreamWeaverLocale', newLocale); // App.tsx's handleLanguageSelect already does this
  }, []);

  const contextValue = { locale, setLocale, t };

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
};

// Custom hook to use the locale context
export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};