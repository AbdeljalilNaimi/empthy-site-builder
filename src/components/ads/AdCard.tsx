import { useState } from 'react';
import { Heart, Bookmark, Share2, Flag, Eye, MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Ad, toggleLike, toggleSave } from '@/services/adsService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import { motion, AnimatePresence } from 'framer-motion';

interface AdCardProps {
  ad: Ad;
  userId?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  onLikeToggle?: (adId: string, liked: boolean) => void;
  onSaveToggle?: (adId: string, saved: boolean) => void;
  onReport?: (adId: string) => void;
  onClick?: () => void;
}

export function AdCard({
  ad,
  userId,
  isLiked = false,
  isSaved = false,
  onLikeToggle,
  onSaveToggle,
  onReport,
  onClick,
}: AdCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [likesCount, setLikesCount] = useState(ad.likes_count);
  const [animateLike, setAnimateLike] = useState(false);

  const isNew = new Date().getTime() - new Date(ad.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;
  const hasExpiry = !!ad.expires_at;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) { toast.info('Connectez-vous pour aimer cette annonce'); return; }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
    if (newLiked) { setAnimateLike(true); setTimeout(() => setAnimateLike(false), 600); }
    try {
      await toggleLike(ad.id, userId);
      onLikeToggle?.(ad.id, newLiked);
    } catch { setLiked(!newLiked); setLikesCount(ad.likes_count); }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) { toast.info('Connectez-vous pour sauvegarder'); return; }
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      await toggleSave(ad.id, userId);
      onSaveToggle?.(ad.id, newSaved);
      toast.success(newSaved ? 'Annonce sauvegardée' : 'Retirée des sauvegardes');
    } catch { setSaved(!newSaved); }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/annonces?ad=${ad.id}`);
    toast.success('Lien copié !');
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReport?.(ad.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-card rounded-2xl shadow-sm hover:shadow-md border border-border/50 overflow-hidden transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 justify-end">
          {ad.is_featured && (
            <Badge className="bg-amber-500/90 text-white border-0 text-[10px] px-2 py-0.5 backdrop-blur-sm">
              ⭐ Sponsorisé
            </Badge>
          )}
          {ad.is_verified_provider && (
            <Badge className="bg-primary/90 text-primary-foreground border-0 text-[10px] px-2 py-0.5 backdrop-blur-sm">
              ✓ Vérifié
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-emerald-500/90 text-white border-0 text-[10px] px-2 py-0.5 backdrop-blur-sm">
              Nouveau
            </Badge>
          )}
          {hasExpiry && (
            <Badge className="bg-red-500/90 text-white border-0 text-[10px] px-2 py-0.5 backdrop-blur-sm">
              Offre limitée
            </Badge>
          )}
        </div>

        {/* Views count */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white/80 text-xs bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
          <Eye className="h-3 w-3" />
          {ad.views_count}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Provider info */}
        <div className="flex items-center gap-2.5 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={ad.provider_avatar || undefined} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {ad.provider_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium truncate">{ad.provider_name}</p>
              {ad.is_verified_provider && <VerifiedBadge type="verified" size="sm" showTooltip={false} />}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              {ad.provider_type && <span>{ad.provider_type}</span>}
              {ad.provider_type && ad.provider_city && <span>·</span>}
              {ad.provider_city && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5" />
                  {ad.provider_city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Title + Description */}
        <h3 className="font-semibold text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
          {ad.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {ad.short_description}
        </p>

        {/* Engagement bar */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2 gap-1.5 text-muted-foreground hover:text-red-500",
                liked && "text-red-500"
              )}
              onClick={handleLike}
            >
              <AnimatePresence>
                {animateLike && (
                  <motion.div
                    className="absolute"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </motion.div>
                )}
              </AnimatePresence>
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              <span className="text-xs">{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2 text-muted-foreground hover:text-primary",
                saved && "text-primary"
              )}
              onClick={handleSave}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-primary"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-destructive"
              onClick={handleReport}
            >
              <Flag className="h-3.5 w-3.5" />
            </Button>
          </div>

          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(ad.created_at), 'dd MMM yyyy', { locale: fr })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
