import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  PartyPopper, 
  BadgeCheck, 
  ArrowRight,
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';

type CelebrationType = 'halfway' | 'profile-complete' | 'documents-uploaded' | 'verified';

interface OnboardingCelebrationProps {
  type: CelebrationType;
  providerName?: string;
  onContinue: () => void;
}

const celebrationConfig: Record<CelebrationType, {
  icon: typeof Sparkles;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
  buttonLabel: string;
  emoji: string;
}> = {
  halfway: {
    icon: Trophy,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    title: 'Mi-parcours atteint !',
    description: 'Vous avez complété la moitié de votre profil. Continuez, vous y êtes presque !',
    buttonLabel: 'Continuer',
    emoji: '🎯',
  },
  'profile-complete': {
    icon: PartyPopper,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    title: 'Profil complet !',
    description: 'Excellent travail ! Votre profil est maintenant complet. Téléchargez vos documents pour obtenir le badge vérifié.',
    buttonLabel: 'Télécharger les documents',
    emoji: '🎉',
  },
  'documents-uploaded': {
    icon: Sparkles,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    title: 'Documents envoyés !',
    description: 'Vos documents ont été reçus. Notre équipe les vérifiera sous 48h.',
    buttonLabel: 'Voir le statut',
    emoji: '📄',
  },
  verified: {
    icon: BadgeCheck,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
    title: 'Félicitations !',
    description: 'Votre profil est maintenant vérifié ! Vous pouvez créer des annonces et recevoir des rendez-vous.',
    buttonLabel: 'Voir mon profil',
    emoji: '✅',
  },
};

export function OnboardingCelebration({
  type,
  providerName,
  onContinue,
}: OnboardingCelebrationProps) {
  const config = celebrationConfig[type];
  const Icon = config.icon;

  return (
    <div className="p-6 text-center space-y-6">
      {/* Animated icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={`w-20 h-20 mx-auto rounded-full ${config.bgColor} flex items-center justify-center`}
      >
        <Icon className={`h-10 w-10 ${config.iconColor}`} />
      </motion.div>

      {/* Emoji burst */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl"
      >
        {config.emoji}
      </motion.div>

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold">
          {config.title}
          {providerName && type === 'verified' && `, ${providerName}`}
        </h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          {config.description}
        </p>
      </motion.div>

      {/* Decorative dots */}
      <div className="flex justify-center gap-2">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            className={`w-2 h-2 rounded-full ${config.bgColor}`}
          />
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button onClick={onContinue} className="gap-2" size="lg">
          {config.buttonLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}
