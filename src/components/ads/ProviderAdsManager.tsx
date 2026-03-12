import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus, Image as ImageIcon, Calendar, Eye, Trash2, Clock, CheckCircle, XCircle,
  Loader2, Heart, Megaphone, Edit2, AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Ad, createAd, deleteAd, getProviderAds, uploadAdImage, updateAd,
} from '@/services/adsService';

interface ProviderAdsManagerProps {
  providerId: string;
  providerUserId: string;
  providerName: string;
  providerAvatar?: string;
  providerType?: string;
  providerCity?: string;
  isVerified: boolean;
}

const MAX_ADS = 5;

export function ProviderAdsManager({
  providerId, providerUserId, providerName, providerAvatar, providerType, providerCity, isVerified,
}: ProviderAdsManagerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    short_description: '',
    full_description: '',
    expires_at: '',
  });

  const activeCount = ads.filter(a => a.status === 'pending' || a.status === 'approved').length;

  const loadAds = async () => {
    setIsLoading(true);
    try {
      const data = await getProviderAds(providerUserId);
      setAds(data);
    } catch { setAds([]); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadAds(); }, [providerUserId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format accepté: JPG, PNG ou WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 5 Mo)');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    if (!form.title || !form.short_description || !form.full_description) {
      toast.error('Remplissez tous les champs obligatoires');
      return;
    }
    if (form.short_description.length > 200) {
      toast.error('Description courte: max 200 caractères');
      return;
    }
    if (!imageFile) {
      toast.error('L\'image de couverture est obligatoire');
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrl = await uploadAdImage(imageFile, providerUserId);

      await createAd({
        provider_id: providerUserId,
        provider_name: providerName,
        provider_avatar: providerAvatar,
        provider_type: providerType,
        provider_city: providerCity,
        title: form.title,
        short_description: form.short_description,
        full_description: form.full_description,
        image_url: imageUrl,
        is_verified_provider: isVerified,
        expires_at: form.expires_at || undefined,
      });

      setForm({ title: '', short_description: '', full_description: '', expires_at: '' });
      setImageFile(null);
      setImagePreview(null);
      setIsDialogOpen(false);
      toast.success('Annonce créée ! En attente de modération.');
      loadAds();
    } catch (error: any) {
      if (error.message === 'PROFANITY_DETECTED') {
        toast.error('Contenu inapproprié détecté. Veuillez reformuler.');
      } else if (error.message === 'MAX_ADS_REACHED') {
        toast.error(`Limite atteinte (${MAX_ADS} annonces actives max)`);
      } else {
        toast.error('Erreur lors de la création');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (adId: string) => {
    setDeletingId(adId);
    try {
      await deleteAd(adId);
      toast.success('Annonce supprimée');
      loadAds();
    } catch { toast.error('Erreur de suppression'); }
    finally { setDeletingId(null); }
  };

  const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
    pending: { icon: Clock, color: 'text-amber-500', label: 'En attente' },
    approved: { icon: CheckCircle, color: 'text-emerald-500', label: 'Approuvée' },
    rejected: { icon: XCircle, color: 'text-red-500', label: 'Rejetée' },
    suspended: { icon: AlertTriangle, color: 'text-orange-500', label: 'Suspendue' },
  };

  if (!isVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" />Mes Publicités</CardTitle>
          <CardDescription>Promouvoir vos services auprès des patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Profil non vérifié</p>
            <p className="text-sm mt-1">Vous devez faire vérifier votre profil avant de publier des annonces.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
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
            <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" />Mes Publicités</CardTitle>
            <CardDescription>Gérez vos annonces promotionnelles</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={activeCount >= MAX_ADS}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle annonce
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une annonce</DialogTitle>
                <DialogDescription>Votre annonce sera visible après modération.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label>Image de couverture *</Label>
                  <div className="mt-2 border-2 border-dashed rounded-xl p-4 text-center hover:border-primary transition-colors cursor-pointer relative overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">JPG, PNG ou WebP • Max 5 Mo</p>
                      </>
                    )}
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
                <div>
                  <Label>Titre *</Label>
                  <Input
                    placeholder="Ex: Consultation gratuite pour nouveaux patients"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description courte * <span className="text-xs text-muted-foreground">({form.short_description.length}/200)</span></Label>
                  <Textarea
                    placeholder="Texte de prévisualisation (max 200 car.)"
                    rows={2}
                    maxLength={200}
                    value={form.short_description}
                    onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description complète *</Label>
                  <Textarea
                    placeholder="Décrivez votre offre en détail..."
                    rows={4}
                    value={form.full_description}
                    onChange={(e) => setForm({ ...form, full_description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Date d'expiration (optionnel)</Label>
                  <Input
                    type="date"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Création...</> : "Soumettre l'annonce"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active ads limit indicator */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{activeCount}/{MAX_ADS} annonces actives</span>
            {activeCount >= MAX_ADS && <span className="text-amber-500">Limite atteinte</span>}
          </div>
          <Progress value={(activeCount / MAX_ADS) * 100} className="h-1.5" />
        </div>
      </CardHeader>

      <CardContent>
        {ads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Aucune annonce pour le moment</p>
            <p className="text-sm mt-1">Créez votre première annonce pour attirer plus de patients.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ads.map((ad) => {
              const config = statusConfig[ad.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              return (
                <div key={ad.id} className="border rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex gap-4">
                    {ad.image_url && (
                      <img src={ad.image_url} alt={ad.title} className="w-20 h-14 object-cover rounded-lg shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{ad.title}</h4>
                        <Badge variant="outline" className={config.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{ad.short_description}</p>

                      {ad.status === 'rejected' && ad.rejection_reason && (
                        <p className="text-xs text-destructive mt-1">Raison: {ad.rejection_reason}</p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(ad.created_at), 'dd MMM yyyy', { locale: fr })}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{ad.views_count}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{ad.likes_count}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleDelete(ad.id)}
                      disabled={deletingId === ad.id}
                    >
                      {deletingId === ad.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
