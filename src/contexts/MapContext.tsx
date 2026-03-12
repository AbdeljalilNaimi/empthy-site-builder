import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import L from 'leaflet';
import { CityHealthProvider } from '@/data/providers';
import { useGeolocation, SIDI_BEL_ABBES_CENTER } from '@/hooks/useGeolocation';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import type { RouteData } from '@/types/routing';

export type MapMode = 'providers' | 'emergency' | 'blood';
export type TransportMode = 'driving' | 'foot';

// Sidebar state shared across map children
export interface SidebarState {
  open: boolean;
  providers: CityHealthProvider[];
  distances: Map<string, number>;
  loading: boolean;
  label: string; // e.g. "Urgences" for header
}

interface MapContextType {
  mapRef: React.MutableRefObject<L.Map | null>;
  mapContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
  center: [number, number];
  zoom: number;
  theme: 'light' | 'dark';
  isRTL: boolean;
  selectedProvider: CityHealthProvider | null;
  setSelectedProvider: (provider: CityHealthProvider | null) => void;
  userPosition: { lat: number; lng: number } | null;
  setUserPosition: (pos: { lat: number; lng: number } | null) => void;
  markerLayers: Map<string, L.MarkerClusterGroup>;
  registerMarkerLayer: (layerId: string, layer: L.MarkerClusterGroup) => void;
  removeMarkerLayer: (layerId: string) => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  fitBounds: (bounds: L.LatLngBounds, options?: L.FitBoundsOptions) => void;
  getDirections: (provider: CityHealthProvider) => void;
  locateUser: () => void;
  // Routing - multi-route
  routesData: RouteData[] | null;
  selectedRouteIndex: number;
  setSelectedRouteIndex: (index: number) => void;
  isRouting: boolean;
  transportMode: TransportMode;
  setTransportMode: (mode: TransportMode) => void;
  calculateRoute: (provider: CityHealthProvider) => void;
  clearRoute: () => void;
  geolocation: ReturnType<typeof useGeolocation>;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  // Sidebar state (shared across map child routes)
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarProviders: CityHealthProvider[];
  setSidebarProviders: (providers: CityHealthProvider[]) => void;
  sidebarDistances: Map<string, number>;
  setSidebarDistances: (distances: Map<string, number>) => void;
  sidebarLoading: boolean;
  setSidebarLoading: (loading: boolean) => void;
  sidebarLabel: string;
  setSidebarLabel: (label: string) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CityHealthProvider | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [markerLayers] = useState(() => new Map<string, L.MarkerClusterGroup>());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Routing state - multi-route
  const [routesData, setRoutesData] = useState<RouteData[] | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [isRouting, setIsRouting] = useState(false);
  const [transportMode, setTransportMode] = useState<TransportMode>('driving');
  const lastRoutedProviderRef = useRef<CityHealthProvider | null>(null);

  // Sidebar state
  const [sidebarOpen, setSidebarOpenState] = useState(true);
  const [sidebarProviders, setSidebarProviders] = useState<CityHealthProvider[]>([]);
  const [sidebarDistances, setSidebarDistances] = useState<Map<string, number>>(new Map());
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [sidebarLabel, setSidebarLabel] = useState('');

  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpenState(open);
    setTimeout(() => { mapRef.current?.invalidateSize(); }, 150);
  }, []);
  
  const { theme } = useTheme();
  const { isRTL } = useLanguage();
  const geolocation = useGeolocation({ enableHighAccuracy: true });
  
  const center: [number, number] = [SIDI_BEL_ABBES_CENTER.lat, SIDI_BEL_ABBES_CENTER.lng];
  const zoom = 13;
  
  const registerMarkerLayer = useCallback((layerId: string, layer: L.MarkerClusterGroup) => {
    if (markerLayers.has(layerId) && mapRef.current) {
      const existingLayer = markerLayers.get(layerId)!;
      mapRef.current.removeLayer(existingLayer);
    }
    markerLayers.set(layerId, layer);
    if (mapRef.current) {
      mapRef.current.addLayer(layer);
    }
  }, [markerLayers]);
  
  const removeMarkerLayer = useCallback((layerId: string) => {
    if (markerLayers.has(layerId) && mapRef.current) {
      const layer = markerLayers.get(layerId)!;
      mapRef.current.removeLayer(layer);
      markerLayers.delete(layerId);
    }
  }, [markerLayers]);
  
  const flyTo = useCallback((lat: number, lng: number, zoomLevel: number = 16) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], zoomLevel, { duration: 0.5 });
    }
  }, []);
  
  const fitBounds = useCallback((bounds: L.LatLngBounds, options?: L.FitBoundsOptions) => {
    if (mapRef.current) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, ...options });
    }
  }, []);
  
  const getDirections = useCallback((provider: CityHealthProvider) => {
    if (provider.lat && provider.lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`;
      window.open(url, '_blank');
    }
  }, []);
  
  const clearRoute = useCallback(() => {
    setRoutesData(null);
    setSelectedRouteIndex(0);
  }, []);
  
  const calculateRouteWithMode = useCallback((provider: CityHealthProvider, mode: TransportMode) => {
    if (!provider.lat || !provider.lng) return;
    
    lastRoutedProviderRef.current = provider;
    setIsRouting(true);
    setRoutesData(null);
    setSelectedRouteIndex(0);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        try {
          const profile = mode === 'foot' ? 'foot' : 'driving';
          const url = `https://router.project-osrm.org/route/v1/${profile}/${userLng},${userLat};${provider.lng},${provider.lat}?overview=full&geometries=geojson&alternatives=true`;
          const res = await fetch(url);
          const data = await res.json();
          
          if (data.code !== 'Ok' || !data.routes?.length) {
            toast({ title: "Erreur", description: "Impossible de calculer l'itinéraire.", variant: "destructive" });
            setIsRouting(false);
            return;
          }
          
          const routes: RouteData[] = data.routes.map((route: any) => ({
            coordinates: route.geometry.coordinates.map(
              (c: [number, number]) => [c[1], c[0]] as [number, number]
            ),
            distance: Math.round((route.distance / 1000) * 10) / 10,
            duration: Math.round(route.duration / 60),
          }));
          
          setRoutesData(routes);
          
          // Fit bounds to all routes combined
          if (mapRef.current && routes.length > 0) {
            const allCoords = routes.flatMap(r => r.coordinates);
            const bounds = L.latLngBounds(allCoords);
            mapRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 16 });
          }
        } catch {
          toast({ title: "Erreur", description: "Erreur de connexion au service de routage.", variant: "destructive" });
        } finally {
          setIsRouting(false);
        }
      },
      () => {
        toast({ title: "Géolocalisation requise", description: "Veuillez autoriser la géolocalisation pour calculer l'itinéraire.", variant: "destructive" });
        setIsRouting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);
  
  const calculateRoute = useCallback((provider: CityHealthProvider) => {
    calculateRouteWithMode(provider, transportMode);
  }, [calculateRouteWithMode, transportMode]);
  
  const handleSetTransportMode = useCallback((mode: TransportMode) => {
    setTransportMode(mode);
    if (lastRoutedProviderRef.current) {
      calculateRouteWithMode(lastRoutedProviderRef.current, mode);
    }
  }, [calculateRouteWithMode]);
  
  const locateUser = useCallback(() => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    geolocation.getCurrentPosition();
    locationIntervalRef.current = setInterval(() => {
      if (geolocation.latitude && geolocation.longitude && mapRef.current) {
        mapRef.current.flyTo([geolocation.latitude, geolocation.longitude], 15, { duration: 0.5 });
        clearInterval(locationIntervalRef.current!);
        locationIntervalRef.current = null;
      }
    }, 100);
    setTimeout(() => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    }, 5000);
  }, [geolocation]);

  useEffect(() => {
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, []);
  
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);
  }, []);
  
  return (
    <MapContext.Provider value={{
      mapRef, mapContainerRef, isReady, setIsReady,
      center, zoom, theme, isRTL,
      selectedProvider, setSelectedProvider,
      userPosition, setUserPosition,
      markerLayers, registerMarkerLayer, removeMarkerLayer,
      flyTo, fitBounds, getDirections, locateUser,
      routesData, selectedRouteIndex, setSelectedRouteIndex,
      isRouting, transportMode,
      setTransportMode: handleSetTransportMode, calculateRoute, clearRoute,
      geolocation, isFullscreen, toggleFullscreen,
      sidebarOpen, setSidebarOpen,
      sidebarProviders, setSidebarProviders,
      sidebarDistances, setSidebarDistances,
      sidebarLoading, setSidebarLoading,
      sidebarLabel, setSidebarLabel,
    }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};

/** Safe version — returns null when outside MapProvider */
export const useMapContextSafe = () => {
  return useContext(MapContext) ?? null;
};
