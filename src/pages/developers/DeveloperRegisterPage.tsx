import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Code2, Zap, Shield, Terminal, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Footer from '@/components/Footer';

export default function DeveloperRegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setIsLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company: company || null,
            user_type: 'developer',
          },
          emailRedirectTo: `${window.location.origin}/developers/dashboard`,
        },
      });
      if (signUpError) throw signUpError;
      setSuccess(true);
    } catch (err: any) {
      if (err?.message?.includes('already registered')) {
        setError('Cet email est déjà utilisé.');
      } else {
        setError(err?.message || 'Erreur lors de la création du compte.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/developers/dashboard`,
        },
      });
      if (resendError) throw resendError;
      toast.success('Email de vérification renvoyé !');
    } catch (err: any) {
      if (err?.message?.includes('rate')) {
        toast.error('Trop de tentatives. Réessayez dans quelques minutes.');
      } else {
        toast.error("Impossible de renvoyer l'email. Vérifiez votre adresse.");
      }
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4">
          <CheckCircle className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Vérifiez votre email</h1>
          <p className="text-muted-foreground">
            Un email de vérification a été envoyé à <strong className="text-foreground">{email}</strong>. 
            Confirmez votre adresse email puis connectez-vous.
          </p>
          <Button
            variant="outline"
            onClick={handleResendEmail}
            disabled={resending}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Envoi...' : 'Renvoyer l\'email'}
          </Button>
          <div>
            <Link to="/developers/login">
              <Button className="mt-2">Se connecter</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-foreground text-background flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <Code2 className="h-6 w-6" />
            <span className="text-lg font-bold tracking-tight">CityHealth API</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight leading-tight mb-4">
            Créez votre compte<br />développeur.
          </h2>
          <p className="text-background/60 text-sm leading-relaxed mb-12">
            Obtenez votre clé API en quelques minutes et commencez à intégrer les données de santé dans vos applications.
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 mt-0.5 shrink-0 text-background/80" />
              <div>
                <div className="font-medium text-sm">100 requêtes/jour gratuites</div>
                <div className="text-background/50 text-xs">Commencez sans frais</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 mt-0.5 shrink-0 text-background/80" />
              <div>
                <div className="font-medium text-sm">Données vérifiées</div>
                <div className="text-background/50 text-xs">Prestataires certifiés uniquement</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 mt-0.5 shrink-0 text-background/80" />
              <div>
                <div className="font-medium text-sm">Documentation complète</div>
                <div className="text-background/50 text-xs">Exemples curl & JavaScript</div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-background/30 text-xs">© {new Date().getFullYear()} CityHealth</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <Code2 className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">CityHealth API</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Créer un compte</h1>
            <p className="text-muted-foreground text-sm mt-1">Inscrivez-vous pour obtenir une clé API</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                placeholder="Jean Dupont"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="dev@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Nom de l'application / Entreprise</Label>
              <Input
                id="company"
                placeholder="Mon App Santé"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Création...' : 'Créer mon compte'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Déjà inscrit ?{' '}
            <Link to="/developers/login" className="text-primary font-medium hover:underline">
              Se connecter
            </Link>
          </p>
          <p className="text-center">
            <Link to="/developers" className="text-xs text-muted-foreground hover:text-foreground">
              ← Retour au portail
            </Link>
          </p>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
