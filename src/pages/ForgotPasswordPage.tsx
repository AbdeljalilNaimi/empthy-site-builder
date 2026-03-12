import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Mail, CheckCircle2, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      setCooldown(60);
      toast.success('Email envoyé avec succès');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        toast.error('Aucun compte associé à cet email');
      } else {
        toast.error('Erreur lors de l\'envoi. Réessayez.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setCooldown(60);
      toast.success('Email renvoyé avec succès');
    } catch {
      toast.error('Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

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

          <AnimatePresence mode="wait">
            {emailSent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center"
              >
                {/* Animated checkmark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center"
                >
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight">Email envoyé !</h2>
                  <p className="text-sm text-muted-foreground">
                    Vérifiez votre boîte mail et cliquez sur le lien reçu pour réinitialiser votre mot de passe.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleResend}
                    disabled={cooldown > 0 || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {cooldown > 0
                      ? `Renvoyer l'email (${cooldown}s)`
                      : 'Renvoyer l\'email'}
                  </Button>

                  <Link
                    to="/citizen/login"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la connexion
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold tracking-tight">Mot de passe oublié</h2>
                  <p className="text-sm text-muted-foreground">
                    Entrez votre email, nous vous enverrons un lien de réinitialisation
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
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
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Envoyer le lien
                  </Button>
                </form>

                <div className="text-center">
                  <Link
                    to="/citizen/login"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la connexion
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
