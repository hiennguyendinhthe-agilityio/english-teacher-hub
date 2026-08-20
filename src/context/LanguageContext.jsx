import React, { createContext, useContext, useState } from 'react';
import { translations, getStoredLanguage, setStoredLanguage } from '../services/i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getStoredLanguage());

  const setLanguage = (newLang) => {
    setLangState(newLang);
    setStoredLanguage(newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const isEn = lang === 'en';
  const isVi = lang === 'vi';

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t, isEn, isVi }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
