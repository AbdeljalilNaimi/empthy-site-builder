import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, X, ArrowDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const text = {
  fr: 'Professionnel de santé ? Rejoignez-nous gratuitement',
  ar: 'متخصص في الرعاية الصحية؟ انضم إلينا مجانًا',
  en: 'Healthcare professional? Join us for free',
};

export const FloatingProviderBanner = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const section = document.getElementById('inscription-provider');
      const sectionTop = section?.getBoundingClientRect().top ?? Infinity;
      // Show after 600px scroll, hide when section is in view
      setVisible(y > 600 && sectionTop > window.innerHeight);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    document.getElementById('inscription-provider')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40"
        >
          <button
            onClick={handleClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all text-sm font-medium group"
          >
            <Stethoscope className="h-4 w-4" />
            <span>{text[language]}</span>
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-3 w-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
