import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Target, Sparkles } from 'lucide-react';
import { CityHealthProvider } from '@/data/providers';
import { useProviderOnboarding } from '@/hooks/useProviderOnboarding';
import { OnboardingStep } from './OnboardingStep';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProviderOnboardingChecklistProps {
  providerData: CityHealthProvider | null;
  verificationStatus?: string;
  onNavigateToTab: (tab: string) => void;
  className?: string;
}

export function ProviderOnboardingChecklist({
  providerData,
  verificationStatus,
  onNavigateToTab,
  className,
}: ProviderOnboardingChecklistProps) {
  const {
    steps,
    currentStepIndex,
    completedSteps,
    totalSteps,
    overallProgress,
    isOnboardingComplete,
    milestones,
  } = useProviderOnboarding(providerData, verificationStatus);

  const handleStepAction = (step: typeof steps[0]) => {
    if (step.action.tab) {
      onNavigateToTab(step.action.tab);
      if (step.action.scrollTo) {
        setTimeout(() => {
          const element = document.getElementById(step.action.scrollTo!);
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  };

  const getStatusText = () => {
    if (milestones.verified) return 'Profil vérifié et actif';
    if (milestones.verificationSubmitted) return 'En attente de vérification';
    if (milestones.profileComplete) return 'Téléchargez vos documents';
    if (milestones.halfwayComplete) return 'Vous êtes à mi-chemin';
    return 'Complétez votre profil';
  };

  return (
    <Card className={cn('border-0 shadow-sm', className)}>
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isOnboardingComplete ? "bg-primary/10" : "bg-muted"
            )}>
              {isOnboardingComplete 
                ? <Sparkles className="h-4 w-4 text-primary" />
                : <Target className="h-4 w-4 text-muted-foreground" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold">Parcours d'inscription</p>
              <p className="text-[11px] text-muted-foreground">{getStatusText()}</p>
            </div>
          </div>
          <div className="text-right">
            <motion.span
              key={overallProgress}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                'text-xl font-bold',
                isOnboardingComplete ? 'text-primary' : 'text-foreground'
              )}
            >
              {overallProgress}%
            </motion.span>
            <p className="text-[10px] text-muted-foreground">{completedSteps}/{totalSteps}</p>
          </div>
        </div>

        {/* Progress track */}
        <div className="flex gap-1 mb-5">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-500',
                step.isComplete
                  ? 'bg-primary'
                  : index === currentStepIndex
                  ? 'bg-primary/40'
                  : 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Milestone badges */}
        {(milestones.halfwayComplete || milestones.profileComplete) && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {milestones.halfwayComplete && !milestones.profileComplete && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0 font-normal bg-amber-500/10 text-amber-600 border-0">
                🎯 Mi-parcours
              </Badge>
            )}
            {milestones.profileComplete && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0 font-normal bg-primary/10 text-primary border-0">
                ✅ Profil complet
              </Badge>
            )}
            {milestones.documentsUploaded && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0 font-normal bg-purple-500/10 text-purple-600 border-0">
                📄 Documents OK
              </Badge>
            )}
            {milestones.verified && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0 font-normal bg-primary/10 text-primary border-0">
                ✓ Vérifié
              </Badge>
            )}
          </div>
        )}

        {/* Steps */}
        <div className="space-y-0.5">
          {steps.map((step, index) => (
            <OnboardingStep
              key={step.id}
              step={step}
              stepNumber={index + 1}
              isCurrentStep={index === currentStepIndex}
              onAction={() => handleStepAction(step)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
