import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingStep as OnboardingStepType } from '@/hooks/useProviderOnboarding';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OnboardingStepProps {
  step: OnboardingStepType;
  stepNumber: number;
  isCurrentStep: boolean;
  onAction: () => void;
}

export function OnboardingStep({
  step,
  stepNumber,
  isCurrentStep,
  onAction,
}: OnboardingStepProps) {
  const getIcon = () => {
    if (step.isComplete) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <CheckCircle2 className="h-4 w-4 text-primary" />
        </motion.div>
      );
    }
    if (step.isBlocked) {
      return <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />;
    }
    if (isCurrentStep) {
      return (
        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary-foreground">{stepNumber}</span>
        </div>
      );
    }
    return <Circle className="h-4 w-4 text-muted-foreground/30" />;
  };

  const content = (
    <div
      className={cn(
        'flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all',
        isCurrentStep && !step.isComplete && 'bg-primary/5',
        step.isBlocked && 'opacity-40'
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'text-sm font-medium',
              step.isComplete && 'line-through text-muted-foreground',
              isCurrentStep && !step.isComplete && 'text-foreground'
            )}
          >
            {step.title}
          </span>
          {isCurrentStep && !step.isComplete && !step.isBlocked && (
            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-px rounded-full font-medium">
              En cours
            </span>
          )}
        </div>

        <AnimatePresence>
          {isCurrentStep && !step.isComplete && !step.isBlocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="mt-1.5"
            >
              <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
              {step.helpText && (
                <p className="text-xs text-muted-foreground/70 mb-2 italic">
                  💡 {step.helpText}
                </p>
              )}
              <Button size="sm" variant="outline" onClick={onAction} className="h-7 text-xs gap-1">
                {step.action.label}
                <ChevronRight className="h-3 w-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (step.isBlocked && step.blockedReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{content}</div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="flex items-center gap-1.5 text-xs">
              <Lock className="h-3 w-3" />
              {step.blockedReason}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
