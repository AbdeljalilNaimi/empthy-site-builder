import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const bannerText = {
  fr: '🇩🇿 CityHealth est maintenant disponible à Sidi Bel Abbès — découvrez 500+ prestataires de santé vérifiés',
  ar: '🇩🇿 CityHealth متاح الآن في سيدي بلعباس — اكتشف أكثر من 500 مقدم رعاية صحية موثق',
  en: '🇩🇿 CityHealth is now live in Sidi Bel Abbès — discover 500+ verified healthcare providers',
};

const BANNER_DISMISS_KEY = 'cityhealth_announcement_dismissed';

export const AnnouncementBannerTop = () => {
  const [visible, setVisible] = useState(() => localStorage.getItem(BANNER_DISMISS_KEY) !== 'true');
  const { language } = useLanguage();

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative bg-gradient-to-r from-primary via-primary/90 to-blue-600 text-primary-foreground overflow-hidden"
        >
          <div className="container mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
            <p className="text-xs sm:text-sm font-medium text-center leading-snug">
              {bannerText[language]}
            </p>
            <button
              onClick={() => { localStorage.setItem(BANNER_DISMISS_KEY, 'true'); setVisible(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
