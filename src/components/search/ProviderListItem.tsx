import { memo, useRef, useEffect } from 'react';
import { Star, Phone, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { isProviderVerified } from '@/utils/verificationUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProviderAvatar } from '@/components/ui/ProviderAvatar';
import type { CityHealthProvider } from '@/data/providers';

interface ProviderListItemProps {
  provider: CityHealthProvider;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  distance?: number;
}

export const ProviderListItem = memo(({ 
  provider, 
  isSelected, 
  isHovered,
  onSelect, 
  onHover,
  distance
}: ProviderListItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVerified = isProviderVerified(provider);
  const { t } = useLanguage();

  // Auto-scroll into view when selected from map
  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSelected]);

  return (
    <div
      ref={ref}
      className={cn(
        "p-3 border-b border-border cursor-pointer transition-colors",
        isSelected && "bg-primary/5 border-l-2 border-l-primary",
        isHovered && !isSelected && "bg-muted/50",
        !isSelected && !isHovered && "hover:bg-muted/30"
      )}
      onClick={() => onSelect(provider.id)}
      onMouseEnter={() => onHover(provider.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar/Image */}
        <ProviderAvatar
          image={provider.image}
          name={provider.name}
          type={provider.type}
          className="w-12 h-12 rounded-lg"
          iconSize={24}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h4 className="font-medium text-sm truncate">{provider.name}</h4>
            {isVerified && (
              <CheckCircle size={14} className="text-primary flex-shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground truncate mb-1.5">
            {provider.specialty || provider.type}
          </p>

          <div className="flex items-center gap-3 text-xs">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{provider.rating}</span>
              <span className="text-muted-foreground">({provider.reviewsCount})</span>
            </div>

            {/* Distance */}
            {distance && (
              <span className="text-muted-foreground">
                {distance} km
              </span>
            )}

            {/* Emergency indicator */}
            {provider.emergency && (
              <span className="text-red-500 font-medium">{t('provider', 'emergency')}</span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-1">
          {provider.phone && (
            <a 
              href={`tel:${provider.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              title={t('provider', 'callNow')}
            >
              <Phone size={14} className="text-muted-foreground" />
            </a>
          )}
        </div>
      </div>

      {/* Address */}
      <p className="text-xs text-muted-foreground mt-2 pl-[60px] truncate">
        {provider.address}
      </p>
    </div>
  );
});

ProviderListItem.displayName = 'ProviderListItem';
