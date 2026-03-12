import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, Image as ImageIcon, Calendar, Eye, Trash2, Clock, CheckCircle, XCircle, Loader2 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  createAd, 
  deleteAd, 
  subscribeToProviderAds,
  type MedicalAd 
} from '@/services/medicalAdsService';

interface MedicalAdsManagerProps {
  providerId: string;
  providerUserId: string;
  providerName: string;
  isVerified: boolean;
}

export function MedicalAdsManager({ providerId, providerUserId, providerName, isVerified }: MedicalAdsManagerProps) {
  const { toast } = useToast();
  const [ads, setAds] = useState<MedicalAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newAd, setNewAd] = useState({
    title: '',
    content: '',
    image: null as File | null
  });

  useEffect(() => {
    // Subscribe to real-time updates for provider's ads
    const unsubscribe = subscribeToProviderAds(providerUserId, (fetchedAds) => {
      setAds(fetchedAds);
      setIsLoading(false);
    }, () => {
      setAds([]);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [providerUserId]);

  const handleCreateAd = async () => {
    if (!newAd.title || !newAd.content) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le titre et le contenu.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Handle image upload to Firebase Storage
      let imageUrl: string | undefined;
      if (newAd.image) {
        // For now, create object URL (in production, upload to Storage)
        imageUrl = URL.createObjectURL(newAd.image);
      }

      await createAd({
        providerId,
        providerUserId,
        providerName,
        title: newAd.title,
        content: newAd.content,
        imageUrl
      });

      setNewAd({ title: '', content: '', image: null });
      setIsDialogOpen(false);

      toast({
        title: "Annonce créée !",
        description: "Votre annonce est en attente de modération.",
      });
    } catch (error) {
      console.error('Error creating ad:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'annonce.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    setDeletingId(adId);
    try {
      await deleteAd(adId);
      toast({
        title: "Annonce supprimée",
        description: "L'annonce a été supprimée avec succès.",
      });
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const statusConfig = {
    pending: { icon: Clock, color: 'text-orange-500', label: 'En attente' },
    approved: { icon: CheckCircle, color: 'text-green-500', label: 'Approuvée' },
    rejected: { icon: XCircle, color: 'text-red-500', label: 'Rejetée' }
  };

  if (!isVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Annonces Médicales</CardTitle>
          <CardDescription>Promouvoir vos services auprès des patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Profil non vérifié</p>
            <p className="text-sm mt-1">
              Vous devez faire vérifier votre profil avant de pouvoir créer des annonces.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes Annonces Médicales</CardTitle>
          <CardDescription>Gérez vos annonces promotionnelles</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mes Annonces Médicales</CardTitle>
            <CardDescription>Gérez vos annonces promotionnelles</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle annonce
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer une annonce</DialogTitle>
                <DialogDescription>
                  Votre annonce sera visible après modération (24-48h).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Titre de l'annonce *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Consultation gratuite pour nouveaux patients"
                    value={newAd.title}
                    onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Contenu *</Label>
                  <Textarea
                    id="content"
                    placeholder="Décrivez votre offre ou service..."
                    rows={4}
                    value={newAd.content}
                    onChange={(e) => setNewAd({ ...newAd, content: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image (optionnel)</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setNewAd({ ...newAd, image: e.target.files?.[0] || null })}
                    />
                    <Label htmlFor="image" className="cursor-pointer text-sm">
                      {newAd.image ? newAd.image.name : 'Ajouter une image'}
                    </Label>
                  </div>
                </div>
                <Button 
                  onClick={handleCreateAd} 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Soumettre l\'annonce'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {ads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune annonce pour le moment</p>
            <p className="text-sm mt-1">Créez votre première annonce pour attirer plus de patients.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => {
              const StatusIcon = statusConfig[ad.status].icon;
              return (
                <div key={ad.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{ad.title}</h4>
                        <Badge variant="outline" className={statusConfig[ad.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[ad.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {ad.content}
                      </p>
                      {ad.status === 'rejected' && ad.rejectionReason && (
                        <p className="text-sm text-destructive mt-2">
                          Raison: {ad.rejectionReason}
                        </p>
                      )}
                    </div>
                    {ad.imageUrl && (
                      <img 
                        src={ad.imageUrl} 
                        alt={ad.title}
                        className="w-16 h-16 object-cover rounded ml-4"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(ad.createdAt, 'dd MMM yyyy', { locale: fr })}
                      </span>
                      {ad.status === 'approved' && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {ad.views} vues
                        </span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteAd(ad.id)}
                      disabled={deletingId === ad.id}
                    >
                      {deletingId === ad.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Re-export the type for backward compatibility
export type { MedicalAd } from '@/services/medicalAdsService';
