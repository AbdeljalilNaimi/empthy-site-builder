import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Navigation,
  Star,
  Phone,
  ExternalLink,
  List,
  Loader2,
  AlertTriangle,
  Search,
  X,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { CityHealthProvider, ProviderType, PROVIDER_TYPE_LABELS, PROVIDER_TYPES } from '@/data/providers';
import { useMapContext } from '@/contexts/MapContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { isProviderVerified } from '@/utils/verificationUtils';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import { ProviderAvatar } from '@/components/ui/ProviderAvatar';
import { Switch } from '@/components/ui/switch';

export type MapSidebarMode = 'providers' | 'emergency' | 'blood';

interface MapSidebarProps {
  providers: CityHealthProvider[];
  distances: Map<string, number>;
  loading: boolean;
  label?: string;
  mode?: MapSidebarMode;
}

export const MapSidebar = ({
  providers,
  distances,
  loading,
  label,
  mode = 'providers',
}: MapSidebarProps) => {
  const { selectedProvider, setSelectedProvider, calculateRoute, isRouting, isRTL, flyTo, sidebarOpen, setSidebarOpen } = useMapContext();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [routingId, setRoutingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const providerRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const listContainerRef = useRef<HTMLDivElement>(null);
  const mobileListContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to selected provider when it changes (triggered by map marker click)
  useEffect(() => {
    if (!selectedProvider) return;
    
    const scrollToProvider = () => {
      const element = providerRefs.current.get(selectedProvider.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Ensure the provider is visible in the list (expand visibleCount if needed)
    const providerIndex = providers.findIndex(p => p.id === selectedProvider.id);
    if (providerIndex >= visibleCount) {
      setVisibleCount(providerIndex + 5);
      // Wait for DOM update then scroll
      setTimeout(scrollToProvider, 100);
    } else {
      scrollToProvider();
    }
  }, [selectedProvider?.id, providers, visibleCount]);

  // Read current filters from URL
  const searchQuery = searchParams.get('q') || '';
  const typesParam = searchParams.get('types');
  const openOnly = searchParams.get('open') === '1';
  const activeTypes = useMemo(() => {
    if (!typesParam) return new Set<ProviderType>();
    return new Set(typesParam.split(',') as ProviderType[]);
  }, [typesParam]);

  const showTypeFilters = mode === 'providers';
  const showOpenToggle = mode === 'providers';

  // Update URL params
  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const toggleType = useCallback((type: ProviderType) => {
    const next = new Set(activeTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    updateParam('types', next.size > 0 ? Array.from(next).join(',') : null);
    setVisibleCount(10);
  }, [activeTypes, updateParam]);

  const visibleProviders = useMemo(() => providers.slice(0, visibleCount), [providers, visibleCount]);
  const hasMore = providers.length > visibleCount;

  const t = useMemo(() => ({
    fr: {
      providers: 'prestataires', provider: 'prestataire', km: 'km',
      noResults: 'Aucun prestataire trouvé', noResultsSub: 'Essayez de modifier vos filtres',
      route: 'Itinéraire', close: 'Masquer', open: 'Voir la liste',
      emergency247: '24/7', searchPlaceholder: 'Rechercher un prestataire...',
      showMore: 'Voir plus', allTypes: 'Tous', openNow: 'Ouvert',
    },
    ar: {
      providers: 'مقدمين', provider: 'مقدم', km: 'كم',
      noResults: 'لم يتم العثور على مقدمين', noResultsSub: 'حاول تعديل الفلاتر',
      route: 'الاتجاهات', close: 'إخفاء', open: 'عرض القائمة',
      emergency247: '24/7', searchPlaceholder: 'البحث عن مقدم خدمة...',
      showMore: 'عرض المزيد', allTypes: 'الكل', openNow: 'مفتوح',
    },
    en: {
      providers: 'providers', provider: 'provider', km: 'km',
      noResults: 'No providers found', noResultsSub: 'Try adjusting your filters',
      route: 'Directions', close: 'Hide', open: 'Show list',
      emergency247: '24/7', searchPlaceholder: 'Search providers...',
      showMore: 'Show more', allTypes: 'All', openNow: 'Open now',
    },
  }), []);

  const tx = t[language as keyof typeof t] || t.fr;

  const handleProviderClick = (provider: CityHealthProvider) => {
    try {
      setSelectedProvider(provider);
      if (provider.lat != null && provider.lng != null) {
        flyTo(provider.lat, provider.lng, 16);
      }
      // Collapse mobile bottom sheet so the ProviderCard is visible
      setMobileExpanded(false);
    } catch (error) {
      console.error('Error selecting provider:', error);
    }
  };

  const handleRoute = (e: React.MouseEvent, provider: CityHealthProvider) => {
    e.stopPropagation();
    setRoutingId(provider.id);
    calculateRoute(provider);
    setTimeout(() => setRoutingId(null), 3000);
  };

  // ─── Provider Card Item ───
  const ProviderItem = ({ provider }: { provider: CityHealthProvider }) => {
    const distance = distances.get(provider.id);
    const isSelected = selectedProvider?.id === provider.id;
    const typeLabel = PROVIDER_TYPE_LABELS[provider.type]?.[language as 'fr' | 'ar' | 'en'] || provider.type;
    const isComputingRoute = routingId === provider.id || (isRouting && isSelected);

    return (
      <div
        ref={(el) => {
          if (el) providerRefs.current.set(provider.id, el);
          else providerRefs.current.delete(provider.id);
        }}
        className={cn(
          'w-full flex gap-2.5 p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer',
          'hover:bg-accent/50',
          isSelected
            ? 'bg-primary/5 ring-1 ring-primary/30 shadow-sm'
            : 'border border-transparent'
        )}
        onClick={() => handleProviderClick(provider)}
        role="button"
        tabIndex={0}
      >
        <ProviderAvatar
          image={provider.image !== '/placeholder.svg' ? provider.image : null}
          name={provider.name}
          type={provider.type}
          className="h-10 w-10 rounded-xl ring-1 ring-border/20 flex-shrink-0"
          iconSize={18}
        />

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1">
            <h4 className="font-medium text-xs leading-snug truncate flex-1 text-foreground">
              {provider.name}
            </h4>
            {isProviderVerified(provider) && (
              <VerifiedBadge type={(provider as any).planType === 'premium' ? 'premium' : 'verified'} size="sm" showTooltip={false} />
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-normal rounded-md">
              {typeLabel}
            </Badge>
            {provider.emergency && (
              <Badge variant="destructive" className="text-[9px] h-4 px-1.5 rounded-md">
                {tx.emergency247}
              </Badge>
            )}
            {distance !== undefined && (
              <span className="text-muted-foreground text-[10px]">
                {distance.toFixed(1)} {tx.km}
              </span>
            )}
            {provider.rating && (
              <div className="flex items-center gap-0.5">
                <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] font-medium">{provider.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-1 pt-0.5" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm" variant="default"
              className="flex-1 h-6 text-[10px] gap-1 rounded-md shadow-sm px-2"
              onClick={(e) => handleRoute(e, provider)}
              disabled={isComputingRoute}
            >
              {isComputingRoute ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Navigation className="h-2.5 w-2.5" />}
              {tx.route}
            </Button>
            {provider.phone && (
              <Button size="sm" variant="outline" className="h-6 w-6 p-0 flex-shrink-0 rounded-md" asChild onClick={(e) => e.stopPropagation()}>
                <a href={`tel:${provider.phone}`}><Phone className="h-2.5 w-2.5" /></a>
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-6 w-6 p-0 flex-shrink-0 rounded-md" asChild onClick={(e) => e.stopPropagation()}>
              <Link to={`/provider/${provider.id}`}><ExternalLink className="h-2.5 w-2.5" /></Link>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Type Filter Pills with Arrow Navigation ───
  const TypeFilters = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 2);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
    }, []);

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      checkScroll();
      el.addEventListener('scroll', checkScroll, { passive: true });
      const ro = new ResizeObserver(checkScroll);
      ro.observe(el);
      return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect(); };
    }, [checkScroll]);

    const scroll = (dir: 'left' | 'right') => {
      scrollRef.current?.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' });
    };

    return (
      <div className="relative group">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-card/90 border border-border/50 shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all",
              isRTL ? "right-0" : "left-0"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className={cn("h-3.5 w-3.5", isRTL && "rotate-180")} />
          </button>
        )}

        <div
          ref={scrollRef}
          className={cn(
            "flex overflow-x-auto gap-1 scrollbar-none pb-0.5",
            canScrollLeft && (isRTL ? "pr-5" : "pl-5"),
            canScrollRight && (isRTL ? "pl-5" : "pr-5")
          )}
        >
            <button
            type="button"
            onClick={() => updateParam('types', null)}
            className={cn(
              "inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border whitespace-nowrap flex-shrink-0",
              activeTypes.size === 0
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-accent"
            )}
          >
            {tx.allTypes}
          </button>
          {PROVIDER_TYPES.map(type => {
            const label = PROVIDER_TYPE_LABELS[type];
            const isActive = activeTypes.has(type);
            return (
                <button
                type="button"
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  "inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border whitespace-nowrap flex-shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-accent"
                )}
              >
                {language === 'ar' ? label?.ar : language === 'en' ? label?.en : label?.fr}
              </button>
            );
          })}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-card/90 border border-border/50 shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all",
              isRTL ? "left-0" : "right-0"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className={cn("h-3.5 w-3.5", isRTL && "rotate-180")} />
          </button>
        )}
      </div>
    );
  };

  // ─── Provider List Content ───
  const ListContent = ({ maxH }: { maxH: string }) => (
    <div className={cn(maxH, "overflow-y-auto")}>
      {loading ? (
        <div className="p-2 space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-2.5 p-2.5 rounded-xl">
              <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2.5 py-12 px-5 text-center">
          <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">{tx.noResults}</p>
          <p className="text-[11px] text-muted-foreground/60">{tx.noResultsSub}</p>
        </div>
      ) : (
        <div className="p-2 space-y-0.5">
          {visibleProviders.map(provider => (
            <ProviderItem key={provider.id} provider={provider} />
          ))}
          {hasMore && (
            <button
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 mt-1 rounded-xl text-[11px] font-medium text-primary hover:bg-accent/40 transition-colors border border-border/30"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              {tx.showMore}
              <span className="text-muted-foreground">({providers.length - visibleCount})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  // ─── DESKTOP: Sidebar Panel ───
  // Toggle button when closed
  if (!sidebarOpen) {
    return (
      <>
        {/* Desktop toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className={cn(
            "hidden md:flex absolute top-20 z-[1000] items-center gap-2 px-3.5 py-2.5 bg-card/95 backdrop-blur-sm border border-border/60 shadow-xl text-sm font-medium text-foreground hover:bg-accent transition-all duration-200",
            isRTL ? "left-0 rounded-r-xl" : "right-0 rounded-l-xl"
          )}
          title={tx.open}
        >
          <List className="h-4 w-4 text-primary" />
          <ChevronLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
        </button>

        {/* Mobile bottom pill */}
        <MobileBottomSheet
          providers={providers}
          mobileExpanded={mobileExpanded}
          setMobileExpanded={setMobileExpanded}
          tx={tx}
          ListContent={ListContent}
          TypeFilters={showTypeFilters ? TypeFilters : null}
          searchQuery={searchQuery}
          updateParam={updateParam}
          isRTL={isRTL}
          showOpenToggle={showOpenToggle}
          openOnly={openOnly}
        />
      </>
    );
  }

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <div className={cn(
        "hidden md:flex relative z-30 flex-col w-80 flex-shrink-0 h-full bg-card overflow-hidden pointer-events-auto",
        isRTL ? "border-r border-border/60" : "border-l border-border/60"
      )}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/50 px-3 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <List className="h-3.5 w-3.5 text-primary" />
            </div>
            {loading ? <Skeleton className="h-3.5 w-24" /> : (
              <p className="text-xs font-semibold truncate">
                <span className="text-primary font-bold">{providers.length}</span>{' '}
                <span className="text-foreground">{providers.length === 1 ? tx.provider : tx.providers}</span>
                {label && <span className="text-muted-foreground"> · {label}</span>}
              </p>
            )}
          </div>
          <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0 rounded-lg hover:bg-muted" onClick={() => setSidebarOpen(false)} title={tx.close}>
            <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
          </Button>
        </div>

        {/* Search */}
        <div className="px-2.5 py-2 border-b border-border/40">
          <div className="relative">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground", isRTL ? "right-2.5" : "left-2.5")} />
            <Input
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value || null)}
              placeholder={tx.searchPlaceholder}
              className={cn("h-8 text-xs rounded-lg bg-muted/30 border-border/40", isRTL ? "pr-8 pl-7" : "pl-8 pr-7")}
            />
            {searchQuery && (
              <Button variant="ghost" size="icon" className={cn("absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded", isRTL ? "left-1.5" : "right-1.5")} onClick={() => updateParam('q', null)}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Type Filters + Open Now toggle */}
        {(showTypeFilters || showOpenToggle) && (
          <div className="px-2.5 py-1.5 border-b border-border/40 space-y-1.5 pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
            {showTypeFilters && <TypeFilters />}
            {showOpenToggle && (
              <div className="flex items-center gap-2">
                <Switch
                  id="open-now-filter"
                  checked={openOnly}
                  onCheckedChange={(checked) => updateParam('open', checked ? '1' : null)}
                />
                <label htmlFor="open-now-filter" className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 cursor-pointer select-none">
                  <Clock className="h-3 w-3" />
                  {tx.openNow}
                </label>
              </div>
            )}
          </div>
        )}

        {/* List */}
        <ListContent maxH="flex-1" />
      </div>

      {/* ─── Mobile Bottom Sheet ─── */}
      <MobileBottomSheet
        providers={providers}
        mobileExpanded={mobileExpanded}
        setMobileExpanded={setMobileExpanded}
        tx={tx}
        ListContent={ListContent}
        TypeFilters={showTypeFilters ? TypeFilters : null}
        searchQuery={searchQuery}
        updateParam={updateParam}
        isRTL={isRTL}
        showOpenToggle={showOpenToggle}
        openOnly={openOnly}
      />
    </>
  );
};

// ─── Mobile Bottom Sheet Component ───
const MobileBottomSheet = ({
  providers,
  mobileExpanded,
  setMobileExpanded,
  tx,
  ListContent,
  TypeFilters,
  searchQuery,
  updateParam,
  isRTL,
  showOpenToggle,
  openOnly,
}: {
  providers: CityHealthProvider[];
  mobileExpanded: boolean;
  setMobileExpanded: (v: boolean) => void;
  tx: any;
  ListContent: React.FC<{ maxH: string }>;
  TypeFilters: React.FC | null;
  searchQuery: string;
  updateParam: (key: string, value: string | null) => void;
  isRTL: boolean;
  showOpenToggle: boolean;
  openOnly: boolean;
}) => (
  <div className={cn(
    "md:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-card/95 backdrop-blur-xl border-t border-border/50 rounded-t-2xl shadow-2xl transition-all duration-300",
    mobileExpanded ? "max-h-[70vh]" : "max-h-[3.5rem]"
  )}>
    {/* Handle + Header */}
    <button
      className="w-full flex flex-col items-center pt-2 pb-1.5 px-4"
      onClick={() => setMobileExpanded(!mobileExpanded)}
    >
      <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />
      <div className="w-full flex items-center justify-between">
        <span className="text-xs font-semibold flex items-center gap-1.5">
          <List className="h-3.5 w-3.5 text-primary" />
          <span className="text-primary">{providers.length}</span> {tx.providers}
        </span>
        {mobileExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
      </div>
    </button>

    {/* Expandable content */}
    <div className={cn(
      "overflow-hidden transition-all duration-300",
      mobileExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    )}>
      {/* Search */}
      <div className="px-3 pb-1.5">
        <div className="relative">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground", isRTL ? "right-2.5" : "left-2.5")} />
          <Input
            value={searchQuery}
            onChange={(e) => updateParam('q', e.target.value || null)}
            placeholder={tx.searchPlaceholder}
            className={cn("h-8 text-xs rounded-lg bg-muted/30 border-border/40", isRTL ? "pr-8 pl-7" : "pl-8 pr-7")}
          />
          {searchQuery && (
            <Button variant="ghost" size="icon" className={cn("absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded", isRTL ? "left-1.5" : "right-1.5")} onClick={() => updateParam('q', null)}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Type pills + Open Now */}
      {(TypeFilters || showOpenToggle) && (
        <div className="px-3 pb-1.5 space-y-1.5 pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
          {TypeFilters && <TypeFilters />}
          {showOpenToggle && (
            <div className="flex items-center gap-2">
              <Switch
                id="open-now-filter-mobile"
                checked={openOnly}
                onCheckedChange={(checked) => updateParam('open', checked ? '1' : null)}
              />
              <label htmlFor="open-now-filter-mobile" className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 cursor-pointer select-none">
                <Clock className="h-3 w-3" />
                {tx.openNow}
              </label>
            </div>
          )}
        </div>
      )}

      <ListContent maxH="max-h-[calc(70vh-10rem)]" />
    </div>
  </div>
);
