import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAuth, sendEmailVerification, signInWithEmailAndPassword as firebaseSignIn } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, ArrowLeft, Mail, Lock, Phone, Eye, EyeOff, Heart, Shield, MapPin, CheckCircle2, MailCheck } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const formatPhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, '');
  const local = digits.startsWith('213') ? digits.slice(3) : digits;
  const trimmed = local.slice(0, 9);
  const parts = [trimmed.slice(0, 3), trimmed.slice(3, 5), trimmed.slice(5, 7), trimmed.slice(7, 9)].filter(Boolean);
  return parts.join(' ');
};

const PHONE_REGEX = /^\d{9}$/;

const signupSchema = z.object({
  email: z.string().email('Email invalide').max(255),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100)
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre'),
  fullName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  phone: z.string()
    .transform(v => v.replace(/\s/g, ''))
    .pipe(z.string().regex(PHONE_REGEX, 'Le numéro doit contenir 9 chiffres').or(z.literal('')))
    .optional(),
});

const features = [
  { icon: Heart, title: 'Accès aux soins', desc: 'Trouvez les meilleurs professionnels de santé près de chez vous' },
  { icon: MapPin, title: 'Carte interactive', desc: 'Localisez pharmacies, cliniques et hôpitaux en temps réel' },
  { icon: Shield, title: 'Données sécurisées', desc: 'Vos informations médicales sont protégées et chiffrées' },
];

const CitizenRegisterPage = () => {
  const navigate = useNavigate();
  const { signupAsCitizen, loginWithGoogle, isAuthenticated, profile, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (isAuthenticated && profile?.userType === 'citizen') {
      navigate('/citizen/dashboard');
    }
  }, [isAuthenticated, profile, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const validated = signupSchema.parse({ email, password, fullName, phone });
      setIsLoading(true);
      const fullPhone = validated.phone ? `+213${validated.phone.replace(/\s/g, '')}` : undefined;
      await signupAsCitizen(validated.email, validated.password, validated.fullName, fullPhone);
      // Store credentials temporarily for auto-login after email verification
      sessionStorage.setItem('cityhealth_pending_email', validated.email);
      sessionStorage.setItem('cityhealth_pending_password', validated.password);
      setRegisteredEmail(validated.email);
      setEmailSent(true);
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle('citizen');
    } catch {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  const strength = getPasswordStrength();
  const strengthColors = ['bg-destructive', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
  const strengthLabels = ['Faible', 'Moyen', 'Bon', 'Fort'];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <MailCheck className="h-10 w-10 text-primary" />
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Confirmez votre email</h1>
            <p className="text-muted-foreground">
              Merci de vous être inscrit sur <span className="font-semibold text-foreground">CityHealth</span> !
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-5 space-y-3 border">
            <p className="text-sm text-muted-foreground">
              Veuillez confirmer votre adresse email
            </p>
            <p className="font-medium text-foreground">{registeredEmail}</p>
            <p className="text-sm text-muted-foreground">
              en cliquant sur le bouton dans l'email que nous venons de vous envoyer.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Vous n'avez pas reçu l'email ? Vérifiez votre dossier spam.
            </p>
            <Button
              variant="secondary"
              className="w-full h-11 gap-2"
              disabled={resending || resendCooldown > 0}
              onClick={async () => {
                setResending(true);
                try {
                  const auth = getAuth();
                  let user = auth.currentUser;
                  let signedInTemporarily = false;

                  if (!user) {
                    const cred = await firebaseSignIn(auth, registeredEmail, password);
                    user = cred.user;
                    signedInTemporarily = true;
                  }

                  if (!user) throw new Error('Utilisateur introuvable pour renvoi email');

                  await sendEmailVerification(user);

                  if (signedInTemporarily) {
                    await auth.signOut();
                  }

                  toast.success('Email de vérification renvoyé !');
                  setResendCooldown(120);
                  const interval = setInterval(() => {
                    setResendCooldown(prev => {
                      if (prev <= 1) { clearInterval(interval); return 0; }
                      return prev - 1;
                    });
                  }, 1000);
                } catch (err: any) {
                  console.error('Resend error:', err);
                  if (err?.code === 'auth/too-many-requests') {
                    toast.error("Trop de tentatives. Réessayez dans quelques minutes.");
                  } else {
                    toast.error("Impossible de renvoyer l'email. Réessayez plus tard.");
                  }
                } finally {
                  setResending(false);
                }
              }}
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {resendCooldown > 0
                ? `Renvoyer dans ${resendCooldown}s`
                : "Renvoyer l'email de vérification"}
            </Button>
            <Link to="/citizen/login">
              <Button variant="outline" className="w-full h-11 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Aller à la page de connexion
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <span className="text-lg font-bold">C</span>
              </div>
              <span className="text-xl font-bold tracking-tight">CityHealth</span>
            </Link>
          </motion.div>

          {/* Hero content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold leading-tight mb-4">
                Votre santé,<br />
                <span className="text-white/80">notre priorité.</span>
              </h1>
              <p className="text-lg text-white/70 max-w-sm">
                Rejoignez des milliers de citoyens qui font confiance à CityHealth pour leur parcours de santé.
              </p>
            </motion.div>

            <div className="space-y-5">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -30 }}
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

          {/* Bottom stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex gap-8 text-sm"
          >
            <div>
              <p className="text-2xl font-bold">500+</p>
              <p className="text-white/60">Professionnels</p>
            </div>
            <div>
              <p className="text-2xl font-bold">10k+</p>
              <p className="text-white/60">Citoyens</p>
            </div>
            <div>
              <p className="text-2xl font-bold">4.8★</p>
              <p className="text-white/60">Satisfaction</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
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
                <span className="text-base font-bold text-primary">C</span>
              </div>
              CityHealth
            </Link>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Créer un compte</h2>
            <p className="text-muted-foreground">
              Rejoignez CityHealth pour accéder aux services de santé
            </p>
          </div>

          {/* Google Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 gap-3 text-sm font-medium hover:bg-muted/50 transition-all"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">ou avec email</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="fullName" className="text-sm font-medium">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ahmed Benali"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
              {errors.fullName && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive">{errors.fullName}</motion.p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
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

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="phone" className="text-sm font-medium">
                Téléphone <span className="text-muted-foreground font-normal">(optionnel)</span>
              </Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm font-mono">
                  +213
                </span>
                <div className="relative flex-1">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="XXX XX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                    className="rounded-l-none h-11"
                    maxLength={12}
                  />
                </div>
              </div>
              {errors.phone && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive">{errors.phone}</motion.p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
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
              {/* Strength bar */}
              {password.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i < strength ? strengthColors[strength - 1] : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {strength > 0 && strengthLabels[strength - 1]}
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className={password.length >= 8 ? 'text-emerald-600' : ''}>
                        {password.length >= 8 ? <CheckCircle2 className="h-3 w-3 inline mr-0.5" /> : null}8+ car.
                      </span>
                      <span className={/[A-Z]/.test(password) ? 'text-emerald-600' : ''}>
                        {/[A-Z]/.test(password) ? <CheckCircle2 className="h-3 w-3 inline mr-0.5" /> : null}MAJ
                      </span>
                      <span className={/[0-9]/.test(password) ? 'text-emerald-600' : ''}>
                        {/[0-9]/.test(password) ? <CheckCircle2 className="h-3 w-3 inline mr-0.5" /> : null}123
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button type="submit" className="w-full h-12 text-sm font-semibold mt-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isLoading ? 'Création en cours...' : 'Créer mon compte'}
              </Button>
            </motion.div>
          </form>

          <div className="text-center space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              Déjà un compte?{' '}
              <Link to="/citizen/login" className="text-primary font-medium hover:underline">
                Se connecter
              </Link>
            </p>
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CitizenRegisterPage;
