import { useEffect, useRef, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MapProvider, useMapContext, MapMode } from '@/contexts/MapContext';
import { MapControls } from './MapControls';
import { MapSidebar } from './MapSidebar';
import { AntigravityHeader } from '@/components/AntigravityHeader';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { createUserLocationMarker, createRouteStartMarker } from './MapMarkers';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Loader2, Navigation, X, Car, Footprints, Route, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const MapSkeleton = ({ loadingText }: { loadingText: string }) => (
  <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
    <div className="relative">
      <Skeleton className="w-full h-full absolute inset-0 rounded-xl" />
      <div className="grid grid-cols-3 gap-2 p-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="w-20 h-20 rounded-lg" />
        ))}
      </div>
    </div>
    <div className="flex items-center gap-2.5 text-muted-foreground bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-border/50">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span className="text-sm font-medium">{loadingText}</span>
    </div>
  </div>
);

const GeolocationIndicator = ({ isLocating, hasError, locatingText, errorText }: { 
  isLocating: boolean; hasError: boolean; locatingText: string; errorText: string;
}) => {
  if (!isLocating && !hasError) return null;
  
  return (
    <div className={cn(
      "absolute top-20 left-1/2 -translate-x-1/2 z-20 px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2.5 text-sm font-medium backdrop-blur-md border",
      hasError 
        ? "bg-destructive/90 text-destructive-foreground border-destructive/30" 
        : "bg-primary/90 text-primary-foreground border-primary/30"
    )}>
      {isLocating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{locatingText}</span>
        </>
      ) : hasError ? (
        <>
          <MapPin className="h-4 w-4" />
          <span>{errorText}</span>
        </>
      ) : null}
    </div>
  );
};

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const MapMotherInner = () => {
  const { 
    mapRef, mapContainerRef, center, zoom, setIsReady,
    isFullscreen, isRTL, geolocation, setUserPosition, isReady,
    routesData, selectedRouteIndex, setSelectedRouteIndex,
    clearRoute, transportMode, setTransportMode, isRouting,
    sidebarOpen, sidebarProviders, sidebarDistances, sidebarLoading, sidebarLabel,
  } = useMapContext();
  const routeLayersRef = useRef<L.Polyline[]>([]);
  const { language, t } = useLanguage();
  const location = useLocation();
  const nav = useNavigate();
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeStartMarkerRef = useRef<L.Marker | null>(null);
  const initRef = useRef(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState(false);
  
  useEffect(() => {
    if (geolocation.loading) {
      setIsLocating(true);
      setGeoError(false);
    } else {
      setIsLocating(false);
      if (geolocation.error) {
        setGeoError(true);
        const timer = setTimeout(() => setGeoError(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [geolocation.loading, geolocation.error]);
  
  const mode: MapMode = useMemo(() => {
    if (location.pathname.includes('/emergency')) return 'emergency';
    if (location.pathname.includes('/blood')) return 'blood';
    return 'providers';
  }, [location.pathname]);
  
  const titleMap: Record<MapMode, string> = {
    providers: t('map', 'providersTitle'),
    emergency: t('map', 'emergencyTitle'),
    blood: t('map', 'bloodTitle'),
  };
  
  const subtitleMap: Record<MapMode, string> = {
    providers: t('map', 'providersSubtitle'),
    emergency: t('map', 'emergencySubtitle'),
    blood: t('map', 'bloodSubtitle'),
  };
  
  useEffect(() => {
    if (initRef.current || !mapContainerRef.current || mapRef.current) return;
    initRef.current = true;
    
    const map = L.map(mapContainerRef.current, {
      center, zoom, zoomControl: false, attributionControl: true,
    });
    
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: isRTL ? 'topleft' : 'topright' }).addTo(map);
    
    mapRef.current = map;
    setIsReady(true);
    
    const handleResize = () => { map.invalidateSize(); };
    window.addEventListener('resize', handleResize);
    
    return () => { window.removeEventListener('resize', handleResize); };
  }, [center, zoom, isRTL, mapRef, mapContainerRef, setIsReady]);
  
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => { mapRef.current?.invalidateSize(); }, 100);
    }
  }, [isFullscreen, mapRef]);
  
  useEffect(() => {
    if (!mapRef.current) return;
    routeLayersRef.current.forEach(layer => {
      mapRef.current?.removeLayer(layer);
    });
    routeLayersRef.current = [];
    if (routeStartMarkerRef.current) {
      mapRef.current.removeLayer(routeStartMarkerRef.current);
      routeStartMarkerRef.current = null;
    }
    if (routesData && routesData.length > 0) {
      routesData.forEach((route, index) => {
        if (index === selectedRouteIndex) return;
        const polyline = L.polyline(route.coordinates, {
          color: '#9ca3af',
          weight: 4,
          opacity: 0.6,
          dashArray: '5, 10',
        }).addTo(mapRef.current!);
        polyline.on('click', () => setSelectedRouteIndex(index));
        routeLayersRef.current.push(polyline);
      });
      const selected = routesData[selectedRouteIndex];
      if (selected) {
        const polyline = L.polyline(selected.coordinates, {
          color: '#3b82f6',
          weight: 6,
          opacity: 0.8,
        }).addTo(mapRef.current);
        routeLayersRef.current.push(polyline);
      }
      const startCoords = routesData[selectedRouteIndex]?.coordinates[0];
      if (startCoords) {
        routeStartMarkerRef.current = L.marker(startCoords, {
          icon: createRouteStartMarker(),
          zIndexOffset: 900,
        }).addTo(mapRef.current);
        routeStartMarkerRef.current.bindPopup('Point de départ', { closeButton: false });
      }
    }
    return () => {
      routeLayersRef.current.forEach(layer => {
        mapRef.current?.removeLayer(layer);
      });
      routeLayersRef.current = [];
      if (routeStartMarkerRef.current && mapRef.current) {
        mapRef.current.removeLayer(routeStartMarkerRef.current);
        routeStartMarkerRef.current = null;
      }
    };
  }, [routesData, selectedRouteIndex, mapRef, setSelectedRouteIndex]);
  
  useEffect(() => {
    if (!mapRef.current || !geolocation.latitude || !geolocation.longitude) return;
    const userLatLng: L.LatLngExpression = [geolocation.latitude, geolocation.longitude];
    setUserPosition({ lat: geolocation.latitude, lng: geolocation.longitude });
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userLatLng);
    } else {
      userMarkerRef.current = L.marker(userLatLng, {
        icon: createUserLocationMarker(),
        zIndexOffset: 1000,
      }).addTo(mapRef.current);
      userMarkerRef.current.bindPopup(t('map', 'yourPosition'), {
        closeButton: false,
        className: 'user-location-popup'
      });
    }
    return () => {
      if (userMarkerRef.current && mapRef.current) {
        mapRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
    };
  }, [mapRef, geolocation.latitude, geolocation.longitude, setUserPosition, t]);

  const selectedRoute = routesData?.[selectedRouteIndex];
  const altRoute = routesData && routesData.length > 1
    ? routesData.find((_, i) => i !== selectedRouteIndex)
    : null;
  const altRouteIndex = routesData && altRoute ? routesData.indexOf(altRoute) : -1;
  
  return (
    <div className={cn("min-h-screen bg-background flex flex-col", isRTL && "rtl")}>
      <AntigravityHeader />
      
      <main id="main-content" className={cn(
        "flex-1 flex flex-col",
        isFullscreen ? "fixed inset-0 z-50 pt-0" : "container mx-auto px-4 pt-20 pb-4 md:pt-24 md:pb-6"
      )}>
        {!isFullscreen && (
          <div className="mb-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => nav(-1)}
              className="shrink-0 h-9 w-9 rounded-lg hover:bg-muted"
              aria-label={language === 'ar' ? 'العودة' : language === 'en' ? 'Back' : 'Retour'}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{titleMap[mode]}</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{subtitleMap[mode]}</p>
            </div>
          </div>
        )}
        
        {/* ── Flex wrapper: sidebar + map ── */}
        <div className={cn(
          "flex-1 flex overflow-hidden",
          !isFullscreen && "rounded-2xl border border-border/60 shadow-xl ring-1 ring-black/[0.03] dark:ring-white/[0.03]",
          isFullscreen && "rounded-none border-0",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}>
          {/* Map area (relative for absolute overlays) */}
          <div className="flex-1 relative overflow-hidden">

            {!isReady && <MapSkeleton loadingText={t('map', 'loadingMap')} />}
            
            <GeolocationIndicator 
              isLocating={isLocating} 
              hasError={geoError}
              locatingText={t('map', 'locating')}
              errorText={t('map', 'locationError')}
            />
            
            <div 
              ref={mapContainerRef} 
              className="absolute inset-0 z-0"
              style={{ minHeight: isFullscreen ? '100vh' : 'calc(100vh - 200px)' }}
            />
            
            {/* Multi-route info banner */}
            {selectedRoute && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl px-5 py-3.5 flex flex-col gap-2.5 text-sm max-w-md w-[92%] sm:w-auto animate-fade-in ring-1 ring-black/[0.04] dark:ring-white/[0.04]">
                {/* Transport mode toggle + close */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center bg-muted/60 rounded-xl p-1 gap-0.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setTransportMode('driving')}
                          disabled={isRouting}
                          className={cn(
                            "p-2 rounded-lg transition-all duration-200",
                            transportMode === 'driving'
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                          aria-label="Voiture"
                        >
                          <Car className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">Voiture</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setTransportMode('foot')}
                          disabled={isRouting}
                          className={cn(
                            "p-2 rounded-lg transition-all duration-200",
                            transportMode === 'foot'
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                          aria-label="À pied"
                        >
                          <Footprints className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">À pied</TooltipContent>
                    </Tooltip>
                  </div>
                  <button
                    onClick={clearRoute}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label="Fermer l'itinéraire"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Route rows */}
                <div className="space-y-1.5">
                  {/* Selected / Main route */}
                    <button
                        onClick={() => setSelectedRouteIndex(0)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 text-left",
                          selectedRouteIndex === 0 
                            ? "bg-primary/10 ring-1 ring-primary/30 shadow-sm" 
                            : "hover:bg-muted/60"
                        )}
                      >
                        <div className="w-3 h-1 rounded-full bg-primary shrink-0" />
                        {isRouting ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Route className="h-4 w-4 text-primary shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-primary hidden sm:inline">Principal</span>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                          <span className="font-semibold">{routesData![0].distance} km</span>
                          <span className="text-muted-foreground">≈ {routesData![0].duration} min</span>
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            ETA {new Date(Date.now() + routesData![0].duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                    {routesData!.length === 1 && (
                      <span className="text-xs text-muted-foreground ml-auto">Itinéraire unique</span>
                    )}
                  </button>

                  {/* Alternative route(s) */}
                  {routesData!.slice(1).map((route, i) => {
                    const idx = i + 1;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedRouteIndex(idx)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 text-left",
                          selectedRouteIndex === idx 
                            ? "bg-primary/10 ring-1 ring-primary/30 shadow-sm" 
                            : "hover:bg-muted/60"
                        )}
                      >
                        <div className="w-3 h-1 rounded-full bg-muted-foreground shrink-0" style={{ borderTop: '1px dashed' }} />
                        <Route className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">Alternatif</span>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                          <span className="font-semibold">{route.distance} km</span>
                          <span className="text-muted-foreground">≈ {route.duration} min</span>
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            ETA {new Date(Date.now() + route.duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            <MapControls mode={mode} />
            <Outlet />
          </div>

          {/* Sidebar on the right */}
          <MapSidebar
            providers={sidebarProviders}
            distances={sidebarDistances}
            loading={sidebarLoading}
            label={sidebarLabel}
            mode={mode}
          />
        </div>
      </main>
    </div>
  );
};

const MapMother = () => {
  return (
    <MapProvider>
      <MapMotherInner />
    </MapProvider>
  );
};

export default MapMother;
