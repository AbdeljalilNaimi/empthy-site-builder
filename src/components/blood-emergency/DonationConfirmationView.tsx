import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplet, MapPin, Clock, Navigation, Loader2, X, CheckCircle2 } from 'lucide-react';
import { BloodEmergency, respondToEmergency, cancelResponse } from '@/services/bloodEmergencyService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DonationConfirmationViewProps {
  emergency: BloodEmergency;
  onClose: () => void;
}

export function DonationConfirmationView({ emergency, onClose }: DonationConfirmationViewProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<'confirm' | 'routing'>('confirm');
  const [isConfirming, setIsConfirming] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const handleConfirm = async () => {
    if (!user) return;
    setIsConfirming(true);
    try {
      const resp = await respondToEmergency(emergency.id, {
        citizen_id: user.uid,
        citizen_name: profile?.full_name || undefined,
        citizen_phone: (profile as any)?.phone || undefined,
      });
      setResponseId(resp.id);
      setStep('routing');
      toast.success('Réponse confirmée ! Voici l\'itinéraire.');
    } catch {
      toast.error('Erreur lors de la confirmation');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (responseId) {
      try {
        await cancelResponse(responseId);
        toast.info('Réponse annulée');
      } catch {
        toast.error('Erreur lors de l\'annulation');
      }
    }
    onClose();
  };

  // Initialize map and route when in routing step
  useEffect(() => {
    if (step !== 'routing' || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const providerLat = emergency.provider_lat || 35.1975;
    const providerLng = emergency.provider_lng || -0.6300;

    const map = L.map(mapContainerRef.current).setView([providerLat, providerLng], 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    // Provider marker
    const providerIcon = L.divIcon({
      className: '',
      html: `<div style="background:#ef4444;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏥</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    L.marker([providerLat, providerLng], { icon: providerIcon })
      .addTo(map)
      .bindPopup(emergency.provider_name || 'Centre de don');

    // Get user location and route
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // User marker
        const userIcon = L.divIcon({
          className: '',
          html: `<div style="background:#3b82f6;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">📍</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker([userLat, userLng], { icon: userIcon })
          .addTo(map)
          .bindPopup('Votre position');

        // Calculate route via OSRM
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${providerLng},${providerLat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();

          if (data.code === 'Ok' && data.routes?.length) {
            const route = data.routes[0];
            const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
            
            L.polyline(coords, {
              color: '#ef4444',
              weight: 5,
              opacity: 0.8,
            }).addTo(map);

            const distance = Math.round((route.distance / 1000) * 10) / 10;
            const duration = Math.round(route.duration / 60);
            setRouteInfo({ distance, duration });

            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        } catch {
          toast.error('Impossible de calculer l\'itinéraire');
        }
      },
      () => {
        // Fallback if no geolocation
        toast.warning('Géolocalisation non disponible. Seul le centre de don est affiché.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [step, emergency]);

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-destructive" />
            {step === 'confirm' ? 'Confirmer votre réponse' : 'Itinéraire vers le centre'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emergency summary */}
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="destructive" className="text-lg px-3">{emergency.blood_type_needed}</Badge>
            <Badge variant={emergency.urgency_level === 'critical' ? 'destructive' : 'secondary'}>
              {emergency.urgency_level === 'critical' ? 'Critique' : 'Urgent'}
            </Badge>
          </div>
          {emergency.provider_name && (
            <p className="text-sm flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {emergency.provider_name}
            </p>
          )}
        </div>

        {step === 'confirm' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              En confirmant, le centre de don sera informé que vous êtes en route. Vos informations (nom, téléphone) seront partagées.
            </p>
            <Button
              className="w-full"
              variant="destructive"
              onClick={handleConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Confirmer ma réponse
            </Button>
          </div>
        )}

        {step === 'routing' && (
          <>
            {routeInfo && (
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="font-medium">{routeInfo.distance} km</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">{routeInfo.duration} min</span>
                </div>
              </div>
            )}
            <div
              ref={mapContainerRef}
              className="w-full h-[300px] rounded-lg border overflow-hidden"
              style={{ zIndex: 1 }}
            />
            <Button variant="outline" className="w-full" onClick={handleCancel}>
              Annuler ma réponse
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
