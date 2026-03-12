import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, Clock, Home, Plus, Trash2, Navigation, AlertTriangle, Loader2, Landmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProviderFormData, WeeklySchedule, AdditionalLocation } from './types';
import { AREAS } from '@/data/providers';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Step3Props {
  formData: ProviderFormData;
  updateFormData: (data: Partial<ProviderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const DAYS_FR: Record<keyof WeeklySchedule, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

// Default center: Sidi Bel Abbès, Algeria
const DEFAULT_CENTER: [number, number] = [35.1975, -0.6300];

export function Step3Location({ formData, updateFormData, onNext, onPrev }: Step3Props) {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Check if provider type should show 24/7 emergency toggle
  const show24_7EmergencyToggle = ['pharmacy', 'birth_hospital', 'hospital'].includes(formData.providerType);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] = formData.lat && formData.lng 
      ? [formData.lat, formData.lng] 
      : DEFAULT_CENTER;
    const initialZoom = formData.lat && formData.lng ? 16 : 13;

    const map = L.map(mapRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Add click handler to set location
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      updateFormData({ lat, lng });
      toast({
        title: "Position définie",
        description: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
      });
    });

    mapInstanceRef.current = map;

    // Add initial marker if position exists
    if (formData.lat && formData.lng) {
      markerRef.current = L.marker([formData.lat, formData.lng], { icon: defaultIcon }).addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker when position changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Add new marker if position exists
    if (formData.lat && formData.lng) {
      markerRef.current = L.marker([formData.lat, formData.lng], { icon: defaultIcon })
        .addTo(mapInstanceRef.current);
      mapInstanceRef.current.flyTo([formData.lat, formData.lng], 16, { duration: 1 });
    }
  }, [formData.lat, formData.lng]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.address) {
      newErrors.address = 'L\'adresse est requise';
    }
    if (!formData.area) {
      newErrors.area = 'Le quartier est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateFormData({ lat: latitude, lng: longitude });
        setIsLocating(false);
        toast({
          title: "Position détectée",
          description: "Votre position a été définie avec succès.",
        });
      },
      () => {
        setIsLocating(false);
        toast({
          title: "Erreur de géolocalisation",
          description: "Impossible de détecter votre position. Vérifiez les permissions.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const updateSchedule = (day: keyof WeeklySchedule, field: string, value: string | boolean) => {
    const newSchedule = {
      ...formData.schedule,
      [day]: {
        ...formData.schedule[day],
        [field]: value,
      },
    };
    updateFormData({ schedule: newSchedule });
  };

  const addLocation = () => {
    const newLocation: AdditionalLocation = {
      id: Date.now().toString(),
      name: '',
      address: '',
      phone: '',
    };
    updateFormData({
      additionalLocations: [...formData.additionalLocations, newLocation],
    });
  };

  const removeLocation = (id: string) => {
    updateFormData({
      additionalLocations: formData.additionalLocations.filter(l => l.id !== id),
    });
  };

  const updateLocation = (id: string, field: keyof AdditionalLocation, value: string) => {
    updateFormData({
      additionalLocations: formData.additionalLocations.map(l =>
        l.id === id ? { ...l, [field]: value } : l
      ),
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Localisation & Disponibilité
          </h2>
        </div>
        <p className="text-muted-foreground">
          Aidez les patients à vous trouver facilement
        </p>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">
            Adresse complète <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="address"
              placeholder="Numéro, Rue, Quartier"
              className={cn("pl-10", errors.address && "border-destructive")}
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
            />
          </div>
          {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">
              Quartier <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.area}
              onValueChange={(value) => updateFormData({ area: value })}
            >
              <SelectTrigger className={errors.area ? "border-destructive" : ""}>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.area && <p className="text-sm text-destructive">{errors.area}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Code postal</Label>
            <Input
              id="postalCode"
              placeholder="22000"
              value={formData.postalCode}
              onChange={(e) => updateFormData({ postalCode: e.target.value })}
            />
          </div>
        </div>

        {/* Interactive Leaflet Map */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Définir votre position exacte
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDetectLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Navigation className="h-4 w-4 mr-2" />
                )}
                Détecter ma position
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div ref={mapRef} className="h-64 w-full" />
            <div className="p-3 bg-muted/50 text-xs text-muted-foreground">
              {formData.lat && formData.lng ? (
                <span className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-primary" />
                  Position: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                </span>
              ) : (
                "Cliquez sur la carte pour définir votre emplacement exact"
              )}
            </div>
          </CardContent>
        </Card>

        {/* Landmark Description — hospital, maternity, clinic & doctor */}
        {['hospital', 'birth_hospital', 'clinic', 'doctor'].includes(formData.providerType) && (
          <div className="space-y-2">
            <Label htmlFor="landmarkDescription" className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-muted-foreground" />
              Repère / Point de référence
            </Label>
            <Textarea
              id="landmarkDescription"
              placeholder="Ex: En face du Stade 20 Août, à côté de la Mosquée El-Feth"
              value={formData.landmarkDescription || ''}
              onChange={(e) => updateFormData({ landmarkDescription: e.target.value })}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Décrivez un repère proche pour aider les patients à trouver {formData.providerType === 'doctor' ? 'votre cabinet' : 'l\'établissement'}
            </p>
          </div>
        )}
      </div>

      {/* 24/7 Emergency Toggle - Only for Pharmacies & Birth Hospitals */}
      {show24_7EmergencyToggle && (
        <Card className="border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <Label className="text-base font-medium">Service d'urgence 24h/24</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.providerType === 'pharmacy' 
                      ? 'Pharmacie de garde disponible 24/7'
                      : formData.providerType === 'birth_hospital'
                      ? 'Maternité avec service d\'urgence obstétrique'
                      : 'Service d\'urgences disponible en permanence'
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.is24_7}
                onCheckedChange={(checked) => updateFormData({ is24_7: checked })}
              />
            </div>
            {formData.is24_7 && (
              <Badge variant="outline" className="mt-3 border-orange-500/50 text-orange-600 bg-orange-500/10">
                🚨 Service d'urgence activé
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Horaires d'ouverture
            </CardTitle>
            {!show24_7EmergencyToggle && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="is24_7"
                  checked={formData.is24_7}
                  onCheckedChange={(checked) => updateFormData({ is24_7: checked })}
                />
                <Label htmlFor="is24_7" className="text-sm">Ouvert 24h/24</Label>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!formData.is24_7 && (
            <div className="space-y-3">
              {(Object.keys(DAYS_FR) as Array<keyof WeeklySchedule>).map((day) => (
                <div key={day} className="flex items-center gap-4 flex-wrap">
                  <div className="w-24">
                    <Label className="text-sm">{DAYS_FR[day]}</Label>
                  </div>
                  <Switch
                    checked={formData.schedule[day].isOpen}
                    onCheckedChange={(checked) => updateSchedule(day, 'isOpen', checked)}
                  />
                  {formData.schedule[day].isOpen && (
                    <>
                      <Input
                        type="time"
                        className="w-28"
                        value={formData.schedule[day].openTime}
                        onChange={(e) => updateSchedule(day, 'openTime', e.target.value)}
                      />
                      <span className="text-muted-foreground">à</span>
                      <Input
                        type="time"
                        className="w-28"
                        value={formData.schedule[day].closeTime}
                        onChange={(e) => updateSchedule(day, 'closeTime', e.target.value)}
                      />
                    </>
                  )}
                  {!formData.schedule[day].isOpen && (
                    <span className="text-sm text-muted-foreground">Fermé</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {formData.is24_7 && (
            <p className="text-center text-muted-foreground py-4">
              Votre établissement sera affiché comme disponible 24h/24, 7j/7
            </p>
          )}
        </CardContent>
      </Card>

      {/* Home Visit — hide for hospitals, maternity & radiology (fixed equipment) */}
      {!['hospital', 'birth_hospital', 'clinic', 'radiology_center', 'blood_cabin'].includes(formData.providerType) && (
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Home className="h-5 w-5 text-primary" />
            <div>
              <Label className="text-base">Visites à domicile</Label>
              <p className="text-sm text-muted-foreground">
                Proposez-vous des consultations à domicile ?
              </p>
            </div>
          </div>
          <Switch
            checked={formData.homeVisitAvailable}
            onCheckedChange={(checked) => updateFormData({ homeVisitAvailable: checked })}
          />
        </div>
      )}

      {/* Additional Locations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Emplacements supplémentaires
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLocation}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Pour les établissements avec plusieurs adresses
          </p>
        </CardHeader>
        {formData.additionalLocations.length > 0 && (
          <CardContent className="space-y-4">
            {formData.additionalLocations.map((location, index) => (
              <div key={location.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Emplacement {index + 2}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLocation(location.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Nom du site"
                    value={location.name}
                    onChange={(e) => updateLocation(location.id, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Adresse"
                    value={location.address}
                    onChange={(e) => updateLocation(location.id, 'address', e.target.value)}
                  />
                  <Input
                    placeholder="Téléphone"
                    value={location.phone}
                    onChange={(e) => updateLocation(location.id, 'phone', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          Précédent
        </Button>
        <Button onClick={handleSubmit}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
