import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { createMarkerIcon, createRouteStartMarker } from '@/components/map/MapMarkers';
import type { ProviderType } from '@/types/provider';
import type { RouteData } from '@/types/routing';

interface ProviderMapProps {
  lat: number;
  lng: number;
  name: string;
  address: string;
  height?: string;
  type?: ProviderType;
  routesData?: RouteData[];
  selectedRouteIndex?: number;
}

const ProviderMap = ({ lat, lng, name, address, height = "h-56", type = 'doctor', routesData, selectedRouteIndex = 0 }: ProviderMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayersRef = useRef<L.Polyline[]>([]);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const icon = createMarkerIcon(type as any, false, false);
    const marker = L.marker([lat, lng], { icon }).addTo(map);
    marker.bindPopup(`<strong>${name}</strong><br/>${address}`);

    mapInstanceRef.current = map;
    setIsLoading(false);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, name, address, type]);

  // Update map view when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && !routesData) {
      mapInstanceRef.current.setView([lat, lng], 15);
    }
  }, [lat, lng, routesData]);

  // Draw/clear multi-route polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous
    routeLayersRef.current.forEach(layer => map.removeLayer(layer));
    routeLayersRef.current = [];
    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }

    if (routesData && routesData.length > 0) {
      // Alternatives first (background)
      routesData.forEach((route, index) => {
        if (index === selectedRouteIndex) return;
        const polyline = L.polyline(route.coordinates, {
          color: '#9ca3af',
          weight: 4,
          opacity: 0.6,
          dashArray: '5, 10',
        }).addTo(map);
        routeLayersRef.current.push(polyline);
      });

      // Selected route (foreground)
      const selected = routesData[selectedRouteIndex];
      if (selected) {
        const polyline = L.polyline(selected.coordinates, {
          color: '#3b82f6',
          weight: 6,
          opacity: 0.8,
        }).addTo(map);
        routeLayersRef.current.push(polyline);
      }

      // Start marker
      const startCoord = routesData[selectedRouteIndex]?.coordinates[0];
      if (startCoord) {
        const startIcon = createRouteStartMarker();
        startMarkerRef.current = L.marker(startCoord, { icon: startIcon }).addTo(map);
      }

      // Fit bounds to all routes
      const allCoords = routesData.flatMap(r => r.coordinates);
      if (allCoords.length > 0) {
        map.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40], maxZoom: 16 });
      }
    }
  }, [routesData, selectedRouteIndex]);

  return (
    <div className={`${height} rounded-lg overflow-hidden relative`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <MapPin className="h-8 w-8 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Chargement...</span>
          </div>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
};

export default ProviderMap;
