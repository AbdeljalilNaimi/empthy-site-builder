import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PartyPopper, CheckCircle2, Clock, Mail, Shield,
  FileText, Home, Building2, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const VERIFICATION_STEPS = [
  {
    id: 1,
    title: 'Demande reçue',
    description: 'Votre inscription a été enregistrée',
    icon: CheckCircle2,
    status: 'complete' as const,
  },
  {
    id: 2,
    title: 'Vérification des documents',
    description: 'Notre équipe examine vos documents professionnels',
    icon: FileText,
    status: 'current' as const,
  },
  {
    id: 3,
    title: 'Validation du profil',
    description: 'Contrôle final des informations',
    icon: Shield,
    status: 'pending' as const,
  },
  {
    id: 4,
    title: 'Activation du compte',
    description: 'Votre profil devient visible publiquement',
    icon: Building2,
    status: 'pending' as const,
  },
];

export default function RegistrationThankYou() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const timer = setTimeout(() => setProgress(25), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl animate-bounce">
              <PartyPopper className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Félicitations ! 🎉
          </h1>
          <p className="text-xl text-muted-foreground">
            Votre demande d'inscription a été envoyée avec succès
          </p>
        </div>

        {/* Progress Card */}
        <Card className="mb-8 shadow-xl border-0 bg-card/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Progression de la vérification</h2>
              <Badge variant="secondary" className="card-status-warning">
                <Clock className="h-3 w-3 mr-1" />
                24-48h
              </Badge>
            </div>
            
            <Progress value={progress} className="h-2 mb-6" />

            {/* Steps Timeline */}
            <div className="space-y-4">
              {VERIFICATION_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div 
                    key={step.id}
                    className={cn(
                      "flex items-start gap-4 p-3 rounded-lg transition-colors",
                      step.status === 'complete' && "bg-green-50",
                      step.status === 'current' && "bg-primary/5 border border-primary/20",
                      step.status === 'pending' && "opacity-60"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      step.status === 'complete' && "bg-green-100",
                      step.status === 'current' && "bg-primary/20 animate-pulse",
                      step.status === 'pending' && "bg-muted"
                    )}>
                      <StepIcon className={cn(
                        "h-5 w-5",
                        step.status === 'complete' && "text-green-600",
                        step.status === 'current' && "text-primary",
                        step.status === 'pending' && "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{step.title}</p>
                        {step.status === 'complete' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {step.status === 'current' && (
                          <Badge variant="outline" className="text-xs">En cours</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Que se passe-t-il ensuite ?
            </h3>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Email de confirmation</p>
                  <p className="text-sm text-muted-foreground">
                    Vous recevrez un email confirmant la réception de votre demande
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Vérification des documents</p>
                  <p className="text-sm text-muted-foreground">
                    Notre équipe vérifie vos licences et autorisations professionnelles
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Activation de votre profil</p>
                  <p className="text-sm text-muted-foreground">
                    Une fois approuvé, votre profil devient visible et vous pouvez recevoir des patients
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Support Info */}
        <div className="bg-muted/50 p-4 rounded-lg border mb-8">
          <p className="text-sm text-muted-foreground">
            <strong>Besoin d'aide ?</strong> Notre équipe support est disponible pour répondre à vos questions.
            Contactez-nous à <a href="mailto:support@cityhealth.dz" className="text-primary hover:underline">support@cityhealth.dz</a>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-primary to-accent"
            onClick={() => navigate('/provider/dashboard')}
          >
            Accéder au tableau de bord
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
