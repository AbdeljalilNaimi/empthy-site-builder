import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CheckCircle, XCircle, Eye, Search, Loader2, Star, ShieldX, Flag, Trash2, Ban,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { logAdminAction } from '@/services/auditLogService';
import {
  Ad, getAllAds, adminApprove, adminReject, adminSuspend, adminToggleFeatured, deleteAd, getAdReports, resolveReport,
} from '@/services/adsService';
import { toast } from 'sonner';

export function AdsModeration() {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [adsData, reportsData] = await Promise.all([getAllAds(), getAdReports()]);
      setAds(adsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Failed to load ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (ad: Ad) => {
    setProcessing(ad.id);
    try {
      await adminApprove(ad.id);
      if (user) await logAdminAction(user.uid, user.email || '', 'ad_approved', ad.id, 'ad', { title: ad.title }).catch(() => {});
      toast.success(`"${ad.title}" approuvée`);
      loadData();
      setSelectedAd(null);
    } catch { toast.error("Erreur d'approbation"); }
    finally { setProcessing(null); }
  };

  const handleReject = async (ad: Ad) => {
    setProcessing(ad.id);
    try {
      await adminReject(ad.id, 'Non conforme aux règles de la plateforme');
      if (user) await logAdminAction(user.uid, user.email || '', 'ad_rejected', ad.id, 'ad', { title: ad.title }).catch(() => {});
      toast.success(`"${ad.title}" rejetée`);
      loadData();
      setSelectedAd(null);
    } catch { toast.error('Erreur de rejet'); }
    finally { setProcessing(null); }
  };

  const handleSuspend = async (ad: Ad) => {
    setProcessing(ad.id);
    try {
      await adminSuspend(ad.id);
      toast.success(`"${ad.title}" suspendue`);
      loadData();
    } catch { toast.error('Erreur'); }
    finally { setProcessing(null); }
  };

  const handleDelete = async (adId: string) => {
    try {
      await deleteAd(adId);
      toast.success('Annonce supprimée');
      loadData();
      setSelectedAd(null);
    } catch { toast.error('Erreur de suppression'); }
  };

  const handleToggleFeatured = async (ad: Ad) => {
    try {
      await adminToggleFeatured(ad.id, !ad.is_featured);
      toast.success(ad.is_featured ? 'Retirée des sponsorisées' : 'Marquée comme sponsorisée');
      loadData();
    } catch { toast.error('Erreur'); }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await resolveReport(reportId);
      toast.success('Signalement résolu');
      loadData();
    } catch { toast.error('Erreur'); }
  };

  const filteredAds = ads.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.provider_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = ads.filter(a => a.status === 'pending').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'secondary' | 'default' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: 'En attente' },
      approved: { variant: 'default', label: 'Approuvée' },
      rejected: { variant: 'destructive', label: 'Rejetée' },
      suspended: { variant: 'outline', label: 'Suspendue' },
    };
    const c = map[status] || map.pending;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  if (isLoading) {
    return <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Modération des Annonces</CardTitle>
              <CardDescription>{pendingCount} en attente · {pendingReports} signalement{pendingReports !== 1 ? 's' : ''}</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-10 w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Toutes ({ads.length})</TabsTrigger>
              <TabsTrigger value="pending">En attente ({pendingCount})</TabsTrigger>
              <TabsTrigger value="reports">Signalements ({pendingReports})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <AdsTable
                ads={filteredAds}
                onView={setSelectedAd}
                onApprove={handleApprove}
                onReject={handleReject}
                onSuspend={handleSuspend}
                onToggleFeatured={handleToggleFeatured}
                processing={processing}
                statusBadge={statusBadge}
              />
            </TabsContent>

            <TabsContent value="pending">
              <AdsTable
                ads={filteredAds.filter(a => a.status === 'pending')}
                onView={setSelectedAd}
                onApprove={handleApprove}
                onReject={handleReject}
                onSuspend={handleSuspend}
                onToggleFeatured={handleToggleFeatured}
                processing={processing}
                statusBadge={statusBadge}
              />
            </TabsContent>

            <TabsContent value="reports">
              {reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Flag className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Aucun signalement</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Annonce</TableHead>
                      <TableHead>Raison</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.ads?.title || 'N/A'}</TableCell>
                        <TableCell>{r.reason}</TableCell>
                        <TableCell>{format(new Date(r.created_at), 'dd MMM', { locale: fr })}</TableCell>
                        <TableCell>
                          <Badge variant={r.status === 'pending' ? 'secondary' : 'outline'}>{r.status === 'pending' ? 'En attente' : 'Résolu'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {r.status === 'pending' && (
                            <Button size="sm" variant="outline" onClick={() => handleResolveReport(r.id)}>Résoudre</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!selectedAd} onOpenChange={() => setSelectedAd(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Aperçu de l'annonce</DialogTitle></DialogHeader>
          {selectedAd && (
            <div className="space-y-4">
              <img src={selectedAd.image_url} alt={selectedAd.title} className="w-full h-48 object-cover rounded-lg" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{selectedAd.title}</h3>
                  {statusBadge(selectedAd.status)}
                </div>
                <p className="text-sm text-muted-foreground">{selectedAd.provider_name} · {selectedAd.provider_type} · {selectedAd.provider_city}</p>
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap">{selectedAd.full_description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{selectedAd.views_count} vues</span>
                <span>{selectedAd.likes_count} likes</span>
                <span>{selectedAd.saves_count} saves</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-3 border-t">
                {selectedAd.status === 'pending' && (
                  <>
                    <Button onClick={() => handleApprove(selectedAd)} disabled={processing === selectedAd.id}>
                      <CheckCircle className="h-4 w-4 mr-2" />Approuver
                    </Button>
                    <Button variant="destructive" onClick={() => handleReject(selectedAd)} disabled={processing === selectedAd.id}>
                      <XCircle className="h-4 w-4 mr-2" />Rejeter
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => handleToggleFeatured(selectedAd)}>
                  <Star className={`h-4 w-4 mr-2 ${selectedAd.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                  {selectedAd.is_featured ? 'Retirer sponsor' : 'Sponsoriser'}
                </Button>
                {selectedAd.status === 'approved' && (
                  <Button variant="outline" className="text-orange-500" onClick={() => handleSuspend(selectedAd)}>
                    <Ban className="h-4 w-4 mr-2" />Suspendre
                  </Button>
                )}
                <Button variant="ghost" className="text-destructive" onClick={() => handleDelete(selectedAd.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Sub-component for the ads table
function AdsTable({
  ads, onView, onApprove, onReject, onSuspend, onToggleFeatured, processing, statusBadge,
}: {
  ads: Ad[];
  onView: (ad: Ad) => void;
  onApprove: (ad: Ad) => void;
  onReject: (ad: Ad) => void;
  onSuspend: (ad: Ad) => void;
  onToggleFeatured: (ad: Ad) => void;
  processing: string | null;
  statusBadge: (s: string) => JSX.Element;
}) {
  if (ads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Aucune annonce</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Annonce</TableHead>
          <TableHead>Prestataire</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Featured</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ads.map((ad) => (
          <TableRow key={ad.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <img src={ad.image_url} alt="" className="w-12 h-8 object-cover rounded" />
                <div>
                  <p className="font-medium text-sm truncate max-w-[200px]">{ad.title}</p>
                  <p className="text-xs text-muted-foreground">{ad.views_count} vues · {ad.likes_count} ❤</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm">{ad.provider_name}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{format(new Date(ad.created_at), 'dd MMM', { locale: fr })}</TableCell>
            <TableCell>{statusBadge(ad.status)}</TableCell>
            <TableCell>
              <Switch checked={ad.is_featured} onCheckedChange={() => onToggleFeatured(ad)} />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={() => onView(ad)}><Eye className="h-4 w-4" /></Button>
                {ad.status === 'pending' && (
                  <>
                    <Button size="sm" variant="ghost" className="text-emerald-500" onClick={() => onApprove(ad)} disabled={processing === ad.id}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => onReject(ad)} disabled={processing === ad.id}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
