import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Check, Camera, FileText, Clock, Eye, Shield
} from 'lucide-react';

interface ProfileScore {
  total: number;
  identity: number;
  institution: number;
  visibility: number;
  enhancement: number;
  isSearchable: boolean;
}

interface Step {
  number: number;
  title: string;
  description: string;
}

interface DynamicProgressBarProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  profileScore: ProfileScore;
  lastSaved: Date | null;
  isSaving: boolean;
  onStepClick?: (step: number) => void;
}

export function DynamicProgressBar({ 
  steps, 
  currentStep,
  completedSteps,
  profileScore,
  lastSaved,
  isSaving,
  onStepClick 
}: DynamicProgressBarProps) {

  const getNextMilestone = () => {
    if (profileScore.total < 40) {
      return { target: 40, message: 'Complétez votre identité pour atteindre 40%' };
    }
    if (profileScore.total < 70) {
      return { target: 70, message: 'Ajoutez localisation + horaires pour être visible' };
    }
    if (profileScore.total < 85) {
      return { target: 85, message: 'Ajoutez une photo pour atteindre 85%' };
    }
    return { target: 100, message: 'Profil complet!' };
  };

  const milestone = getNextMilestone();

  const handleStepClick = (stepNumber: number) => {
    if (onStepClick && (completedSteps.includes(stepNumber) || stepNumber < currentStep)) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Progress Display */}
      <div className="bg-card/80 backdrop-blur border rounded-xl p-4 md:p-6">
        {/* Score Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all",
              profileScore.total >= 70 
                ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25" 
                : profileScore.total >= 40
                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-gradient-to-br from-muted to-muted-foreground/20 text-foreground"
            )}>
              {profileScore.total}%
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Score de profil</h3>
              <p className="text-sm text-muted-foreground">{milestone.message}</p>
            </div>
          </div>
          
          {/* Visibility Badge */}
          <div className="hidden sm:flex items-center gap-2">
            {profileScore.isSearchable ? (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/30 gap-1">
                <Eye className="h-3 w-3" />
                Visible dans la recherche
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground gap-1">
                <Shield className="h-3 w-3" />
                Non visible
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative mb-4">
          <Progress 
            value={profileScore.total} 
            className="h-3 bg-muted"
          />
          {/* Milestone markers */}
          <div className="absolute top-0 left-[40%] w-0.5 h-3 bg-muted-foreground/30" />
          <div className="absolute top-0 left-[70%] w-0.5 h-3 bg-green-500/50" />
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-lg transition-colors",
            profileScore.identity >= 15 ? "bg-primary/10" : "bg-muted/50"
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              profileScore.identity >= 15 ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"
            )}>
              {profileScore.identity >= 15 ? <Check className="h-3 w-3" /> : <span>1</span>}
            </div>
            <span className="text-muted-foreground">Identité ({profileScore.identity}/20)</span>
          </div>

          <div className={cn(
            "flex items-center gap-2 p-2 rounded-lg transition-colors",
            profileScore.institution >= 15 ? "bg-primary/10" : "bg-muted/50"
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              profileScore.institution >= 15 ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"
            )}>
              {profileScore.institution >= 15 ? <Check className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
            </div>
            <span className="text-muted-foreground">Institution ({profileScore.institution}/20)</span>
          </div>

          <div className={cn(
            "flex items-center gap-2 p-2 rounded-lg transition-colors",
            profileScore.visibility >= 25 ? "bg-green-500/10" : "bg-muted/50"
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              profileScore.visibility >= 25 ? "bg-green-500 text-white" : "bg-muted-foreground/20"
            )}>
              {profileScore.visibility >= 25 ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            </div>
            <span className="text-muted-foreground">Visibilité ({profileScore.visibility}/30)</span>
          </div>

          <div className={cn(
            "flex items-center gap-2 p-2 rounded-lg transition-colors",
            profileScore.enhancement >= 20 ? "bg-primary/10" : "bg-muted/50"
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              profileScore.enhancement >= 20 ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"
            )}>
              {profileScore.enhancement >= 20 ? <Check className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
            </div>
            <span className="text-muted-foreground">Bonus ({profileScore.enhancement}/30)</span>
          </div>
        </div>

        {/* Auto-save indicator */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSaving ? (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Sauvegarde en cours...</span>
              </>
            ) : lastSaved ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Brouillon sauvegardé {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </>
            ) : null}
          </div>
          <Badge variant="outline" className="text-xs">
            Étape {currentStep} / {steps.length}
          </Badge>
        </div>
      </div>

      {/* Step Pills - Mobile Scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:hidden">
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
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                isCurrent && "bg-primary text-primary-foreground shadow-md",
                (isCompleted || isPast) && !isCurrent && "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer",
                !isCompleted && !isPast && !isCurrent && "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {isCompleted || isPast ? <Check className="inline h-3 w-3 mr-1" /> : null}
              {step.title}
            </button>
          );
        })}
      </div>

      {/* Step Timeline - Desktop */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
        
        {/* Progress line fill */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
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
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 border-2",
                  isCompleted || isPast
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-background border-primary text-primary shadow-lg shadow-primary/25"
                    : "bg-muted border-muted-foreground/20 text-muted-foreground",
                  isClickable && "group-hover:scale-110"
                )}
              >
                {isCompleted || isPast ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="mt-2 text-center max-w-[100px]">
                <p className={cn(
                  "text-xs font-medium transition-colors",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                  isClickable && "group-hover:text-primary"
                )}>
                  {step.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
