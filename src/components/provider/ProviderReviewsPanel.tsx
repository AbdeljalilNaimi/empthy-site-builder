import { useState } from 'react';
import { Star, Flag, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useSupabaseReviews, useReportReview } from '@/hooks/useSupabaseReviews';

const REPORT_REASONS = [
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'spam', label: 'Spam' },
  { value: 'false_info', label: 'Informations fausses' },
  { value: 'harassment', label: 'Harcèlement' },
  { value: 'other', label: 'Autre' },
];

interface ProviderReviewsPanelProps {
  providerId: string;
  reporterId: string;
}

export function ProviderReviewsPanel({ providerId, reporterId }: ProviderReviewsPanelProps) {
  const { reviews, stats, isLoading } = useSupabaseReviews(providerId);
  const reportReview = useReportReview();

  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const handleReport = async () => {
    if (!reportingReviewId || !reportReason) return;
    try {
      await reportReview.mutateAsync({
        reviewId: reportingReviewId,
        reporterId,
        reporterType: 'provider',
        reason: reportReason,
        details: reportDetails || undefined,
      });
      toast.success('Signalement envoyé à l\'administration');
      setReportingReviewId(null);
      setReportReason('');
      setReportDetails('');
    } catch {
      toast.error('Erreur lors du signalement');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Avis sur votre profil
          </CardTitle>
          <CardDescription>
            {stats.totalReviews} avis · Note moyenne: {stats.averageRating.toFixed(1)}/5
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun avis pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-muted/20">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{review.patient_name}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-3 w-3',
                              i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), 'PP', { locale: fr })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => setReportingReviewId(review.id)}
                  >
                    <Flag className="h-3.5 w-3.5 mr-1" />
                    Signaler
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Dialog */}
      <Dialog open={!!reportingReviewId} onOpenChange={(open) => !open && setReportingReviewId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaler un avis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Motif du signalement</p>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un motif..." />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Détails (optionnel)</p>
              <Textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Décrivez le problème..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleReport} disabled={!reportReason || reportReview.isPending}>
              {reportReview.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Envoyer le signalement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
