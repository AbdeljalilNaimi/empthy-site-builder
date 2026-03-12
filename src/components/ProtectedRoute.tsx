import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { Loader2, ShieldX, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: UserRole;
}

const AccessDenied = ({ requiredRole }: { requiredRole: UserRole }) => {
  const { t } = useLanguage();
  const roleLabels: Record<UserRole, string> = {
    admin: t('roles.administrator'),
    provider: t('roles.practitioner'),
    patient: 'Patient'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{t('guards.accessDenied')}</CardTitle>
          <CardDescription>
            {t('guards.requireRole').replace('{role}', roleLabels[requiredRole])}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">{t('guards.noPermissions')}</p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('guards.back')}
            </Button>
            <Button asChild>
              <a href="/">{t('guards.returnHome')}</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading, hasRole, profile } = useAuth();
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

  if (!profile && requireRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('guards.loadingProfile')}</p>
      </div>
    );
  }

  if (requireRole && !hasRole(requireRole)) {
    return <AccessDenied requiredRole={requireRole} />;
  }

  return <>{children}</>;
};