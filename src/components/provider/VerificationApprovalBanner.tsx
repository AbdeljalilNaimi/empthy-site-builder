import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playApprovalSound, playRejectionSound } from '@/utils/notificationSound';

type BannerType = 'approved' | 'rejected' | null;

interface VerificationApprovalBannerProps {
  providerId: string;
}

const STORAGE_KEY_PREFIX = 'provider_approval_notif_';

export function getApprovalBannerKey(providerId: string) {
  return `${STORAGE_KEY_PREFIX}${providerId}`;
}

export function setApprovalNotification(providerId: string, type: 'approved' | 'rejected') {
  localStorage.setItem(getApprovalBannerKey(providerId), type);
}

export function VerificationApprovalBanner({ providerId }: VerificationApprovalBannerProps) {
  const [bannerType, setBannerType] = useState<BannerType>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(getApprovalBannerKey(providerId));
    if (stored === 'approved' || stored === 'rejected') {
      setBannerType(stored);
      setVisible(true);

      // Play sound
      if (stored === 'approved') {
        playApprovalSound();
      } else {
        playRejectionSound();
      }

      // Auto-dismiss after 30s
      const timer = setTimeout(() => dismiss(), 30000);
      return () => clearTimeout(timer);
    }
  }, [providerId]);

  const dismiss = () => {
    setVisible(false);
    localStorage.removeItem(getApprovalBannerKey(providerId));
  };

  if (!bannerType) return null;

  const isApproved = bannerType === 'approved';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className={`mb-6 relative overflow-hidden rounded-xl border p-5 shadow-lg ${
            isApproved
              ? 'border-green-500/30 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10'
              : 'border-destructive/30 bg-gradient-to-r from-destructive/10 via-red-500/10 to-orange-500/10'
          }`}
        >
          {/* Floating particles for approval */}
          {isApproved && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-green-400/40"
                  initial={{ 
                    x: `${15 + i * 15}%`, 
                    y: '100%', 
                    opacity: 0 
                  }}
                  animate={{ 
                    y: '-20%', 
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{ 
                    duration: 3, 
                    delay: i * 0.3, 
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex items-start gap-4 relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
              className={`flex-shrink-0 p-2.5 rounded-full ${
                isApproved ? 'bg-green-500/20' : 'bg-destructive/20'
              }`}
            >
              {isApproved ? (
                <PartyPopper className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-destructive" />
              )}
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`font-bold text-lg ${
                  isApproved ? 'text-green-700 dark:text-green-400' : 'text-destructive'
                }`}
              >
                {isApproved
                  ? '🎉 Félicitations ! Votre compte est vérifié !'
                  : 'Vérification refusée'}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-muted-foreground mt-1"
              >
                {isApproved
                  ? 'Votre profil est maintenant visible publiquement dans les recherches. Vous pouvez recevoir des rendez-vous et créer des annonces.'
                  : 'Veuillez vérifier vos documents et soumettre une nouvelle demande de vérification.'}
              </motion.p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={dismiss}
              className="flex-shrink-0 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
