import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PartyPopper, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProvider } from '@/contexts/ProviderContext';
import { useAuth } from '@/contexts/AuthContext';

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

export default function ProviderWelcomePage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { hasProviderAccount, isLoading, refetch } = useProvider();
  const [showFallback, setShowFallback] = useState(false);

  // Poll provider data
  useEffect(() => {
    const interval = setInterval(() => refetch(), 500);
    return () => clearInterval(interval);
  }, [refetch]);

  // Auto-redirect when data is ready
  useEffect(() => {
    if (hasProviderAccount && !isLoading) {
      const handleRedirect = async () => {
        await refreshProfile();
        navigate('/provider/dashboard', { replace: true });
      };
      const t = setTimeout(handleRedirect, 2000);
      return () => clearTimeout(t);
    }
  }, [hasProviderAccount, isLoading, refreshProfile, navigate]);

  // Fallback button after 8s
  useEffect(() => {
    const t = setTimeout(() => setShowFallback(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <ConfettiCanvas />

      <div className="relative z-10 text-center space-y-8 p-6 max-w-md">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center"
        >
          <PartyPopper className="h-12 w-12 text-primary" />
        </motion.div>

        {/* Emoji */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl"
        >
          🎉
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-3xl font-bold text-foreground">
            Bienvenue{displayName ? `, ${displayName}` : ''} !
          </h1>
          <p className="text-muted-foreground text-lg">
            Votre compte professionnel a été créé avec succès
          </p>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 text-muted-foreground"
        >
          {!hasProviderAccount ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Préparation de votre espace...</span>
            </>
          ) : (
            <>
              <span className="text-sm text-primary font-medium">Redirection vers votre tableau de bord...</span>
            </>
          )}
        </motion.div>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="w-2 h-2 rounded-full bg-primary/20"
            />
          ))}
        </div>

        {/* Fallback button */}
        {showFallback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Button
              onClick={() => navigate('/provider/dashboard', { replace: true })}
              className="gap-2"
              size="lg"
            >
              Accéder au tableau de bord
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
