import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Code2, Zap, Shield, Terminal, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Footer from '@/components/Footer';

export default function DeveloperLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  // Handle Supabase email confirmation redirect (token exchange via URL hash)
  useEffect(() => {
    const handleAuthCallback = async () => {
      const hash = window.location.hash;
      if (hash && (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('type=email'))) {
        // Supabase client auto-exchanges tokens from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          setEmailConfirmed(true);
          // Small delay to show confirmation message
          setTimeout(() => {
            navigate('/developers/dashboard', { replace: true });
          }, 1500);
        } else {
          // Token exchange happened but session may already be set via onAuthStateChange
          setEmailConfirmed(true);
        }
        // Clean the URL hash
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    handleAuthCallback();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        if (signInError.message?.includes('Email not confirmed')) {
          setError('Veuillez confirmer votre email avant de vous connecter.');
        } else {
          setError('Email ou mot de passe incorrect.');
        }
        return;
      }
      navigate('/developers/dashboard');
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setIsLoading(false);
    }
  };

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
            Accédez aux données<br />de santé instantanément.
          </h2>
          <p className="text-background/60 text-sm leading-relaxed mb-12">
            API REST sécurisée pour les prestataires de santé vérifiés, pharmacies de garde et urgences 24/7 à Sidi Bel Abbès.
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 mt-0.5 shrink-0 text-background/80" />
              <div>
                <div className="font-medium text-sm">Rapide</div>
                <div className="text-background/50 text-xs">Réponses en &lt;200ms</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 mt-0.5 shrink-0 text-background/80" />
              <div>
                <div className="font-medium text-sm">Sécurisé</div>
                <div className="text-background/50 text-xs">Clés hachées SHA-256</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 mt-0.5 shrink-0 text-background/80" />
              <div>
                <div className="font-medium text-sm">Simple</div>
                <div className="text-background/50 text-xs">JSON standard, docs complètes</div>
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
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Connexion développeur</h1>
            <p className="text-muted-foreground text-sm mt-1">Accédez à votre tableau de bord API</p>
          </div>

          {emailConfirmed && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
              <p className="text-sm text-foreground">Email confirmé avec succès ! Redirection en cours...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link to="/developers/register" className="text-primary font-medium hover:underline">
              Créer un compte
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
