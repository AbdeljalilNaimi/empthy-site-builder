import { MapPin, Phone, Mail, MessageSquare, Pencil, Trash2, Clock, Apple, Pill, Wrench, Car, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import { ProvideOffer, ProvideCategory, PROVIDE_CATEGORIES, PROVIDE_STATUS_KEYS } from '@/types/provide';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactDialog } from './ContactDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import type { LucideIcon } from 'lucide-react';

interface OfferCardProps {
  offer: ProvideOffer;
  isOwner?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

const categoryIcons: Record<ProvideCategory, LucideIcon> = {
  food: Apple,
  medicine: Pill,
  tools: Wrench,
  transport: Car,
  other: Package,
};

const categoryColors: Record<string, string> = {
  food: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  medicine: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  tools: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  transport: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
  other: 'bg-muted text-muted-foreground border-border',
};

const statusColors: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  reserved: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  taken: 'bg-muted text-muted-foreground',
};

const contactIcons: Record<string, LucideIcon> = { phone: Phone, email: Mail, in_app: MessageSquare };

function useTimeAgo(t: (s: 'offers', k: any) => string) {
  return (dateStr: string): string => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return t('offers', 'justNow');
    if (mins < 60) return t('offers', 'minutesAgo').replace('{n}', String(mins));
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('offers', 'hoursAgo').replace('{n}', String(hours));
    const days = Math.floor(hours / 24);
    if (days < 7) return t('offers', 'daysAgo').replace('{n}', String(days));
    return new Date(dateStr).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  };
}

function getCategoryLabel(t: (s: 'offers', k: any) => string, category: ProvideCategory): string {
  const cat = PROVIDE_CATEGORIES.find((c) => c.value === category);
  return cat ? t('offers', cat.labelKey as any) : category;
}

export const OfferCard = ({ offer, isOwner, onEdit, onDelete, isDeleting }: OfferCardProps) => {
  const [showContact, setShowContact] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const timeAgo = useTimeAgo(t);
  const CatIcon = categoryIcons[offer.category] || Package;
  const ContactIcon = contactIcons[offer.contactMethod] || MessageSquare;
  const initials = offer.ownerName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const statusKey = PROVIDE_STATUS_KEYS[offer.status];

  return (
    <>
      <Card className="overflow-hidden border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300 group">
        {/* Header — Avatar + Name + Time */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          {offer.providerId ? (
            <button onClick={() => navigate(`/provider/${offer.providerId}`)} className="cursor-pointer group/avatar">
              <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-sm group-hover/avatar:ring-2 group-hover/avatar:ring-primary/40 transition-all">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          ) : (
            <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-sm">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {offer.providerId ? (
                <button
                  onClick={() => navigate(`/provider/${offer.providerId}`)}
                  className="font-semibold text-sm text-primary hover:underline truncate cursor-pointer"
                >
                  {offer.ownerName}
                </button>
              ) : (
                <span className="font-semibold text-sm text-foreground truncate">{offer.ownerName}</span>
              )}
              {offer.verified && <VerifiedBadge size="sm" showTooltip={false} />}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Clock className="h-3 w-3 shrink-0" />
              <span>{timeAgo(offer.createdAt)}</span>
              <span className="text-border">•</span>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 border ${categoryColors[offer.category]}`}>
                <CatIcon className="h-3 w-3 ltr:mr-0.5 rtl:ml-0.5 shrink-0" />
                {getCategoryLabel(t, offer.category)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Title inline */}
        <div className="px-4 pb-2">
          <h3 className="font-bold text-base leading-snug text-foreground">{offer.title}</h3>
          <p className={`text-sm text-muted-foreground mt-1 ${showDetails ? '' : 'line-clamp-2'}`}>
            {offer.description}
          </p>
          {offer.description.length > 100 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-primary font-medium hover:underline mt-1"
            >
              {showDetails ? t('offers', 'showLess') : t('offers', 'showMore')}
            </button>
          )}
        </div>

        {/* Image */}
        {offer.imageUrl ? (
          <div className="border-t border-b border-border">
            <AspectRatio ratio={16 / 9}>
              <img
                src={offer.imageUrl}
                alt={offer.title}
                className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />
            </AspectRatio>
          </div>
        ) : (
          <div className="mx-4 mb-2 rounded-xl bg-muted/40 flex flex-col items-center justify-center h-36 border border-border/50">
            <CatIcon className={`h-12 w-12 ${offer.category === 'other' ? 'text-muted-foreground/30' : 'text-primary/25'}`} />
          </div>
        )}

        <CardContent className="px-4 pt-3 pb-4 space-y-3">
          {/* Location + Status row */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground">
            {offer.location.label && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {offer.location.label}
              </span>
            )}
            {isOwner ? (
              <Badge variant="outline" className={`shrink-0 text-xs ${statusColors[offer.status]}`}>
                {t('offers', statusKey as any)}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {t('offers', 'statusAvailable')}
              </Badge>
            )}
          </div>

          {/* Facebook-style action bar */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            {!isOwner && (
              <>
              <Button
                  size="sm"
                  variant="default"
                  onClick={() => offer.providerId ? navigate(`/provider/${offer.providerId}`) : setShowContact(true)}
                  className="flex-1 gap-1.5 h-9 font-medium"
                >
                  <ContactIcon className="h-4 w-4" />
                  {t('offers', 'contact')}
                </Button>
                {offer.location.lat && offer.location.lng && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/map/providers?lat=${offer.location.lat}&lng=${offer.location.lng}`)
                    }
                    className="gap-1.5 h-9"
                  >
                    <MapPin className="h-4 w-4" />
                    {t('offers', 'locate')}
                  </Button>
                )}
              </>
            )}
            {isOwner && (
              <>
                <Button size="sm" variant="outline" onClick={() => onEdit?.(offer.id)} className="flex-1 gap-1.5 h-9">
                  <Pencil className="h-3.5 w-3.5" /> {t('offers', 'edit')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete?.(offer.id)}
                  disabled={isDeleting}
                  className="gap-1.5 h-9"
                >
                  <Trash2 className="h-3.5 w-3.5" /> {t('offers', 'deleteOffer')}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <ContactDialog offer={offer} open={showContact} onOpenChange={setShowContact} />
    </>
  );
};
