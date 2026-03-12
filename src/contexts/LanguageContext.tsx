import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { translations, Language, Translations } from '@/i18n/translations';

type TranslationKey = keyof Translations;
type NestedKey<T> = T extends object ? keyof T : never;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <S extends TranslationKey, K extends NestedKey<Translations[S]>>(
    section: S,
    key: K
  ) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ch_language');
    return (saved as Language) || 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ch_language', lang);
  };

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    
    if (language === 'ar') {
      document.body.classList.add('font-tajawal');
      document.body.classList.remove('font-inter');
    } else {
      document.body.classList.add('font-inter');
      document.body.classList.remove('font-tajawal');
    }
  }, [language, isRTL]);

  const t = <S extends TranslationKey, K extends NestedKey<Translations[S]>>(
    section: S,
    key: K
  ): string => {
    try {
      const sectionData = translations[language][section];
      if (sectionData && typeof sectionData === 'object') {
        return (sectionData as any)[key] || `${String(section)}.${String(key)}`;
      }
      return `${String(section)}.${String(key)}`;
    } catch {
      return `${String(section)}.${String(key)}`;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-tajawal' : 'font-inter'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
