import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplet, AlertTriangle, X, MapPin, Heart } from 'lucide-react';
import { BloodEmergency, subscribeToEmergencies } from '@/services/bloodEmergencyService';
import { useAuth } from '@/contexts/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';

interface EmergencyAlertBannerProps {
  onRespond: (emergency: BloodEmergency) => void;
}

export function EmergencyAlertBanner({ onRespond }: EmergencyAlertBannerProps) {
  const { profile } = useAuth();
  const [emergencies, setEmergencies] = useState<BloodEmergency[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const geo = useGeolocation();

  useEffect(() => {
    const unsub = subscribeToEmergencies(setEmergencies);
    return unsub;
  }, []);

  // Filter by user's blood group if set
  const bloodGroup = (profile as any)?.blood_group;
  const matchingEmergencies = emergencies.filter(e => {
    if (dismissed.has(e.id)) return false;
    if (!bloodGroup) return true; // show all if no blood group set
    return e.blood_type_needed === bloodGroup;
  });

  const getDistance = (e: BloodEmergency) => {
    if (!geo.latitude || !geo.longitude || !e.provider_lat || !e.provider_lng) return null;
    return geo.calculateDistance(geo.latitude, geo.longitude, e.provider_lat, e.provider_lng);
  };

  if (matchingEmergencies.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {matchingEmergencies.map(emergency => {
        const dist = getDistance(emergency);
        return (
          <div
            key={emergency.id}
            className={cn(
              "relative p-4 rounded-lg border-2 animate-pulse-slow",
              emergency.urgency_level === 'critical'
                ? "border-destructive bg-destructive/10"
                : "border-orange-400 bg-orange-50"
            )}
            style={{ animationDuration: '2s' }}
          >
            <button
              onClick={() => setDismissed(prev => new Set(prev).add(emergency.id))}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/50"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-full",
                  emergency.urgency_level === 'critical' ? "bg-destructive/20" : "bg-orange-200"
                )}>
                  <Droplet className={cn(
                    "h-6 w-6",
                    emergency.urgency_level === 'critical' ? "text-destructive" : "text-orange-600"
                  )} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn(
                      "h-4 w-4",
                      emergency.urgency_level === 'critical' ? "text-destructive" : "text-orange-500"
                    )} />
                    <span className="font-bold">
                      URGENCE SANG : {emergency.blood_type_needed}
                    </span>
                    <Badge variant={emergency.urgency_level === 'critical' ? 'destructive' : 'secondary'}>
                      {emergency.urgency_level === 'critical' ? 'Critique' : 'Urgent'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
                    {emergency.provider_name && <span>{emergency.provider_name}</span>}
                    {dist !== null && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {dist.toFixed(1)} km
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                className="sm:ml-auto whitespace-nowrap"
                onClick={() => onRespond(emergency)}
              >
                <Heart className="h-4 w-4 mr-1" />
                Je peux donner
              </Button>
            </div>

            {emergency.message && (
              <p className="text-sm text-muted-foreground mt-2 italic">"{emergency.message}"</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
