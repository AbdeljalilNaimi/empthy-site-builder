import React, { useState } from 'react';
import { Star, ThumbsUp, Send, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { SupabaseReview, ReviewStats } from '@/hooks/useSupabaseReviews';
import type { UseMutationResult } from '@tanstack/react-query';

interface ReviewSystemProps {
  providerId: string;
  providerName: string;
  canReview?: boolean;
  reviews: SupabaseReview[];
  stats: ReviewStats;
  isLoading: boolean;
  submitReview: UseMutationResult<void, Error, { patientId: string; patientName: string; rating: number; comment: string }>;
  currentUserId?: string;
  currentUserName?: string;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  providerId,
  providerName,
  canReview = false,
  reviews,
  stats,
  isLoading,
  submitReview,
  currentUserId,
  currentUserName,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = () => {
    if (!rating || !comment.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (!currentUserId) {
      toast.error('Vous devez être connecté pour laisser un avis');
      return;
    }
    const name = currentUserName || 'Patient';

    submitReview.mutate(
      { patientId: currentUserId, patientName: name, rating, comment },
      {
        onSuccess: () => {
          toast.success('Votre avis a été publié avec succès!');
          setRating(0);
          setComment('');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error("Erreur lors de la publication de l'avis");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Avis des patients
          </CardTitle>
          {canReview && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Laisser un avis</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Laisser un avis pour {providerName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Votre note</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Votre commentaire</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Partagez votre expérience..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSubmit} disabled={submitReview.isPending}>
                      {submitReview.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Publier l'avis
                    </Button>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="flex flex-col md:flex-row gap-6 p-4 bg-muted/30 rounded-lg">
          <div className="text-center md:border-r md:pr-6">
            <div className="text-5xl font-bold text-primary">{stats.averageRating.toFixed(1)}</div>
            <div className="flex gap-0.5 mt-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(stats.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Basé sur {stats.totalReviews} avis
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((ratingLevel) => (
              <div key={ratingLevel} className="flex items-center gap-3 text-sm">
                <span className="w-12 flex items-center gap-1">
                  {ratingLevel} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </span>
                <Progress
                  value={stats.totalReviews > 0 ? (stats.ratingDistribution[ratingLevel as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100 : 0}
                  className="flex-1 h-2"
                />
                <span className="w-12 text-muted-foreground text-right">
                  {stats.ratingDistribution[ratingLevel as keyof typeof stats.ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <Separator />

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Aucun avis pour le moment. Soyez le premier à partager votre expérience!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <div key={review.id}>
                {idx > 0 && <Separator className="my-4" />}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {review.patient_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{review.patient_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm leading-relaxed pl-12">{review.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
