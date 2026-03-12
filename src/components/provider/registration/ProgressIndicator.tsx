import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

export function ProgressIndicator({ steps, currentStep, completedSteps, onStepClick }: ProgressIndicatorProps) {
  const handleStepClick = (stepNumber: number) => {
    // Only allow clicking on completed steps or previous steps
    if (onStepClick && (completedSteps.includes(stepNumber) || stepNumber < currentStep)) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="w-full">
      {/* Mobile: Simple progress bar */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Étape {currentStep} sur {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <div className="mt-3 flex gap-1 overflow-x-auto pb-2">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.number);
            const isCurrent = currentStep === step.number;
            const isPast = step.number < currentStep;
            const isClickable = isCompleted || isPast;

            return (
              <button
                key={step.number}
                onClick={() => handleStepClick(step.number)}
                disabled={!isClickable}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  isCurrent && "bg-primary text-primary-foreground",
                  (isCompleted || isPast) && !isCurrent && "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer",
                  !isCompleted && !isPast && !isCurrent && "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {step.number}. {step.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Full step indicator */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Progress line background */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted" />
          
          {/* Progress line fill */}
          <div 
            className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.number);
            const isCurrent = currentStep === step.number;
            const isPast = step.number < currentStep;
            const isClickable = isCompleted || isPast;

            return (
              <button 
                key={step.number}
                onClick={() => handleStepClick(step.number)}
                disabled={!isClickable}
                className={cn(
                  "relative flex flex-col items-center z-10 group transition-all",
                  isClickable && "cursor-pointer"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 border-2",
                    isCompleted || isPast
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-background border-primary text-primary shadow-lg shadow-primary/25"
                      : "bg-muted border-muted-foreground/20 text-muted-foreground",
                    isClickable && "group-hover:scale-110 group-hover:shadow-lg"
                  )}
                >
                  {isCompleted || isPast ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-3 text-center max-w-[120px]">
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                    isClickable && "group-hover:text-primary"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 hidden lg:block">
                    {step.description}
                  </p>
                  {isClickable && !isCurrent && (
                    <p className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                      Cliquez pour modifier
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}