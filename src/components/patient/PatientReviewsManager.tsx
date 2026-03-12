import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Pencil, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { SupabaseReview, useDeleteReview, useUpdateReview } from '@/hooks/useSupabaseReviews';
import { DashboardEmptyState } from '@/components/citizen/DashboardEmptyState';

interface PatientReviewsManagerProps {
  reviews: SupabaseReview[];
  userId: string;
}

export function PatientReviewsManager({ reviews, userId }: PatientReviewsManagerProps) {
  const [editingReview, setEditingReview] = useState<SupabaseReview | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const deleteReview = useDeleteReview();
  const updateReview = useUpdateReview();

  const openEdit = (review: SupabaseReview) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const handleSaveEdit = async () => {
    if (!editingReview) return;
    try {
      await updateReview.mutateAsync({
        reviewId: editingReview.id,
        rating: editRating,
        comment: editComment,
      });
      toast.success('Avis modifié avec succès');
      setEditingReview(null);
    } catch {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview.mutateAsync(reviewId);
      toast.success('Avis supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (reviews.length === 0) {
    return (
      <DashboardEmptyState
        icon={Star}
        title="Aucun avis"
        hint="Vous n'avez pas encore laissé d'avis. Recherchez un professionnel pour donner votre avis."
        ctaLabel="Rechercher"
        ctaHref="/search"
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {reviews.map((review) => {
          const isOwn = review.patient_id === userId;
          return (
            <Card key={review.id} className="hover:shadow-sm transition-all">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 min-w-0 flex-1">
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Star className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/provider/${review.provider_id}`}
                        className="font-semibold text-sm hover:text-primary transition-colors inline-flex items-center gap-1.5"
                      >
                        Avis pour {review.provider_id.replace(/_/g, ' ')}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </Link>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-3.5 w-3.5',
                              i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'
                            )}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">
                          {format(new Date(review.created_at), 'PP', { locale: fr })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{review.comment}</p>
                      )}
                    </div>
                  </div>
                  {isOwn && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(review)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cet avis ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. L'avis sera définitivement supprimé.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(review.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleteReview.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Supprimer'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingReview} onOpenChange={(open) => !open && setEditingReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier votre avis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Note</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setEditRating(star)} type="button">
                    <Star
                      className={cn(
                        'h-6 w-6 transition-colors cursor-pointer',
                        star <= editRating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Commentaire</p>
              <Textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Votre commentaire..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit} disabled={updateReview.isPending}>
              {updateReview.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
