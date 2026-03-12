import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Bookmark, Share2, Flag, Eye, MapPin, Calendar, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Ad, toggleLike, toggleSave, incrementViews, reportAd } from '@/services/adsService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface AdDetailDialogProps {
  ad: Ad | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  onLikeToggle?: (adId: string, liked: boolean) => void;
  onSaveToggle?: (adId: string, saved: boolean) => void;
}

export function AdDetailDialog({
  ad,
  open,
  onOpenChange,
  userId,
  isLiked = false,
  isSaved = false,
  onLikeToggle,
  onSaveToggle,
}: AdDetailDialogProps) {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [likesCount, setLikesCount] = useState(0);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    if (ad && open) {
      setLiked(isLiked);
      setSaved(isSaved);
      setLikesCount(ad.likes_count);
      // Increment views
      incrementViews(ad.id).catch(() => {});
    }
  }, [ad, open, isLiked, isSaved]);

  if (!ad) return null;

  const handleLike = async () => {
    if (!userId) { toast.info('Connectez-vous pour aimer cette annonce'); return; }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
    try {
      await toggleLike(ad.id, userId);
      onLikeToggle?.(ad.id, newLiked);
    } catch { setLiked(!newLiked); }
  };

  const handleSave = async () => {
    if (!userId) { toast.info('Connectez-vous pour sauvegarder'); return; }
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      await toggleSave(ad.id, userId);
      onSaveToggle?.(ad.id, newSaved);
      toast.success(newSaved ? 'Annonce sauvegardée' : 'Retirée des sauvegardes');
    } catch { setSaved(!newSaved); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/annonces?ad=${ad.id}`);
    toast.success('Lien copié !');
  };

  const handleReport = async () => {
    if (!userId) { toast.info('Connectez-vous pour signaler'); return; }
    if (!reportReason) { toast.error('Veuillez sélectionner une raison'); return; }
    setReporting(true);
    try {
      await reportAd(ad.id, userId, reportReason, reportDetails);
      toast.success('Signalement envoyé, merci.');
      setShowReportForm(false);
      setReportReason('');
      setReportDetails('');
    } catch {
      toast.error('Erreur lors du signalement');
    } finally {
      setReporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">{ad.title}</DialogTitle>

        {/* Full image */}
        <div className="relative aspect-video">
          <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 right-4 flex gap-2">
            {ad.is_featured && (
              <Badge className="bg-amber-500/90 text-white border-0">⭐ Sponsorisé</Badge>
            )}
            {ad.is_verified_provider && (
              <Badge className="bg-primary/90 text-primary-foreground border-0">✓ Vérifié</Badge>
            )}
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/80 text-sm">
            <Eye className="h-4 w-4" />
            {ad.views_count + 1} vues
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Provider */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={ad.provider_avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">{ad.provider_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{ad.provider_name}</span>
                  {ad.is_verified_provider && <VerifiedBadge type="verified" size="sm" showTooltip={false} />}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {ad.provider_type && <span>{ad.provider_type}</span>}
                  {ad.provider_city && (
                    <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{ad.provider_city}</span>
                  )}
                </div>
              </div>
            </div>
            <Link to={`/provider/${ad.provider_id}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                Voir le profil <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Title + Description */}
          <div>
            <h2 className="text-xl font-bold mb-2">{ad.title}</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{ad.full_description}</p>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Publié le {format(new Date(ad.created_at), 'dd MMMM yyyy', { locale: fr })}</span>
            {ad.expires_at && (
              <span className="flex items-center gap-1.5 text-amber-600">
                <Clock className="h-3.5 w-3.5" />Expire le {format(new Date(ad.expires_at), 'dd MMM yyyy', { locale: fr })}
              </span>
            )}
          </div>

          {/* Engagement bar */}
          <div className="flex items-center gap-2 pt-3 border-t">
            <Button variant={liked ? 'default' : 'outline'} size="sm" className="gap-1.5" onClick={handleLike}>
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              {likesCount}
            </Button>
            <Button variant={saved ? 'default' : 'outline'} size="sm" className="gap-1.5" onClick={handleSave}>
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
              {saved ? 'Sauvegardé' : 'Sauvegarder'}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Partager
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-destructive ml-auto"
              onClick={() => setShowReportForm(!showReportForm)}
            >
              <Flag className="h-4 w-4" /> Signaler
            </Button>
          </div>

          {/* Report form */}
          {showReportForm && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-xl">
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger><SelectValue placeholder="Raison du signalement" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam / Publicité abusive</SelectItem>
                  <SelectItem value="inappropriate">Contenu inapproprié</SelectItem>
                  <SelectItem value="misleading">Information trompeuse</SelectItem>
                  <SelectItem value="non_medical">Non médical</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Détails supplémentaires (optionnel)"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleReport} disabled={reporting}>
                  {reporting ? 'Envoi...' : 'Envoyer le signalement'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReportForm(false)}>Annuler</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
