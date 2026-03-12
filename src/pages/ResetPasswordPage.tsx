import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff, Heart, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const rules = [
  { label: '8 caractères minimum', test: (p: string) => p.length >= 8 },
  { label: '1 lettre majuscule', test: (p: string) => /[A-Z]/.test(p) },
  { label: '1 chiffre', test: (p: string) => /[0-9]/.test(p) },
  { label: '1 caractère spécial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

type Strength = 'weak' | 'fair' | 'strong';

function getStrength(password: string): { level: Strength; score: number } {
  const score = rules.filter(r => r.test(password)).length;
  if (score <= 1) return { level: 'weak', score };
  if (score <= 2) return { level: 'fair', score };
  return { level: 'strong', score };
}

const strengthConfig: Record<Strength, { label: string; color: string; barColor: string }> = {
  weak: { label: 'Faible', color: 'text-destructive', barColor: 'bg-destructive' },
  fair: { label: 'Moyen', color: 'text-orange-500', barColor: 'bg-orange-500' },
  strong: { label: 'Fort', color: 'text-emerald-600', barColor: 'bg-emerald-600' },
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = strength.level === 'strong' && passwordsMatch && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) {
      toast.error('Lien de réinitialisation invalide ou expiré');
      return;
    }
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success('Mot de passe mis à jour ✓');
      navigate('/', { replace: true });
    } catch (error: any) {
      if (error.code === 'auth/expired-action-code') {
        toast.error('Ce lien a expiré. Demandez un nouveau lien.');
      } else if (error.code === 'auth/invalid-action-code') {
        toast.error('Lien invalide. Demandez un nouveau lien.');
      } else {
        toast.error('Erreur lors de la réinitialisation');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!oobCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="bg-card rounded-2xl border shadow-sm p-8 max-w-md w-full text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-orange-500 mx-auto" />
          <h2 className="text-xl font-bold">Lien invalide</h2>
          <p className="text-sm text-muted-foreground">
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
          <Link to="/forgot-password">
            <Button className="w-full">Demander un nouveau lien</Button>
          </Link>
        </div>
      </div>
    );
  }

  const cfg = strengthConfig[strength.level];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl border shadow-sm p-8 space-y-6">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              CityHealth
            </Link>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Nouveau mot de passe</h2>
            <p className="text-sm text-muted-foreground">
              Choisissez un mot de passe sécurisé pour votre compte
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 h-11"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={cn('h-full rounded-full', cfg.barColor)}
                        initial={{ width: 0 }}
                        animate={{ width: `${(strength.score / 4) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
                  </div>

                  {/* Rules checklist */}
                  <div className="grid grid-cols-2 gap-1">
                    {rules.map((rule) => {
                      const passed = rule.test(password);
                      return (
                        <div key={rule.label} className="flex items-center gap-1.5">
                          {passed ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                          )}
                          <span className={cn('text-xs', passed ? 'text-foreground' : 'text-muted-foreground')}>
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <Button type="submit" className="w-full h-11" disabled={!canSubmit}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Réinitialiser
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
