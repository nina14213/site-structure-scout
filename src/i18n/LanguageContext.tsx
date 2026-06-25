import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Language, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'dwc-data-quest-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'pl' || saved === 'fr' || saved === 'de') return saved;
    } catch (err) {
      void err;
    }
    return 'pl';
  });

  // Sync <html lang> z bieżącym językiem — WCAG 3.1.1 (Language of Page)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (err) { void err; }
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || translations['pl'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback for HMR boundary breaks — return Polish defaults
    console.warn('useLanguage called outside LanguageProvider — using fallback');
    return {
      language: 'pl' as Language,
      setLanguage: () => {},
      t: (key: string) => translations['pl']?.[key] || key,
    };
  }
  return context;
}

export default LanguageContext;
