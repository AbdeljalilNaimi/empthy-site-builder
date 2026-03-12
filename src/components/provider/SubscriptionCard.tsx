import { useState } from 'react';
import { Crown, Star, Zap, Search, Brain, BarChart3, ShieldCheck, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type PlanType = 'basic' | 'standard' | 'premium';

interface SubscriptionCardProps {
  planType?: PlanType;
  onUpgrade?: (newPlan: PlanType) => Promise<void>;
}

const planConfig = {
  basic: {
    label: 'Basic',
    icon: Zap,
    badgeClass: 'bg-muted text-muted-foreground',
  },
  standard: {
    label: 'Standard',
    icon: Star,
    badgeClass: 'bg-primary/10 text-primary',
  },
  premium: {
    label: 'Premium',
    icon: Crown,
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
};

const premiumBenefits = [
  { icon: Crown, text: 'Badge exclusif "Premium Vérifié"' },
  { icon: Search, text: 'Apparition en tête des résultats de recherche' },
  { icon: Brain, text: 'Recommandation par l\'Assistant IA Triage' },
  { icon: BarChart3, text: 'Statistiques avancées du tableau de bord' },
  { icon: ShieldCheck, text: 'Priorité de support technique' },
];

export const SubscriptionCard = ({ planType = 'basic', onUpgrade }: SubscriptionCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const config = planConfig[planType];
  const Icon = config.icon;
  const isPremium = planType === 'premium';

  const handleConfirmUpgrade = async () => {
    if (!onUpgrade) return;
    setIsUpgrading(true);
    try {
      await onUpgrade('premium');
      setShowModal(false);
      toast.success('🎉 Félicitations ! Vous êtes maintenant Premium', {
        description: 'Votre badge Premium Vérifié est désormais actif.',
        duration: 5000,
      });
    } catch {
      toast.error('Erreur lors de la mise à niveau. Veuillez réessayer.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon className="h-4 w-4" />
            Abonnement & Facturation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Forfait Actuel</span>
            <Badge className={cn('text-xs px-2.5 py-0.5 border-0', config.badgeClass)}>
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          <Badge variant="outline" className="w-fit border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 text-xs">
            Gratuit la 1ère année
          </Badge>

          {isPremium ? (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">Premium actif</span>
            </div>
          ) : (
            <Button
              className="w-full gap-2"
              variant="default"
              size="sm"
              onClick={() => setShowModal(true)}
            >
              <Sparkles className="h-4 w-4" />
              Passer au Premium
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Passer au Premium
            </DialogTitle>
            <DialogDescription>
              Débloquez tous les avantages pour maximiser votre visibilité.
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-3 my-4">
            {premiumBenefits.map((benefit) => {
              const BenefitIcon = benefit.icon;
              return (
                <li key={benefit.text} className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <BenefitIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-foreground pt-1">{benefit.text}</span>
                </li>
              );
            })}
          </ul>

          <Badge variant="outline" className="w-fit border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 text-xs mb-3">
            Gratuit la 1ère année — puis 4 900 DA / mois
          </Badge>

          <Button
            className="w-full gap-2"
            onClick={handleConfirmUpgrade}
            disabled={isUpgrading}
          >
            {isUpgrading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Crown className="h-4 w-4" />
            )}
            {isUpgrading ? 'Mise à niveau en cours...' : 'Confirmer le passage au Premium'}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
