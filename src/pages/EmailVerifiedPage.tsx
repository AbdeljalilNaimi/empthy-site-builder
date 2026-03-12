import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getAuth, applyActionCode, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const EmailVerifiedPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, profile } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'logging-in' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated && profile?.userType === 'citizen') {
      navigate('/citizen/dashboard', { replace: true });
    } else if (isAuthenticated && profile?.userType === 'provider') {
      navigate('/provider/dashboard', { replace: true });
    }
  }, [isAuthenticated, profile, navigate]);

  useEffect(() => {
    const verifyAndLogin = async () => {
      const oobCode = searchParams.get('oobCode');
      const auth = getAuth();

      try {
        // Flow A: oobCode present → verify programmatically
        if (oobCode) {
          await applyActionCode(auth, oobCode);
        }

        // Auto-login with stored credentials
        setStatus('logging-in');
        const storedEmail = sessionStorage.getItem('cityhealth_pending_email');
        const storedPassword = sessionStorage.getItem('cityhealth_pending_password');

        if (storedEmail && storedPassword) {
          await signInWithEmailAndPassword(auth, storedEmail, storedPassword);
          sessionStorage.removeItem('cityhealth_pending_email');
          sessionStorage.removeItem('cityhealth_pending_password');
          setStatus('success');
          toast.success('Bienvenue sur CityHealth !');
          // Auth listener will handle redirect to dashboard
        } else {
          // Flow B: No credentials (e.g. different browser) → send to login
          setStatus('success');
          toast.success('Email vérifié ! Connectez-vous pour continuer.');
          navigate('/citizen/login', { replace: true });
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        if (err?.code === 'auth/invalid-action-code') {
          setErrorMsg('Ce lien a expiré ou a déjà été utilisé.');
        } else {
          setErrorMsg('Erreur lors de la vérification. Réessayez.');
        }
        setStatus('error');
      }
    };

    verifyAndLogin();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        {status === 'error' ? (
          <>
            <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold">Vérification échouée</h1>
            <p className="text-muted-foreground">{errorMsg}</p>
            <Link to="/citizen/login" className="text-primary hover:underline font-medium text-sm">
              Aller à la page de connexion
            </Link>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center"
            >
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </motion.div>
            <h1 className="text-2xl font-bold">
              {status === 'verifying' ? 'Vérification en cours...' : 'Connexion en cours...'}
            </h1>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </>
        )}
      </motion.div>
    </div>
  );
};

export default EmailVerifiedPage;
