import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, CheckCircle, PartyPopper } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { usePostAppointmentReview } from '@/hooks/usePostAppointmentReview';
import { useSupabaseReviews } from '@/hooks/useSupabaseReviews';
import { Appointment } from '@/types/appointments';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  appointments: Appointment[];
}

// Lightweight confetti using canvas
function ConfettiCanvas({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      'hsl(142, 76%, 50%)', // green
      'hsl(48, 96%, 53%)',  // yellow
      'hsl(217, 91%, 60%)', // blue
      'hsl(340, 82%, 52%)', // pink
      'hsl(280, 87%, 65%)', // purple
      'hsl(25, 95%, 53%)',  // orange
    ];

    interface Particle {
      x: number; y: number; w: number; h: number;
      color: string; vx: number; vy: number;
      rotation: number; rotationSpeed: number;
      opacity: number;
    }

    const particles: Particle[] = Array.from({ length: 80 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height - 100,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 12,
      vy: -(Math.random() * 14 + 6),
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
      opacity: 1,
    }));

    let frame = 0;
    const maxFrames = 90;

    function animate() {
      if (frame >= maxFrames) { onDone(); return; }
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particles) {
        p.x += p.vx;
        p.vy += 0.35;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - frame / maxFrames);
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      }
      frame++;
      requestAnimationFrame(animate);
    }
    animate();
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[60] pointer-events-none"
    />
  );
}

// Success state shown after submit
function SuccessOverlay() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center py-8 text-center gap-3"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1, stiffness: 300 }}
      >
        <CheckCircle className="h-12 w-12 text-green-500" />
      </motion.div>
      <p className="font-semibold text-lg">Merci ! 🎉</p>
      <p className="text-sm text-muted-foreground">Votre avis a bien été envoyé.</p>
    </motion.div>
  );
}

export function PostAppointmentReviewWidget({ appointments }: Props) {
  const { eligibleAppointment, dismiss, patientId } = usePostAppointmentReview(appointments);
  const { submitReview } = useSupabaseReviews(eligibleAppointment?.providerId);
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleDismiss = useCallback(() => {
    if (eligibleAppointment) {
      dismiss(eligibleAppointment.id);
      setDismissed(true);
    }
  }, [eligibleAppointment, dismiss]);

  const handleSubmit = useCallback(async () => {
    if (!eligibleAppointment || !patientId || rating === 0) return;
    setSubmitting(true);
    try {
      await submitReview.mutateAsync({
        patientId,
        patientName: eligibleAppointment.patientName,
        rating,
        comment,
      });
      // Show success + confetti
      setShowSuccess(true);
      setShowConfetti(true);
      // Auto-hide after 2.5s
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['reviewed-providers'] });
        setShowSuccess(false);
        setRating(0);
        setComment('');
      }, 2500);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  }, [eligibleAppointment, patientId, rating, comment, submitReview, queryClient]);

  const show = !!eligibleAppointment && !dismissed;

  return (
    <>
      {showConfetti && <ConfettiCanvas onDone={() => setShowConfetti(false)} />}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] sm:w-auto sm:max-w-sm"
          >
            <Card className="shadow-lg border-primary/20 overflow-hidden">
              <AnimatePresence mode="wait">
                {showSuccess ? (
                  <motion.div key="success" exit={{ opacity: 0, scale: 0.9 }}>
                    <SuccessOverlay />
                  </motion.div>
                ) : (
                  <motion.div key="form" exit={{ opacity: 0 }}>
                    <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold">Comment s'est passé votre RDV ?</p>
                        <p className="text-xs text-muted-foreground">
                          {eligibleAppointment.providerName} &middot;{' '}
                          {format(new Date(eligibleAppointment.dateTime), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleDismiss}>
                        <X className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-3">
                      {/* Stars */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <motion.button
                            key={s}
                            type="button"
                            className="focus:outline-none"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onMouseEnter={() => setHoveredStar(s)}
                            onMouseLeave={() => setHoveredStar(0)}
                            onClick={() => setRating(s)}
                          >
                            <Star
                              className={`h-7 w-7 transition-colors ${
                                s <= (hoveredStar || rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>

                      <Textarea
                        placeholder="Un commentaire ? (optionnel)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={2}
                        className="resize-none text-sm"
                      />

                      <Button
                        size="sm"
                        className="w-full"
                        disabled={rating === 0 || submitting}
                        onClick={handleSubmit}
                      >
                        {submitting ? 'Envoi...' : (
                          <>
                            <Send className="h-4 w-4 mr-1" />
                            Envoyer mon avis
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
