import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  FileText, 
  Camera, 
  BadgeCheck,
  ArrowRight,
  User,
  Award,
  Upload,
  Send,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingWelcomeProps {
  providerName?: string;
  onGetStarted: () => void;
}

const allSteps = [
  { icon: User, title: 'Informations de base', description: 'Nom, email et téléphone', phase: 0 },
  { icon: MapPin, title: 'Localisation', description: 'Adresse et coordonnées GPS', phase: 0 },
  { icon: FileText, title: 'Description & Horaires', description: 'Présentez votre pratique', phase: 0 },
  { icon: Award, title: 'Licence professionnelle', description: 'Numéro d\'agrément', phase: 1 },
  { icon: Camera, title: 'Photos du cabinet', description: 'Montrez votre établissement', phase: 1 },
  { icon: Upload, title: 'Documents officiels', description: 'Licence + pièce d\'identité', phase: 1 },
  { icon: Send, title: 'Soumettre pour vérification', description: 'Envoi pour validation', phase: 2 },
  { icon: BadgeCheck, title: 'Obtenir le badge vérifié', description: 'Visible publiquement', phase: 2 },
];

const phases = [
  { label: 'Identité', emoji: '👤', description: 'Vos informations de base' },
  { label: 'Preuves', emoji: '📋', description: 'Documents et photos' },
  { label: 'Validation', emoji: '✅', description: 'Vérification finale' },
];

export function OnboardingWelcome({ providerName, onGetStarted }: OnboardingWelcomeProps) {
  const [activePhase, setActivePhase] = useState(0);
  const phaseSteps = allSteps.filter(s => s.phase === activePhase);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="w-14 h-14 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center"
        >
          <Sparkles className="h-7 w-7 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold tracking-tight">
          Bienvenue{providerName ? `, ${providerName}` : ''} !
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          8 étapes simples pour activer votre profil professionnel.
        </p>
      </div>

      {/* Phase Tabs */}
      <div className="flex gap-2">
        {phases.map((phase, idx) => (
          <button
            key={phase.label}
            onClick={() => setActivePhase(idx)}
            className={cn(
              'flex-1 relative rounded-xl p-3 text-center transition-all duration-300 border',
              activePhase === idx
                ? 'bg-primary/10 border-primary/30 shadow-sm'
                : 'bg-card border-border hover:bg-muted/50'
            )}
          >
            <span className="text-xl">{phase.emoji}</span>
            <p className={cn(
              'text-xs font-semibold mt-1',
              activePhase === idx ? 'text-primary' : 'text-foreground'
            )}>
              {phase.label}
            </p>
            {activePhase === idx && (
              <motion.div
                layoutId="phase-indicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Phase description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={activePhase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-muted-foreground text-center"
        >
          {phases[activePhase].description}
        </motion.p>
      </AnimatePresence>

      {/* Steps for active phase */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-2"
        >
          {phaseSteps.map((step, idx) => {
            const Icon = step.icon;
            const globalNum = allSteps.indexOf(step) + 1;
            return (
              <div
                key={step.title}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/60 transition-colors"
              >
                {/* Number circle */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <span className="absolute -top-1 -left-1 w-4.5 h-4.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {globalNum}
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5">
        {phases.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActivePhase(idx)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              activePhase === idx ? 'w-6 bg-primary' : 'w-1.5 bg-border'
            )}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="space-y-2.5">
        <Button onClick={onGetStarted} className="w-full gap-2 h-12 text-sm font-semibold rounded-xl shadow-md shadow-primary/20" size="lg">
          Commencer l'inscription
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-[11px] text-center text-muted-foreground">
          ⏱️ ~15 min • Sauvegarde automatique à chaque étape
        </p>
      </div>
    </div>
  );
}
