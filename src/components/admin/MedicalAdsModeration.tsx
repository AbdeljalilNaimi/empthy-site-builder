import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle, XCircle, Eye, Image as ImageIcon, Search, Calendar, User, Loader2, ShieldX, RefreshCw 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  subscribeToAllAds, 
  approveAd, 
  rejectAd, 
  type MedicalAd 
} from '@/services/medicalAdsService';
import { logAdminAction } from '@/services/auditLogService';

export function MedicalAdsModeration() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [ads, setAds] = useState<MedicalAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAd, setSelectedAd] = useState<MedicalAd | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const setupSubscription = () => {
    setIsLoading(true);
    setPermissionError(false);
    
    // Subscribe to real-time ads updates
    const unsubscribe = subscribeToAllAds(
      (fetchedAds) => {
        setAds(fetchedAds);
        setIsLoading(false);
        setPermissionError(false);
      },
      (error) => {
        console.error('Ads subscription error:', error);
        setIsLoading(false);
        if ((error as any)?.code === 'permission-denied' || 
            error?.message?.includes('permission') || 
            error?.message?.includes('Permission')) {
          setPermissionError(true);
        }
      }
    );

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = setupSubscription();
    return () => unsubscribe();
  }, []);

  const handleApprove = async (ad: MedicalAd) => {
    if (!user) return;
    
    setProcessing(ad.id);
    try {
      await approveAd(ad.id);
      
      // Log admin action
      await logAdminAction(
        user.uid,
        user.email || 'unknown',
        'ad_approved',
        ad.id,
        'ad',
        { title: ad.title, providerId: ad.providerId }
      );
      
      toast({
        title: "Annonce approuvée",
        description: `L'annonce "${ad.title}" est maintenant visible.`,
      });
      setSelectedAd(null);
    } catch (error) {
      console.error('Error approving ad:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver l'annonce.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (ad: MedicalAd) => {
    if (!user) return;
    
    setProcessing(ad.id);
    try {
      await rejectAd(ad.id, 'Non conforme aux règles de la plateforme');
      
      // Log admin action
      await logAdminAction(
        user.uid,
        user.email || 'unknown',
        'ad_rejected',
        ad.id,
        'ad',
        { title: ad.title, providerId: ad.providerId },
        'Non conforme aux règles de la plateforme'
      );
      
      toast({
        title: "Annonce rejetée",
        description: `L'annonce "${ad.title}" a été rejetée.`,
        variant: "destructive"
      });
      setSelectedAd(null);
    } catch (error) {
      console.error('Error rejecting ad:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter l'annonce.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const filteredAds = ads.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.providerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = ads.filter(a => a.status === 'pending').length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (permissionError) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ShieldX className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès refusé</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Vous n'avez pas les permissions nécessaires pour accéder aux annonces. 
            Veuillez vous connecter avec un compte administrateur.
          </p>
          <Button onClick={() => setupSubscription()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Modération des annonces</CardTitle>
              <CardDescription>
                {pendingCount} annonce{pendingCount > 1 ? 's' : ''} en attente de validation
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune annonce à modérer</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Annonce</TableHead>
                  <TableHead>Professionnel</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {ad.imageUrl ? (
                          <img 
                            src={ad.imageUrl} 
                            alt={ad.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{ad.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {ad.content}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{ad.providerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(ad.createdAt, 'dd MMM', { locale: fr })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          ad.status === 'pending' ? 'secondary' :
                          ad.status === 'approved' ? 'default' : 'destructive'
                        }
                      >
                        {ad.status === 'pending' ? 'En attente' :
                         ad.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedAd(ad)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {ad.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleApprove(ad)}
                              disabled={processing === ad.id}
                            >
                              {processing === ad.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleReject(ad)}
                              disabled={processing === ad.id}
                            >
                              {processing === ad.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!selectedAd} onOpenChange={() => setSelectedAd(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Aperçu de l'annonce</DialogTitle>
            <DialogDescription>
              Par {selectedAd?.providerName}
            </DialogDescription>
          </DialogHeader>
          {selectedAd && (
            <div className="space-y-4 py-4">
              {selectedAd.imageUrl && (
                <img 
                  src={selectedAd.imageUrl} 
                  alt={selectedAd.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg">{selectedAd.title}</h3>
                <p className="text-muted-foreground mt-2">{selectedAd.content}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                <span>Créée le {format(selectedAd.createdAt, 'dd MMMM yyyy', { locale: fr })}</span>
                <span>Expire le {format(selectedAd.expiresAt, 'dd MMM yyyy', { locale: fr })}</span>
              </div>

              {selectedAd.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => handleApprove(selectedAd)}
                    disabled={processing === selectedAd.id}
                  >
                    {processing === selectedAd.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approuver
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedAd)}
                    disabled={processing === selectedAd.id}
                  >
                    {processing === selectedAd.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Rejeter
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
