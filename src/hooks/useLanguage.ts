import { useLanguage as useLanguageContext } from '@/contexts/LanguageContext';

// Legacy single-key translation wrapper for backward compatibility
export const useLanguage = () => {
  const { language, setLanguage, t: tNew, isRTL } = useLanguageContext();

  // Legacy translation function that accepts a single dot-notation key
  const t = (key: string): string => {
    // Support both old format (single key like 'nav.home') and new format
    const parts = key.split('.');
    if (parts.length === 2) {
      const [section, subkey] = parts;
      try {
        return tNew(section as any, subkey as any);
      } catch {
        return key;
      }
    }
    return key;
  };

  return { language, setLanguage, t, tNew, isRTL };
};
