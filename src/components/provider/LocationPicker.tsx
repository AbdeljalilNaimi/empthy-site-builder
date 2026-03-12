import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

interface LocationPickerProps {
  lat: number;
  lng: number;
  onLocationChange?: (lat: number, lng: number) => void;
  readonly?: boolean;
}

export const LocationPicker = ({ lat, lng, onLocationChange, readonly = false }: LocationPickerProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat || 35.1833, lng || -0.6333],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer(TILE_URL, {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Add marker
    const marker = L.marker([lat || 35.1833, lng || -0.6333], {
      draggable: !readonly,
    }).addTo(map);

    if (!readonly && onLocationChange) {
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onLocationChange(pos.lat, pos.lng);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onLocationChange(e.latlng.lat, e.latlng.lng);
      });
    }

    mapRef.current = map;
    markerRef.current = marker;
    setIsInitialized(true);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker position when props change
  useEffect(() => {
    if (!isInitialized || !markerRef.current || !mapRef.current) return;
    
    const newLatLng = L.latLng(lat || 35.1833, lng || -0.6333);
    markerRef.current.setLatLng(newLatLng);
    mapRef.current.setView(newLatLng);
  }, [lat, lng, isInitialized]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[300px]" 
    />
  );
};

export default LocationPicker;