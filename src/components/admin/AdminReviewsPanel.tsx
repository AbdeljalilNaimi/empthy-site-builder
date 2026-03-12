import { useState } from 'react';
import { Star, Trash2, Loader2, Filter, Flag, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  useAllReviews, useDeleteReview, useReviewReports, useUpdateReportStatus,
  AllReviewsFilters,
} from '@/hooks/useSupabaseReviews';
import { ALL_PROVIDER_TYPES } from '@/constants/providerTypes';

const PROVIDER_TYPE_LABELS: Record<string, string> = {
  hospital: 'Hôpital',
  clinic: 'Clinique',
  doctor: 'Médecin',
  pharmacy: 'Pharmacie',
  lab: 'Laboratoire',
  radiology_center: 'Radiologie',
  dentist: 'Dentiste',
  blood_cabin: 'Cabine de sang',
};

export function AdminReviewsPanel() {
  const [filters, setFilters] = useState<AllReviewsFilters>({});
  const [providerSearch, setProviderSearch] = useState('');

  const { data: reviews = [], isLoading } = useAllReviews(filters);
  const { data: reports = [], isLoading: reportsLoading } = useReviewReports();
  const deleteReview = useDeleteReview();
  const updateReportStatus = useUpdateReportStatus();

  const pendingReports = reports.filter(r => r.status === 'pending');

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview.mutateAsync(reviewId);
      toast.success('Avis supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleResolveReport = async (reportId: string, status: string) => {
    try {
      await updateReportStatus.mutateAsync({ reportId, status });
      toast.success(status === 'resolved' ? 'Signalement résolu' : 'Signalement rejeté');
    } catch {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all-reviews">
        <TabsList>
          <TabsTrigger value="all-reviews" className="gap-1.5">
            <Star className="h-4 w-4" />
            Tous les avis
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5">
            <Flag className="h-4 w-4" />
            Signalements
            {pendingReports.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                {pendingReports.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All Reviews Tab */}
        <TabsContent value="all-reviews" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtres</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Select
                  value={filters.providerType || 'all'}
                  onValueChange={(v) => setFilters(f => ({ ...f, providerType: v === 'all' ? undefined : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {ALL_PROVIDER_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{PROVIDER_TYPE_LABELS[t] || t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="ID prestataire..."
                  value={providerSearch}
                  onChange={(e) => {
                    setProviderSearch(e.target.value);
                    setFilters(f => ({ ...f, providerId: e.target.value || undefined }));
                  }}
                />

                <Select
                  value={filters.rating?.toString() || 'all'}
                  onValueChange={(v) => setFilters(f => ({ ...f, rating: v === 'all' ? undefined : Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Note" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les notes</SelectItem>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <SelectItem key={r} value={r.toString()}>{r} étoile{r > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value || undefined }))}
                  placeholder="Depuis..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Reviews Table */}
          <Card>
            <CardHeader>
              <CardTitle>Avis ({reviews.length})</CardTitle>
              <CardDescription>Gestion globale de tous les avis de la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Aucun avis trouvé</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Prestataire</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Commentaire</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium text-sm">{review.patient_name}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{review.provider_name}</p>
                            <Badge variant="outline" className="text-[10px] mt-0.5">
                              {PROVIDER_TYPE_LABELS[review.provider_type || ''] || review.provider_type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'h-3 w-3',
                                  i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/20'
                                )}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm text-muted-foreground truncate">{review.comment || '—'}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(review.created_at), 'dd/MM/yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell className="text-right">
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
                                  L'avis de {review.patient_name} sera définitivement supprimé.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Signalements d'avis ({pendingReports.length} en attente)</CardTitle>
              <CardDescription>Avis signalés par les prestataires pour modération</CardDescription>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : reports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Aucun signalement</p>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div key={report.id} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'} className="text-xs">
                            {report.status === 'pending' ? 'En attente' : report.status === 'resolved' ? 'Résolu' : 'Rejeté'}
                          </Badge>
                          <p className="text-sm font-medium mt-1">Motif: {report.reason}</p>
                          {report.details && (
                            <p className="text-xs text-muted-foreground mt-0.5">{report.details}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Signalé le {format(new Date(report.created_at), 'PP', { locale: fr })}
                            {' · '}ID avis: {report.review_id.slice(0, 8)}...
                          </p>
                        </div>
                        {report.status === 'pending' && (
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-green-600 hover:text-green-700"
                              onClick={() => handleResolveReport(report.id, 'resolved')}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Résolu
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground"
                              onClick={() => handleResolveReport(report.id, 'dismissed')}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Rejeter
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
