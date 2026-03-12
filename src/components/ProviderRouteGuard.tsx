import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProvider } from '@/contexts/ProviderContext';
import { useLanguage } from '@/hooks/useLanguage';
import { Loader2, ShieldX, ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProviderRouteGuardProps {
  children: React.ReactNode;
  requireVerified?: boolean;
}

const NoProviderAccount = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('guards.noProviderAccount')}</CardTitle>
          <CardDescription>{t('guards.noProviderAccountDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button asChild>
              <a href="/provider/register">
                <Building2 className="h-4 w-4 mr-2" />
                {t('guards.createProviderAccount')}
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
};

const NotVerifiedAccess = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">{t('guards.accountPending')}</CardTitle>
          <CardDescription>{t('guards.accountPendingDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button asChild>
              <a href="/provider/dashboard">{t('guards.returnDashboard')}</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export function ProviderRouteGuard({ children, requireVerified = false }: ProviderRouteGuardProps) {
  const { user, isAuthenticated, isLoading: authLoading, hasRole, profile } = useAuth();
  const { 
    provider, 
    isLoading: providerLoading, 
    hasProviderAccount, 
    isVerified 
  } = useProvider();
  const { t } = useLanguage();

  const isLoading = authLoading || providerLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('guards.loadingProviderSpace')}</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/provider/login" replace />;
  }

  const isProviderUser = (profile as any)?.userType === 'provider'
    || (profile as any)?.userType === 'medecin'
    || hasRole('provider')
    || hasProviderAccount;

  if (!isProviderUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">{t('guards.accessDenied')}</CardTitle>
            <CardDescription>{t('guards.accessDeniedProviderDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">{t('guards.noPermissions')}</p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <a href="/provider/register">
                  <Building2 className="h-4 w-4 mr-2" />
                  {t('guards.becomeProvider')}
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

  if (!hasProviderAccount) {
    return <NoProviderAccount />;
  }

  if (requireVerified && !isVerified) {
    return <NotVerifiedAccess />;
  }

  return <>{children}</>;
}