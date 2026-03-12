import { memo, useCallback, useRef, useEffect, CSSProperties } from 'react';
import { List, ListImperativeAPI, RowComponentProps } from 'react-window';
import { MapPin, Star, Phone, CheckCircle, Navigation, Loader2, Clock, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isProviderVerified } from '@/utils/verificationUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { CityHealthProvider } from '@/data/providers';

const ITEM_HEIGHT = 130;

// Specialty / type color badges
const getTypeColors = (type: string): string => {
  const map: Record<string, string> = {
    doctor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    pharmacy: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
    hospital: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    lab: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    clinic: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    radiology_center: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    dentist: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    blood_cabin: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  };
  return map[type] || 'bg-muted text-muted-foreground border-border';
};

interface ProviderRowProps {
  index: number;
  style: CSSProperties;
  ariaAttributes?: Record<string, unknown>;
  providers: CityHealthProvider[];
  selectedProviderId: string | null;
  hoveredProviderId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onRouteRequest: (provider: CityHealthProvider) => void;
  routingProviderId?: string | null;
  calculateDistance: (lat: number, lng: number) => number | null;
  rowTranslations: { verified: string; call: string; route: string };
}

const ProviderRow = memo(({
  index,
  style,
  providers,
  selectedProviderId,
  hoveredProviderId,
  onSelect,
  onHover,
  onRouteRequest,
  routingProviderId,
  calculateDistance,
  rowTranslations,
}: ProviderRowProps) => {
  const provider = providers[index];
  if (!provider) return null;

  const isSelected = selectedProviderId === provider.id;
  const isHovered = hoveredProviderId === provider.id;
  const isVerified = isProviderVerified(provider);
  const distance = calculateDistance(provider.lat, provider.lng);
  const isThisRouting = routingProviderId === provider.id;

  return (
    <div
      style={style}
      className="px-2 py-1.5 cursor-pointer"
      onClick={() => onSelect(provider.id)}
      onMouseEnter={() => onHover(provider.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className={cn(
        "h-full rounded-xl border p-3 transition-all duration-200 flex flex-col gap-2 bg-card",
        isSelected
          ? "border-primary shadow-md ring-1 ring-primary/30 bg-primary/5"
          : isHovered
            ? "border-primary/50 shadow-md bg-muted/40"
            : "border-border/50 hover:border-primary/50 hover:shadow-md"
      )}>
        {/* Top row: Avatar + Info + Phone */}
        <div className="flex items-start gap-2.5">
          {/* Avatar */}
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-medium overflow-hidden",
            isVerified ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {provider.image && provider.image !== '/placeholder.svg' ? (
              <img src={provider.image} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              provider.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name + verified */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-semibold text-sm text-foreground truncate max-w-[150px]">{provider.name}</h4>
              {isVerified && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-primary/10 text-primary flex-shrink-0">
                  <CheckCircle size={9} />{rowTranslations.verified}
                </span>
              )}
            </div>

            {/* Type badge + specialty */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border flex-shrink-0",
                getTypeColors(provider.type)
              )}>
                {provider.type}
              </span>
              {provider.specialty && (
                <p className="text-xs text-muted-foreground truncate">{provider.specialty}</p>
              )}
            </div>

            {/* Meta: rating, distance, 24/7 */}
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-0.5">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span className="font-semibold text-foreground">{provider.rating}</span>
                <span className="text-[10px]">({provider.reviewsCount})</span>
              </div>
              {distance !== null && (
                <div className="flex items-center gap-0.5">
                  <Navigation size={10} /><span>{distance} km</span>
                </div>
              )}
              {provider.emergency && (
                <span className="flex items-center gap-0.5 text-destructive font-medium">
                  <Clock size={10} />24/7
                </span>
              )}
            </div>
          </div>

          {/* Phone */}
          {provider.phone && (
            <a
              href={`tel:${provider.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
              title={rowTranslations.call}
            >
              <Phone size={13} />
            </a>
          )}
        </div>

        {/* Bottom row: Address + Itinéraire (always visible) */}
        <div className="flex items-center justify-between gap-2 pl-[50px]">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground min-w-0">
            <MapPin size={9} className="flex-shrink-0" />
            <span className="truncate">{provider.address}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isThisRouting && typeof onRouteRequest === 'function') onRouteRequest(provider);
            }}
            className={cn(
              "flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-medium flex-shrink-0 transition-all",
              isThisRouting
                ? "bg-primary/10 text-primary cursor-not-allowed"
                : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
            )}
            disabled={isThisRouting}
            title={rowTranslations.route}
          >
            {isThisRouting ? <Loader2 size={10} className="animate-spin" /> : <Route size={10} />}
            <span>{rowTranslations.route}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

ProviderRow.displayName = 'ProviderRow';

interface RowData {
  providers: CityHealthProvider[];
  selectedProviderId: string | null;
  hoveredProviderId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onRouteRequest: (provider: CityHealthProvider) => void;
  routingProviderId?: string | null;
  calculateDistance: (lat: number, lng: number) => number | null;
  rowTranslations: { verified: string; call: string; route: string };
}

interface VirtualizedProviderListProps {
  providers: CityHealthProvider[];
  selectedProviderId: string | null;
  hoveredProviderId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onRouteRequest: (provider: CityHealthProvider) => void;
  routingProviderId?: string | null;
  userLocation: { lat: number; lng: number } | null;
  isLocating: boolean;
  onRequestLocation: () => void;
  calculateDistance: (lat: number, lng: number) => number | null;
  height: number;
}

export const VirtualizedProviderList = memo(({
  providers,
  selectedProviderId,
  hoveredProviderId,
  onSelect,
  onHover,
  onRouteRequest,
  routingProviderId,
  userLocation,
  isLocating,
  onRequestLocation,
  calculateDistance,
  height
}: VirtualizedProviderListProps) => {
  const { language } = useLanguage();
  const listRef = useRef<ListImperativeAPI>(null);

  const tx = {
    fr: {
      results: 'résultats', noResults: 'Aucun résultat',
      noResultsDesc: 'Modifiez vos critères de recherche',
      locateMe: 'Ma position', locating: 'Localisation...',
      locationActive: 'Tri par distance',
      verified: 'Vérifié', call: 'Appeler', route: 'Itinéraire'
    },
    ar: {
      results: 'نتائج', noResults: 'لا نتائج',
      noResultsDesc: 'عدل معايير البحث',
      locateMe: 'موقعي', locating: 'تحديد الموقع...',
      locationActive: 'ترتيب حسب المسافة',
      verified: 'موثق', call: 'اتصل', route: 'مسار'
    },
    en: {
      results: 'results', noResults: 'No results',
      noResultsDesc: 'Modify your search criteria',
      locateMe: 'My location', locating: 'Locating...',
      locationActive: 'Sort by distance',
      verified: 'Verified', call: 'Call', route: 'Route'
    }
  }[language as 'fr' | 'ar' | 'en'] || {
    results: 'results', noResults: 'No results',
    noResultsDesc: 'Modify your search criteria',
    locateMe: 'My location', locating: 'Locating...',
    locationActive: 'Sort by distance',
    verified: 'Verified', call: 'Call', route: 'Route'
  };

  useEffect(() => {
    if (selectedProviderId && listRef.current) {
      const index = providers.findIndex(p => p.id === selectedProviderId);
      if (index !== -1) listRef.current.scrollToRow({ index, align: 'smart' });
    }
  }, [selectedProviderId, providers]);

  const rowData: RowData = {
    providers, selectedProviderId, hoveredProviderId,
    onSelect, onHover, onRouteRequest, routingProviderId,
    calculateDistance,
    rowTranslations: { verified: tx.verified, call: tx.call, route: tx.route }
  };

  const rowComponent = useCallback(({ index, style, ...rest }: RowComponentProps<RowData>) => {
    const data = rest as unknown as RowData;
    return <ProviderRow
      index={index} style={style}
      providers={data.providers}
      selectedProviderId={data.selectedProviderId}
      hoveredProviderId={data.hoveredProviderId}
      onSelect={data.onSelect}
      onHover={data.onHover}
      onRouteRequest={data.onRouteRequest}
      routingProviderId={data.routingProviderId}
      calculateDistance={data.calculateDistance}
      rowTranslations={data.rowTranslations}
    />;
  }, []);

  const headerHeight = 44;
  const listHeight = Math.max(height - headerHeight, 200);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div
        className="px-4 border-b border-border flex items-center justify-between gap-3 flex-shrink-0"
        style={{ height: headerHeight }}
      >
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{providers.length}</span> {tx.results}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRequestLocation}
          disabled={isLocating}
          className={cn("h-7 text-xs gap-1.5 px-2 rounded-full", userLocation && "text-primary bg-primary/5")}
        >
          {isLocating ? (
            <><Loader2 size={12} className="animate-spin" /><span className="hidden sm:inline">{tx.locating}</span></>
          ) : (
            <><Navigation size={12} /><span className="hidden sm:inline">{userLocation ? tx.locationActive : tx.locateMe}</span></>
          )}
        </Button>
      </div>

      {providers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{tx.noResults}</p>
            <p className="text-xs text-muted-foreground/60">{tx.noResultsDesc}</p>
          </div>
        </div>
      ) : (
        <List
          listRef={listRef}
          rowCount={providers.length}
          rowHeight={ITEM_HEIGHT}
          rowComponent={rowComponent}
          rowProps={rowData}
          overscanCount={5}
          style={{ height: listHeight, width: '100%' }}
        />
      )}
    </div>
  );
});

VirtualizedProviderList.displayName = 'VirtualizedProviderList';
