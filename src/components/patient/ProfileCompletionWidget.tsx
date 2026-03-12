import { CircularProgress } from '@/components/ui/circular-progress';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { ProfileScoreResult } from '@/hooks/useProfileScore';
import { cn } from '@/lib/utils';

interface ProfileCompletionWidgetProps {
  scoreData: ProfileScoreResult;
  onNavigateTab?: (tab: string) => void;
  compact?: boolean;
}

export function ProfileCompletionWidget({ scoreData, onNavigateTab, compact = false }: ProfileCompletionWidgetProps) {
  const { totalScore, categories, nextAction } = scoreData;

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center gap-3">
          <CircularProgress value={totalScore} size={48} strokeWidth={4} showValue={false}>
            <span className="text-xs font-bold">{totalScore}%</span>
          </CircularProgress>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Score de Profil</p>
            {nextAction && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-xs text-primary truncate max-w-full justify-start"
                onClick={() => onNavigateTab?.(nextAction.tab)}
              >
                <span className="truncate">{nextAction.label}</span>
                <ArrowRight className="h-3 w-3 ml-1 shrink-0" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Circular progress */}
          <CircularProgress value={totalScore} size={100} strokeWidth={7}>
            {totalScore >= 100 && (
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
            )}
          </CircularProgress>

          {/* Category rows */}
          <div className="flex-1 w-full space-y-3">
            <h3 className="text-lg font-semibold">Score de Profil</h3>
            {categories.map((cat) => {
              const pct = cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;
              const complete = cat.score >= cat.maxScore;
              return (
                <div key={cat.name} className="flex items-center gap-3">
                  {complete ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={cn("font-medium", complete && "text-green-600")}>{cat.label}</span>
                      <span className="text-xs text-muted-foreground">{Math.round(cat.score)}/{cat.maxScore}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </div>
              );
            })}

            {/* CTA */}
            {nextAction && (
              <Button
                size="sm"
                className="mt-2 gap-2"
                onClick={() => onNavigateTab?.(nextAction.tab)}
              >
                {nextAction.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
