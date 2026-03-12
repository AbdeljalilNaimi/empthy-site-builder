import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileWelcomeBannerProps {
  userId: string;
  score: number;
}

const STORAGE_KEY_PREFIX = 'cityhealth_welcome_banner_dismissed_';

export function ProfileWelcomeBanner({ userId, score }: ProfileWelcomeBannerProps) {
  const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
  const [dismissed, setDismissed] = useState(true); // default hidden to avoid flash

  useEffect(() => {
    const wasDismissed = localStorage.getItem(storageKey) === 'true';
    setDismissed(wasDismissed);

    if (!wasDismissed && score < 50) {
      toast.info('Complétez votre profil médical pour débloquer toutes les fonctionnalités !', {
        duration: 6000,
      });
    }
  }, [storageKey, score]);

  if (dismissed || score >= 50) return null;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setDismissed(true);
  };

  return (
    <Alert className="mb-6 border-primary/30 bg-primary/5 relative">
      <Heart className="h-5 w-5 text-primary" />
      <AlertTitle className="font-semibold">Bienvenue sur CityHealth !</AlertTitle>
      <AlertDescription className="text-sm text-muted-foreground pr-8">
        Complétez votre profil médical pour débloquer toutes les fonctionnalités et potentiellement sauver des vies.
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
