import { memo } from 'react';
import { X, MapPin, Phone, Star, Navigation, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { isProviderVerified } from '@/utils/verificationUtils';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import type { CityHealthProvider } from '@/data/providers';
import { useMapContextSafe } from '@/contexts/MapContext';

interface ProviderInfoCardProps {
  provider: CityHealthProvider | null;
  onClose: () => void;
  userLocation?: [number, number] | null;
  onRouteRequest?: (provider: CityHealthProvider) => void;
  isRouting?: boolean;
}

export const ProviderInfoCard = memo(({ provider, onClose, userLocation, onRouteRequest, isRouting: isRoutingProp }: ProviderInfoCardProps) => {
  const { language, isRTL, t } = useLanguage();
  const isMobile = useIsMobile();
  
  const mapCtx = useMapContextSafe();

  if (!provider) return null;

  const isVerified = isProviderVerified(provider);
  const description = provider.description
    ? provider.description.length > 120
      ? provider.description.slice(0, 120) + '…'
      : provider.description
    : null;

  const handleDirections = () => {
    if (onRouteRequest) {
      onRouteRequest(provider);
    } else if (mapCtx) {
      mapCtx.calculateRoute(provider);
    } else {
      const url = userLocation
        ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${provider.lat},${provider.lng}`
        : `https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`;
      window.open(url, '_blank');
    }
  };

  const isRouting = isRoutingProp ?? mapCtx?.isRouting ?? false;

  return (
    <AnimatePresence>
      <motion.div
        key={provider.id}
        initial={isMobile ? { y: 100, opacity: 0 } : { x: isRTL ? -20 : 20, opacity: 0 }}
        animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
        exit={isMobile ? { y: 100, opacity: 0 } : { x: isRTL ? -20 : 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          "absolute z-30",
          isMobile
            ? "bottom-3 left-3 right-3"
            : cn("top-4 w-80", isRTL ? "right-4" : "left-4")
        )}
      >
        <Card className="shadow-2xl border border-border/60 backdrop-blur-sm bg-card/95 overflow-hidden">
          <CardContent className="p-0">
            {/* Header with close */}
            <div className="flex items-start gap-3 p-4 pb-2">
              {/* Avatar */}
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-semibold",
                isVerified
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                {provider.image && provider.image !== '/placeholder.svg' ? (
                  <img
                    src={provider.image}
                    alt=""
                    className="w-full h-full object-cover rounded-xl"
                    loading="lazy"
                  />
                ) : (
                  provider.name.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {provider.name}
                  </h3>
                  {isVerified && <VerifiedBadge type={(provider as any).planType === 'premium' ? 'premium' : 'verified'} size="sm" />}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {provider.specialty || provider.type}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium">{provider.rating}</span>
                  <span className="text-xs text-muted-foreground">({provider.reviewsCount})</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full flex-shrink-0 -mt-1 -me-1"
                onClick={onClose}
              >
                <X size={14} />
              </Button>
            </div>

            {/* Description */}
            {description && (
              <p className="px-4 pb-2 text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}

            {/* Address */}
            <div className="px-4 pb-2 flex items-start gap-2 text-xs text-muted-foreground">
              <MapPin size={12} className="mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{provider.address}</span>
            </div>

            {/* Emergency badge */}
            {provider.emergency && (
              <div className="mx-4 mb-2 px-2 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium inline-flex items-center gap-1">
                🚨 {t('provider', 'emergency')}
              </div>
            )}

            {/* Actions */}
            <div className="p-3 pt-2 border-t border-border/50 grid grid-cols-3 gap-2">
              {provider.phone && (
                <a href={`tel:${provider.phone}`} className="contents">
                  <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5">
                    <Phone size={13} />
                    {t('provider', 'callNow')}
                  </Button>
                </a>
              )}
              <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5" onClick={handleDirections} disabled={isRouting}>
                {isRouting ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
                {t('provider', 'getDirections')}
              </Button>
              <Link to={`/provider/${provider.id}`} className="contents">
                <Button size="sm" className="h-9 text-xs gap-1.5">
                  <ExternalLink size={13} />
                  {t('provider', 'viewProfile')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
});

ProviderInfoCard.displayName = 'ProviderInfoCard';
