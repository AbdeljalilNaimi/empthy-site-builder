import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { Loader2, ShieldX, ArrowLeft, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CitizenGuardProps {
  children: React.ReactNode;
}

export function CitizenGuard({ children }: CitizenGuardProps) {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('guards.verifyingAuth')}</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/citizen/login" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('guards.loadingProfile')}</p>
      </div>
    );
  }

  const isCitizen = profile.userType === 'citizen';
  const hasLegacyPatientRole = profile.roles?.includes('patient');
  
  if (!isCitizen && !hasLegacyPatientRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">{t('guards.citizenOnly')}</CardTitle>
            <CardDescription>{t('guards.accessDeniedCitizenDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">{t('guards.citizenOnlyDesc')}</p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <a href="/citizen/login">
                  <UserCircle className="h-4 w-4 mr-2" />
                  {t('guards.citizenLogin')}
                </a>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('guards.back')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}