import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Stethoscope, ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldCheck, BarChart3, Users } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const features = [
  { icon: ShieldCheck, title: 'Profil vérifié', desc: 'Badge de vérification pour gagner la confiance des patients' },
  { icon: BarChart3, title: 'Analytics avancés', desc: 'Suivez vos consultations, avis et performance en temps réel' },
  { icon: Users, title: 'Visibilité maximale', desc: 'Apparaissez sur la carte et dans les résultats de recherche' },
];

const ProviderLoginPage = () => {
  const navigate = useNavigate();
  const { loginAsProvider, isAuthenticated, profile, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginSchema = z.object({
    email: z.string().email(t('loginPage', 'invalidEmail')).max(255),
    password: z.string().min(6, t('loginPage', 'passwordMinLength')).max(100),
  });

  useEffect(() => {
    if (isAuthenticated && profile?.userType === 'provider') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect && redirect.startsWith('/')) {
        navigate(redirect);
      } else if (profile.verificationStatus === 'verified') {
        navigate('/provider/dashboard');
      } else {
        navigate('/registration-status');
      }
    } else if (isAuthenticated && profile?.userType) {
      toast.error(t('loginPage', 'notProviderAccount'));
    }
  }, [isAuthenticated, profile, navigate, t]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const validated = loginSchema.parse({ email, password });
      setIsLoading(true);
      await loginAsProvider(validated.email, validated.password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errs: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) errs[err.path[0].toString()] = err.message;
        });
        setErrors(errs);
      }
    } finally {
      setIsLoading(false);
    }
  };


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              CityHealth Pro
            </Link>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
                <Stethoscope className="h-3 w-3" />
                Espace Professionnel
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{t('loginPage', 'providerSpace')}</h2>
              <p className="text-muted-foreground">{t('loginPage', 'providerDesc')}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-sm font-medium">{t('auth', 'email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
                {errors.email && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive">{errors.email}</motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">{t('auth', 'password')}</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    {t('loginPage', 'forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive">{errors.password}</motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3 pt-1"
              >
                <Button type="submit" className="w-full h-12 text-sm font-semibold" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLoading ? 'Connexion...' : t('loginPage', 'loginButton')}
                </Button>

              </motion.div>
            </form>

            <div className="text-center space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                {t('loginPage', 'noAccount')}{' '}
                <Link to="/provider/register" className="text-primary font-medium hover:underline">
                  {t('loginPage', 'registerEstablishment')}
                </Link>
              </p>
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                {t('loginPage', 'backToHome')}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-bl from-primary via-primary/90 to-primary/70 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-32 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-32 -left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">CityHealth Pro</span>
            </Link>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold leading-tight mb-4">
                Gérez votre<br />
                <span className="text-white/80">pratique médicale.</span>
              </h1>
              <p className="text-lg text-white/70 max-w-sm">
                Un tableau de bord complet pour les professionnels de santé à Sidi Bel Abbès.
              </p>
            </motion.div>

            <div className="space-y-5">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-sm text-white/60">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10"
          >
            <p className="text-sm text-white/80 italic leading-relaxed">
              "CityHealth a transformé la gestion de ma clinique. Les patients nous trouvent facilement et les rendez-vous sont simplifiés."
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                DK
              </div>
              <div>
                <p className="text-xs font-semibold">Dr. Khelifi</p>
                <p className="text-xs text-white/50">Clinique El Hayat</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProviderLoginPage;
