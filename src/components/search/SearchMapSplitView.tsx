import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchMap, SearchMapRef } from './SearchMap';
import { VirtualizedProviderList } from './VirtualizedProviderList';
import { ProviderListSkeleton } from './ProviderListSkeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserLocation } from '@/hooks/useUserLocation';
import { Map, List, Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { CityHealthProvider } from '@/data/providers';
import type { SortOption } from '@/pages/SearchPage';
import type L from 'leaflet';

interface SearchMapSplitViewProps {
  providers: CityHealthProvider[];
  searchQuery?: string;
  onFilterByBounds?: (bounds: L.LatLngBounds) => void;
  isLoading?: boolean;
  sortBy?: SortOption;
  setSortBy?: (s: SortOption) => void;
  onToggleFilters?: () => void;
  activeFiltersCount?: number;
}

export const SearchMapSplitView = ({
  providers,
  searchQuery: externalSearchQuery,
  onFilterByBounds,
  isLoading = false,
  sortBy = 'relevance',
  setSortBy,
  onToggleFilters,
  activeFiltersCount = 0,
}: SearchMapSplitViewProps) => {
  const isMobile = useIsMobile();
  const { language, isRTL } = useLanguage();
  const mapRef = useRef<SearchMapRef>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [hoveredProviderId, setHoveredProviderId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');
  const [showSearchInArea, setShowSearchInArea] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<L.LatLngBounds | null>(null);
  const [listHeight, setListHeight] = useState(500);
  const [localSearch, setLocalSearch] = useState(externalSearchQuery || '');
  const [routeTarget, setRouteTarget] = useState<CityHealthProvider | null>(null);

  const { 
    location: userLocation, 
    isLocating, 
    requestLocation, 
    calculateDistance 
  } = useUserLocation();

  const t = {
    fr: {
      list: 'Liste', map: 'Carte',
      searchPlaceholder: 'Rechercher un prestataire...',
      filters: 'Filtres', sortBy: 'Trier par',
      relevance: 'Pertinence', distance: 'Distance', rating: 'Note',
      results: 'résultat', results_pl: 'résultats',
    },
    ar: {
      list: 'القائمة', map: 'الخريطة',
      searchPlaceholder: 'ابحث عن مزود...',
      filters: 'تصفية', sortBy: 'ترتيب حسب',
      relevance: 'الصلة', distance: 'المسافة', rating: 'التقييم',
      results: 'نتيجة', results_pl: 'نتائج',
    },
    en: {
      list: 'List', map: 'Map',
      searchPlaceholder: 'Search a provider...',
      filters: 'Filters', sortBy: 'Sort by',
      relevance: 'Relevance', distance: 'Distance', rating: 'Rating',
      results: 'result', results_pl: 'results',
    }
  };
  const tx = t[language as keyof typeof t] || t.en;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: tx.relevance },
    { value: 'distance', label: tx.distance },
    { value: 'rating', label: tx.rating },
  ];

  const filteredProviders = useMemo(() => {
    if (!localSearch.trim()) return providers;
    const q = localSearch.toLowerCase();
    return providers.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.specialty || '').toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    );
  }, [providers, localSearch]);

  const sortedProviders = useMemo(() => {
    if (!userLocation) return filteredProviders;
    return [...filteredProviders].sort((a, b) => {
      const distA = calculateDistance(a.lat, a.lng) || Infinity;
      const distB = calculateDistance(b.lat, b.lng) || Infinity;
      return distA - distB;
    });
  }, [filteredProviders, userLocation, calculateDistance]);

  useEffect(() => {
    const updateHeight = () => {
      if (listContainerRef.current) setListHeight(listContainerRef.current.clientHeight);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    const ro = new ResizeObserver(updateHeight);
    if (listContainerRef.current) ro.observe(listContainerRef.current);
    return () => { window.removeEventListener('resize', updateHeight); ro.disconnect(); };
  }, []);

  const handleProviderSelect = useCallback((id: string) => {
    setSelectedProviderId(id);
    if (mapRef.current) mapRef.current.flyToProvider(id);
    if (isMobile) setMobileTab('map');
  }, [isMobile]);

  const handleProviderHover = useCallback((id: string | null) => setHoveredProviderId(id), []);

  const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
    setCurrentBounds(bounds);
    setShowSearchInArea(true);
  }, []);

  const handleSearchInArea = useCallback(() => {
    setShowSearchInArea(false);
    if (currentBounds && onFilterByBounds) onFilterByBounds(currentBounds);
  }, [currentBounds, onFilterByBounds]);

  const handleRouteRequest = useCallback((provider: CityHealthProvider) => {
    setRouteTarget(provider);
    if (isMobile) setMobileTab('map');
  }, [isMobile]);

  const handleRouteClear = useCallback(() => {
    setRouteTarget(null);
    if (mapRef.current) mapRef.current.clearRoute();
  }, []);

  const MapSkeleton = () => (
    <div className="h-full w-full bg-muted/30 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/20" />
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      <Skeleton className="w-32 h-4 rounded" />
    </div>
  );

  const mapComponent = useMemo(() => {
    if (isLoading) return <MapSkeleton />;
    return (
      <SearchMap
        ref={mapRef}
        providers={sortedProviders}
        selectedProviderId={selectedProviderId ?? undefined}
        hoveredProviderId={hoveredProviderId ?? undefined}
        onProviderSelect={handleProviderSelect}
        onProviderHover={handleProviderHover}
        onBoundsChange={handleBoundsChange}
        showSearchInArea={showSearchInArea}
        onSearchInArea={handleSearchInArea}
        routeTarget={routeTarget}
        onRouteClear={handleRouteClear}
        onRouteRequest={handleRouteRequest}
        compact
      />
    );
  }, [isLoading, sortedProviders, selectedProviderId, hoveredProviderId, handleProviderSelect, handleProviderHover, handleBoundsChange, showSearchInArea, handleSearchInArea, routeTarget, handleRouteClear, handleRouteRequest]);

  const toggleSidebar = useCallback((open: boolean) => {
    setIsSidebarOpen(open);
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 320);
  }, []);

  // ─── Unified search header for the left panel ────────────────────────────────
  const searchHeader = (
    <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm">
      {/* Row 1: Search + Filters + Close button */}
      <div className="p-3 flex gap-2 items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder={tx.searchPlaceholder}
            className="pl-8 h-9 text-sm rounded-full bg-muted border-0 focus-visible:ring-1"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 px-3 rounded-full gap-1.5 flex-shrink-0 relative",
            activeFiltersCount > 0 && "border-primary text-primary"
          )}
          onClick={onToggleFilters}
        >
          <SlidersHorizontal size={13} />
          <span className="hidden sm:inline text-xs">{tx.filters}</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        {!isMobile && (
          <button
            onClick={() => toggleSidebar(false)}
            className="flex-shrink-0 p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            title="Masquer la liste"
          >
            {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Row 2: Result counter + Sort */}
      <div className="px-3 pb-2.5 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{sortedProviders.length}</span>{' '}
          {sortedProviders.length <= 1 ? tx.results : tx.results_pl}
        </span>

        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy?.(e.target.value as SortOption)}
            className="h-7 pl-2.5 pr-7 text-xs rounded-full appearance-none cursor-pointer bg-muted border-0 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    </div>
  );

  const listComponent = isLoading ? (
    <ProviderListSkeleton count={Math.floor(listHeight / 130)} />
  ) : (
    <VirtualizedProviderList
      providers={sortedProviders}
      selectedProviderId={selectedProviderId}
      hoveredProviderId={hoveredProviderId}
      onSelect={handleProviderSelect}
      onHover={handleProviderHover}
      onRouteRequest={handleRouteRequest}
      routingProviderId={routeTarget?.id ?? null}
      userLocation={userLocation}
      isLocating={isLocating}
      onRequestLocation={requestLocation}
      calculateDistance={calculateDistance}
      height={listHeight}
    />
  );

  // Mobile
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-180px)] flex flex-col">
        <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as 'list' | 'map')} className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-2 h-12 rounded-none border-b bg-background/95 backdrop-blur-sm shadow-sm">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List size={16} />{tx.list} {!isLoading && `(${sortedProviders.length})`}
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map size={16} />{tx.map}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="flex-1 m-0 data-[state=inactive]:hidden flex flex-col" asChild>
            <div className="flex flex-col h-full">
              {searchHeader}
              <div ref={listContainerRef} className="flex-1 min-h-0">{listComponent}</div>
            </div>
          </TabsContent>
          <TabsContent value="map" className="flex-1 m-0 data-[state=inactive]:hidden">
            {mapComponent}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Desktop
  return (
    <div className={cn(
      "h-[calc(100vh-64px)] flex overflow-hidden",
      isRTL ? "flex-row-reverse" : "flex-row"
    )}>
      {/* LEFT PANEL — collapsible */}
      <div
        className={cn(
          "flex-shrink-0 flex flex-col bg-background border-border overflow-hidden transition-[width] duration-300 ease-in-out",
          isRTL ? "border-l" : "border-r",
          isSidebarOpen ? "w-[340px]" : "w-0"
        )}
      >
        {searchHeader}
        <div ref={listContainerRef} className="flex-1 min-h-0">{listComponent}</div>
      </div>

      {/* MAP PANEL — takes remaining space */}
      <div className="flex-1 relative min-w-0">
        {/* Floating reopen button — only when sidebar is closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => toggleSidebar(true)}
            className={cn(
              "absolute top-4 z-[1000] flex items-center gap-1.5 bg-card border border-border shadow-md py-2 px-3 text-sm font-medium hover:bg-muted transition-colors",
              isRTL ? "right-0 rounded-l-xl" : "left-0 rounded-r-xl"
            )}
          >
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <List size={14} />
          </button>
        )}
        {mapComponent}
      </div>
    </div>
  );
};
