import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Loader2, LocateFixed, RefreshCw, MessageCircle, Car, Footprints, X, Clock, Route } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { isProviderVerified } from '@/utils/verificationUtils';
import { createMarkerIcon, createUserLocationMarker } from '@/components/map/MapMarkers';
import { ProviderInfoCard } from './ProviderInfoCard';
import { MapChatWidget } from '@/components/map/MapChatWidget';
import type { CityHealthProvider } from '@/data/providers';
import type { RouteData } from '@/types/routing';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Tile URL - Light theme only
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export interface SearchMapRef {
  flyToProvider: (providerId: string) => void;
  fitAllProviders: () => void;
  clearRoute: () => void;
  invalidateSize: () => void;
}

interface SearchMapProps {
  providers: CityHealthProvider[];
  selectedProviderId?: string | null;
  hoveredProviderId?: string | null;
  onProviderSelect?: (id: string) => void;
  onProviderHover?: (id: string | null) => void;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
  showSearchInArea?: boolean;
  onSearchInArea?: () => void;
  compact?: boolean;
  routeTarget?: CityHealthProvider | null;
  onRouteClear?: () => void;
  onRouteRequest?: (provider: CityHealthProvider) => void;
}

export const SearchMap = forwardRef<SearchMapRef, SearchMapProps>(({ 
  providers,
  selectedProviderId,
  hoveredProviderId,
  onProviderSelect,
  onProviderHover,
  onBoundsChange,
  showSearchInArea = false,
  onSearchInArea,
  compact = false,
  routeTarget,
  onRouteClear,
  onRouteRequest,
}, ref) => {
  const { toast } = useToast();
  const { isRTL, language } = useLanguage();
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const moveEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);
  const initialFitDoneRef = useRef(false);
  const providersLengthRef = useRef(0);
  const routeLayersRef = useRef<L.Polyline[]>([]);
  
  const [internalSelectedProvider, setInternalSelectedProvider] = useState<CityHealthProvider | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapMoved, setMapMoved] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBotOpen, setIsBotOpen] = useState(false);
  
  // OSRM routing state
  const [routesData, setRoutesData] = useState<RouteData[] | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [transportMode, setTransportMode] = useState<'driving' | 'foot'>('driving');

  // Use external or internal selection
  const selectedProvider = selectedProviderId 
    ? providers.find(p => p.id === selectedProviderId) || null 
    : internalSelectedProvider;

  // Handler for setting selected provider
  const setSelectedProvider = useCallback((provider: CityHealthProvider | null) => {
    if (onProviderSelect && provider) {
      onProviderSelect(provider.id);
    } else {
      setInternalSelectedProvider(provider);
    }
  }, [onProviderSelect]);

  // Translations
  const t = {
    fr: {
      loading: 'Chargement de la carte...',
      verified: 'Vérifié',
      call: 'Appeler',
      directions: 'Itinéraire',
      profile: 'Profil',
      distance: 'Distance',
      locateMe: 'Ma position',
      locationError: 'Impossible d\'obtenir votre position',
      searchInArea: 'Rechercher dans cette zone',
      fullscreen: 'Plein écran',
      exitFullscreen: 'Quitter plein écran',
      assistant: 'MapBot IA',
      routing: 'Calcul de l\'itinéraire...',
      geoRequired: 'Position requise pour l\'itinéraire',
      km: 'km',
      min: 'min',
      arrival: 'Arrivée',
      driving: 'Voiture',
      foot: 'Pied',
      clearRoute: 'Effacer',
    },
    ar: {
      loading: 'جارٍ تحميل الخريطة...',
      verified: 'موثق',
      call: 'اتصل',
      directions: 'الاتجاهات',
      profile: 'الملف',
      distance: 'المسافة',
      locateMe: 'موقعي',
      locationError: 'تعذر الحصول على موقعك',
      searchInArea: 'البحث في هذه المنطقة',
      fullscreen: 'ملء الشاشة',
      exitFullscreen: 'الخروج من ملء الشاشة',
      assistant: 'MapBot الذكي',
      routing: 'حساب المسار...',
      geoRequired: 'الموقع مطلوب للمسار',
      km: 'كم',
      min: 'دقيقة',
      arrival: 'الوصول',
      driving: 'سيارة',
      foot: 'مشياً',
      clearRoute: 'مسح',
    },
    en: {
      loading: 'Loading map...',
      verified: 'Verified',
      call: 'Call',
      directions: 'Directions',
      profile: 'Profile',
      distance: 'Distance',
      locateMe: 'My location',
      locationError: 'Unable to get your location',
      searchInArea: 'Search in this area',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      assistant: 'MapBot AI',
      routing: 'Calculating route...',
      geoRequired: 'Location required for route',
      km: 'km',
      min: 'min',
      arrival: 'Arrival',
      driving: 'Driving',
      foot: 'Walking',
      clearRoute: 'Clear',
    }
  };
  
  const tx = t[language as keyof typeof t] || t.fr;

  const createIcon = useCallback((provider: CityHealthProvider, isSelected: boolean = false) => {
    return createMarkerIcon(provider.type, isSelected, provider.emergency);
  }, []);

  // Clear route layers from map
  const clearRouteLayers = useCallback(() => {
    routeLayersRef.current.forEach(layer => {
      if (mapRef.current) mapRef.current.removeLayer(layer);
    });
    routeLayersRef.current = [];
    if (startMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }
    setRoutesData(null);
  }, []);

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    flyToProvider: (providerId: string) => {
      const provider = providers.find(p => p.id === providerId);
      if (provider && mapRef.current) {
        isAnimatingRef.current = true;
        mapRef.current.flyTo([provider.lat, provider.lng], 16, { duration: 0.5 });
        setTimeout(() => { isAnimatingRef.current = false; }, 600);
      }
    },
    fitAllProviders: () => {
      if (mapRef.current && providers.length > 0) {
        const bounds = L.latLngBounds(providers.map(p => [p.lat, p.lng]));
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    },
    clearRoute: clearRouteLayers,
    invalidateSize: () => { mapRef.current?.invalidateSize(); },
  }), [providers, clearRouteLayers]);

  // OSRM routing effect
  useEffect(() => {
    if (!routeTarget || !mapRef.current || !isMapLoaded) return;

    setIsRouting(true);
    clearRouteLayers();

    const fetchRoute = async (uLat: number, uLng: number) => {
      const profile = transportMode === 'foot' ? 'foot' : 'driving';
      const url = `https://router.project-osrm.org/route/v1/${profile}/${uLng},${uLat};${routeTarget.lng},${routeTarget.lat}?overview=full&geometries=geojson&alternatives=true`;

      try {
        const data = await fetch(url).then(r => r.json());
        if (!data.routes?.length) throw new Error('No routes found');

        const routes: RouteData[] = data.routes.map((r: { geometry: { coordinates: [number, number][] }; distance: number; duration: number }) => ({
          coordinates: r.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]),
          distance: Math.round(r.distance / 100) / 10,
          duration: Math.round(r.duration / 60),
        }));

        setRoutesData(routes);

        if (!mapRef.current) return;

        // Draw alternatives first (behind main)
        routes.slice(1).forEach(route => {
          const pl = L.polyline(route.coordinates, {
            color: '#9ca3af',
            weight: 4,
            dashArray: '8,12',
            opacity: 0.65,
          });
          pl.addTo(mapRef.current!);
          routeLayersRef.current.push(pl);
        });

        // Draw main route
        const mainPl = L.polyline(routes[0].coordinates, {
          color: '#3b82f6',
          weight: 6,
          opacity: 0.88,
          lineCap: 'round',
          lineJoin: 'round',
        });
        mainPl.addTo(mapRef.current!);
        routeLayersRef.current.push(mainPl);

        // Pulsing start marker (user position)
        const startIcon = L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 0 0 3px rgba(34,197,94,0.3);animation:pulse 1.5s ease-in-out infinite;"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        startMarkerRef.current = L.marker([uLat, uLng], { icon: startIcon }).addTo(mapRef.current!);

        // Fit bounds
        const allCoords = routes.flatMap(r => r.coordinates);
        mapRef.current.fitBounds(L.latLngBounds(allCoords), { padding: [80, 80] });
      } catch {
        sonnerToast.error(tx.routing);
      } finally {
        setIsRouting(false);
      }
    };

    // Try geolocation first; fall back to current map center if denied/unavailable
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchRoute(pos.coords.latitude, pos.coords.longitude),
        () => {
          // Geolocation denied — use current map center as start point
          const center = mapRef.current?.getCenter();
          if (center) {
            fetchRoute(center.lat, center.lng);
          } else {
            setIsRouting(false);
            toast({ title: tx.geoRequired, variant: 'destructive' });
          }
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    } else {
      // No geolocation API — fall back to map center
      const center = mapRef.current?.getCenter();
      if (center) {
        fetchRoute(center.lat, center.lng);
      } else {
        setIsRouting(false);
      }
    }
  }, [routeTarget, transportMode, isMapLoaded]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [35.1975, -0.6300],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({
      position: isRTL ? 'topleft' : 'topright'
    }).addTo(map);

    tileLayerRef.current = L.tileLayer(TILE_URL, {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    markerGroupRef.current = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      showCoverageOnHover: false,
    });
    map.addLayer(markerGroupRef.current);

    map.on('moveend', () => {
      if (moveEndTimeoutRef.current) clearTimeout(moveEndTimeoutRef.current);
      moveEndTimeoutRef.current = setTimeout(() => {
        if (isAnimatingRef.current) return;
        setMapMoved(true);
        if (onBoundsChange) onBoundsChange(map.getBounds());
      }, 150);
    });

    mapRef.current = map;
    setIsMapLoaded(true);

    return () => {
      if (moveEndTimeoutRef.current) clearTimeout(moveEndTimeoutRef.current);
      map.off();
      map.remove();
      mapRef.current = null;
      markerGroupRef.current = null;
      tileLayerRef.current = null;
      markersRef.current.clear();
    };
  }, [isRTL, onBoundsChange]);

  // Update markers when providers change
  useEffect(() => {
    if (!mapRef.current || !markerGroupRef.current || !isMapLoaded) return;

    const markerGroup = markerGroupRef.current;
    markerGroup.clearLayers();
    markersRef.current.clear();

    providers.forEach((provider) => {
      const marker = L.marker([provider.lat, provider.lng], {
        icon: createIcon(provider, false)
      });

      marker.on('click', () => {
        setSelectedProvider(provider);
        if (onProviderSelect) onProviderSelect(provider.id);
        isAnimatingRef.current = true;
        mapRef.current?.flyTo([provider.lat, provider.lng], 15, { duration: 0.5 });
        setTimeout(() => { isAnimatingRef.current = false; }, 600);
      });

      marker.on('mouseover', () => { if (onProviderHover) onProviderHover(provider.id); });
      marker.on('mouseout', () => { if (onProviderHover) onProviderHover(null); });

      markersRef.current.set(provider.id, marker);
      markerGroup.addLayer(marker);
    });
    
    setMapMoved(false);
  }, [providers, isMapLoaded, createIcon, onProviderSelect, onProviderHover, setSelectedProvider]);

  // Fit bounds on initial load / significant change
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || providers.length === 0) return;
    const providersChanged = providersLengthRef.current !== providers.length;
    const shouldFit = !initialFitDoneRef.current || providersChanged;
    if (shouldFit) {
      const bounds = L.latLngBounds(providers.map(p => [p.lat, p.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: false });
      initialFitDoneRef.current = true;
      providersLengthRef.current = providers.length;
    }
  }, [providers.length, isMapLoaded]);

  // Update marker styles on hover/selection change
  useEffect(() => {
    if (!isMapLoaded) return;
    markersRef.current.forEach((marker, providerId) => {
      const provider = providers.find(p => p.id === providerId);
      if (provider) {
        const isSelected = selectedProviderId === providerId;
        marker.setIcon(createIcon(provider, isSelected));
      }
    });
  }, [selectedProviderId, hoveredProviderId, providers, isMapLoaded, createIcon]);

  // Fly to selected provider when changed externally
  useEffect(() => {
    if (selectedProviderId && mapRef.current && isMapLoaded) {
      const provider = providers.find(p => p.id === selectedProviderId);
      if (provider) {
        isAnimatingRef.current = true;
        mapRef.current.flyTo([provider.lat, provider.lng], 15, { duration: 0.5 });
        setTimeout(() => { isAnimatingRef.current = false; }, 600);
      }
    }
  }, [selectedProviderId, providers, isMapLoaded]);

  // Locate user
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: tx.locationError, variant: 'destructive' });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setIsLocating(false);
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 14);
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            userMarkerRef.current = L.marker([latitude, longitude], {
              icon: createUserLocationMarker()
            }).addTo(mapRef.current);
          }
        }
      },
      () => {
        setIsLocating(false);
        toast({ title: tx.locationError, variant: 'destructive' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [toast, tx.locationError]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!mapContainerRef.current?.parentElement) return;
    const container = mapContainerRef.current.parentElement;
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const calculateDistance = useCallback((provider: CityHealthProvider): number | null => {
    if (!userLocation) return null;
    const R = 6371;
    const dLat = (provider.lat - userLocation[0]) * Math.PI / 180;
    const dLon = (provider.lng - userLocation[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation[0] * Math.PI / 180) * Math.cos(provider.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10;
  }, [userLocation]);

  const handleSearchInArea = useCallback(() => {
    setMapMoved(false);
    if (onSearchInArea) onSearchInArea();
  }, [onSearchInArea]);

  const handleClearRoute = useCallback(() => {
    clearRouteLayers();
    if (onRouteClear) onRouteClear();
  }, [clearRouteLayers, onRouteClear]);

  // Compute ETA for main route
  const mainRoute = routesData?.[0];
  const etaTime = mainRoute ? (() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + mainRoute.duration);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  })() : null;

  return (
    <div className={cn("flex-1 relative", compact ? "h-full" : "h-screen")}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0" />
      
      {/* Loading overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{tx.loading}</p>
          </div>
        </div>
      )}

      {/* OSRM Routing indicator */}
      {isRouting && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[30] flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm bg-card/90 border border-border/50">
          <Loader2 size={14} className="animate-spin text-primary" />
          <span className="text-xs font-medium">{tx.routing}</span>
        </div>
      )}

      {/* Search in this area button */}
      {isMapLoaded && showSearchInArea && mapMoved && !isRouting && (
        <Button
          size="sm"
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[20] shadow-lg backdrop-blur-sm bg-card/90 text-foreground border border-border/50 hover:bg-card rounded-full px-4"
          onClick={handleSearchInArea}
        >
          <RefreshCw size={14} className="mr-2" />
          {tx.searchInArea}
        </Button>
      )}

      {/* Route Info Panel */}
      {mainRoute && !isRouting && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[25] min-w-[280px]">
          <div className="rounded-2xl shadow-xl border border-border/50 backdrop-blur-sm bg-card/95 p-4">
            {/* Route metrics */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{mainRoute.distance} <span className="text-sm font-normal text-muted-foreground">{tx.km}</span></p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{mainRoute.duration} <span className="text-sm font-normal text-muted-foreground">{tx.min}</span></p>
                </div>
                {etaTime && (
                  <>
                    <div className="w-px h-8 bg-border" />
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={13} />
                      <span className="text-sm font-medium text-foreground">{etaTime}</span>
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                onClick={handleClearRoute}
              >
                <X size={14} />
              </Button>
            </div>
            {/* Transport mode toggle */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={transportMode === 'driving' ? 'default' : 'outline'}
                className="flex-1 h-8 text-xs gap-1.5 rounded-full"
                onClick={() => setTransportMode('driving')}
              >
                <Car size={13} />
                {tx.driving}
              </Button>
              <Button
                size="sm"
                variant={transportMode === 'foot' ? 'default' : 'outline'}
                className="flex-1 h-8 text-xs gap-1.5 rounded-full"
                onClick={() => setTransportMode('foot')}
              >
                <Footprints size={13} />
                {tx.foot}
              </Button>
            </div>
            {/* Alternative routes indicator */}
            {routesData && routesData.length > 1 && (
              <p className="text-center text-[10px] text-muted-foreground mt-2">
                {routesData.length - 1} itinéraire{routesData.length > 2 ? 's' : ''} alternatif{routesData.length > 2 ? 's' : ''} affiché{routesData.length > 2 ? 's' : ''} en gris
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating action buttons — Ma Position + MapBot IA */}
      {isMapLoaded && (
        <div className={cn(
          "absolute z-[20] flex flex-col gap-3",
          mainRoute ? "bottom-[140px]" : "bottom-6",
          isRTL ? "left-6" : "right-6"
        )}>
          {/* Geolocation button */}
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 rounded-full shadow-lg bg-card border border-border hover:scale-105 transition-transform"
            onClick={locateUser}
            disabled={isLocating}
            title={tx.locateMe}
          >
            <LocateFixed className={cn("h-5 w-5 text-primary", isLocating && "animate-pulse")} />
          </Button>

          {/* MapBot AI button */}
          <Button
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg hover:scale-105 transition-transform",
              isBotOpen ? "bg-primary/80 hover:bg-primary/70" : "bg-primary hover:bg-primary/90"
            )}
            onClick={() => setIsBotOpen(prev => !prev)}
            title={tx.assistant}
          >
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </Button>
        </div>
      )}

      {/* MapChatWidget overlay */}
      {isMapLoaded && (
        <MapChatWidget
          isOpen={isBotOpen}
          onClose={() => setIsBotOpen(false)}
          providers={providers}
          onFlyToProvider={(id) => {
            const provider = providers.find(p => p.id === id);
            if (provider && mapRef.current) {
              isAnimatingRef.current = true;
              mapRef.current.flyTo([provider.lat, provider.lng], 16, { duration: 0.8 });
              setTimeout(() => { isAnimatingRef.current = false; }, 900);
              setSelectedProvider(provider);
            }
          }}
          language={language}
        />
      )}

      {/* Provider Info Card */}
      {selectedProvider && isMapLoaded && (
        <ProviderInfoCard
          provider={selectedProvider}
          onClose={() => {
            setInternalSelectedProvider(null);
            if (onProviderSelect) onProviderSelect('');
          }}
          userLocation={userLocation}
          onRouteRequest={onRouteRequest}
          isRouting={isRouting}
        />
      )}
    </div>
  );
});

SearchMap.displayName = 'SearchMap';
