import { useEffect, useRef, memo } from 'react';
import { MapPin, Maximize2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CityHealthProvider } from '@/data/providers';

interface MiniMapPreviewProps {
  providers: CityHealthProvider[];
  onOpenFullMap: () => void;
  className?: string;
}

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

export const MiniMapPreview = memo(({ providers, onOpenFullMap, className }: MiniMapPreviewProps) => {
  const { language } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const tx = {
    fr: { viewFullMap: 'Explorer la carte', providers: 'prestataires', explore: 'Carte interactive' },
    ar: { viewFullMap: 'استكشاف الخريطة', providers: 'مقدمي الخدمات', explore: 'خريطة تفاعلية' },
    en: { viewFullMap: 'Explore map', providers: 'providers', explore: 'Interactive map' }
  }[language as 'fr' | 'ar' | 'en'] || { viewFullMap: 'Explore map', providers: 'providers', explore: 'Interactive map' };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.off();
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [35.1975, -0.6300],
      zoom: 11,
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false,
    });

    L.tileLayer(TILE_URL, { maxZoom: 19 }).addTo(map);
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) map.removeLayer(layer);
    });

    providers.forEach((provider) => {
      L.circleMarker([provider.lat, provider.lng], {
        radius: 5,
        fillColor: 'hsl(var(--primary))',
        color: 'hsl(var(--background))',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);
    });

    if (providers.length > 0) {
      const bounds = L.latLngBounds(providers.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [25, 25], maxZoom: 13 });
    }
  }, [providers]);

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden border border-border/50 bg-card cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300",
        className
      )}
      onClick={onOpenFullMap}
    >
      {/* Map */}
      <div ref={mapContainerRef} className="w-full h-[200px]" />

      {/* Gradient overlay — always visible, stronger on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

      {/* Bottom bar */}
      <div className="absolute bottom-0 inset-x-0 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Navigation className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-xs font-semibold text-foreground">{tx.explore}</span>
        </div>
        <Button
          size="sm"
          className="h-7 rounded-lg text-[11px] gap-1.5 px-3 shadow-md"
        >
          <Maximize2 className="h-3 w-3" />
          {tx.viewFullMap}
        </Button>
      </div>

      {/* Provider count badge */}
      <div className="absolute top-2.5 right-2.5 bg-card/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shadow-md border border-border/30">
        <MapPin size={12} className="text-primary" />
        <span className="text-foreground">{providers.length}</span>
        <span className="text-muted-foreground">{tx.providers}</span>
      </div>
    </div>
  );
});

MiniMapPreview.displayName = 'MiniMapPreview';
