import { Clock, CheckCircle, AlertCircle, FileText, ArrowRight, Home, Mail, Phone, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProviderByUserId } from '@/hooks/useProviders';

type VerificationStatus = 'pending' | 'in_review' | 'verified' | 'rejected';

interface StatusConfig {
  icon: typeof Clock;
  color: string;
  bgColor: string;
  title: string;
  description: string;
  progress: number;
}

const STATUS_CONFIG: Record<VerificationStatus, StatusConfig> = {
  pending: {
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    title: 'En attente de vérification',
    description: 'Votre demande a été soumise et sera examinée sous 24-48 heures.',
    progress: 25,
  },
  in_review: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    title: 'En cours d\'examen',
    description: 'Notre équipe examine actuellement votre dossier.',
    progress: 60,
  },
  verified: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    title: 'Profil vérifié',
    description: 'Félicitations ! Votre profil est maintenant visible au public.',
    progress: 100,
  },
  rejected: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    title: 'Demande refusée',
    description: 'Votre demande n\'a pas été approuvée. Veuillez nous contacter pour plus d\'informations.',
    progress: 0,
  },
};

// Map backend status to display status
const mapVerificationStatus = (backendStatus: string | undefined): VerificationStatus => {
  switch (backendStatus) {
    case 'verified':
    case 'approved':
      return 'verified';
    case 'in_review':
      return 'in_review';
    case 'rejected':
      return 'rejected';
    case 'pending':
    default:
      return 'pending';
  }
};

export default function RegistrationStatus() {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  
  // Fetch real verification status from Firestore
  const { data: provider, isLoading } = useProviderByUserId(user?.uid);
  
  // Get status from provider data
  const status = mapVerificationStatus(provider?.verificationStatus);
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;
  
  const getStatusBarColor = () => {
    if (status === 'verified') return 'bg-emerald-500';
    if (status === 'rejected') return 'bg-red-500';
    return 'bg-amber-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 py-12 px-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement de votre statut...</p>
        </div>
      </div>
    );
  }

  if (!provider && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Aucune demande trouvée</h2>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore soumis de demande d'inscription professionnelle.
              </p>
              <Button onClick={() => navigate('/provider/register')}>
                Commencer l'inscription
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 py-12 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-2xl mx-auto">
        {/* Status Card */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur overflow-hidden">
          <div className={`h-2 ${getStatusBarColor()}`} />
          
          <CardHeader className="text-center pb-4">
            <div className={`mx-auto w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
              <StatusIcon className={`h-10 w-10 ${config.color}`} />
            </div>
            <CardTitle className="text-2xl md:text-3xl">{config.title}</CardTitle>
            <p className="text-muted-foreground mt-2">{config.description}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Provider Name */}
            {provider?.name && (
              <div className="text-center">
                <Badge variant="secondary" className="text-sm">
                  {provider.name}
                </Badge>
              </div>
            )}

            {/* Progress Bar */}
            {status !== 'rejected' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progression</span>
                  <span>{config.progress}%</span>
                </div>
                <Progress value={config.progress} className="h-2" />
              </div>
            )}

            {/* Status Timeline */}
            <div className="space-y-4 mt-8">
              <h3 className="font-semibold text-lg">Étapes de vérification</h3>
              <div className="space-y-3">
                {[
                  { step: 1, label: 'Demande soumise', done: true },
                  { step: 2, label: 'Documents reçus', done: ['in_review', 'verified'].includes(status) },
                  { step: 3, label: 'Vérification en cours', done: ['verified', 'in_review'].includes(status) },
                  { step: 4, label: 'Profil activé', done: status === 'verified' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.done 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.done ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-medium">{item.step}</span>
                      )}
                    </div>
                    <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                      {item.label}
                    </span>
                    {item.done && (
                      <Badge variant="secondary" className="ml-auto text-xs">Terminé</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Date */}
            {(provider as any)?.submittedAt && (
              <div className="text-sm text-muted-foreground text-center pt-4 border-t">
                Demande soumise le {new Date((provider as any).submittedAt.toDate?.() || (provider as any).submittedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/50">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/')}
              >
                <Home className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                Retour à l'accueil
              </Button>
              
              {status === 'verified' && (
                <Button
                  className="flex-1 bg-gradient-to-r from-primary to-accent"
                  onClick={() => navigate('/provider/dashboard')}
                >
                  Accéder au tableau de bord
                  <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support Card */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Besoin d'aide ?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Notre équipe est disponible pour répondre à vos questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="mailto:support@cityhealth.dz" 
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                support@cityhealth.dz
              </a>
              <a 
                href="tel:+21348000000" 
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                +213 48 XX XX XX
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
