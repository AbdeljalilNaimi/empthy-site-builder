import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Stethoscope, Shield, Accessibility, CreditCard, Search, X,
  Building, ParkingCircle, Eye, Ear, Volume2, PersonStanding, DoorOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SERVICE_CATEGORIES,
  MEDICAL_SPECIALTIES,
  INSURANCE_OPTIONS,
  ACCESSIBILITY_OPTIONS,
} from '@/components/provider/registration/types';

interface ProfileServicesEditorProps {
  services: string[];
  specialties: string[];
  insurances: string[];
  accessibility: string[];
  onServicesChange: (services: string[]) => void;
  onSpecialtiesChange: (specialties: string[]) => void;
  onInsurancesChange: (insurances: string[]) => void;
  onAccessibilityChange: (accessibility: string[]) => void;
}

// Icons mapping for accessibility features
const accessibilityIcons: Record<string, React.ReactNode> = {
  'Accès fauteuil roulant': <PersonStanding className="h-4 w-4" />,
  'Ascenseur': <Building className="h-4 w-4" />,
  'Parking handicapé': <ParkingCircle className="h-4 w-4" />,
  'Toilettes adaptées': <DoorOpen className="h-4 w-4" />,
  'Signalétique braille': <Eye className="h-4 w-4" />,
  'Personnel formé LSF': <Ear className="h-4 w-4" />,
  'Audio-guidage': <Volume2 className="h-4 w-4" />,
};

export function ProfileServicesEditor({
  services,
  specialties,
  insurances,
  accessibility,
  onServicesChange,
  onSpecialtiesChange,
  onInsurancesChange,
  onAccessibilityChange,
}: ProfileServicesEditorProps) {
  const [serviceSearch, setServiceSearch] = useState('');
  const [specialtySearch, setSpecialtySearch] = useState('');

  const toggleItem = (
    item: string, 
    list: string[], 
    onChange: (items: string[]) => void
  ) => {
    if (list.includes(item)) {
      onChange(list.filter(i => i !== item));
    } else {
      onChange([...list, item]);
    }
  };

  const filteredServices = SERVICE_CATEGORIES.filter(s => 
    s.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const filteredSpecialties = MEDICAL_SPECIALTIES.filter(s => 
    s.toLowerCase().includes(specialtySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Services Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-4 w-4" />
            Services proposés
          </CardTitle>
          <CardDescription>
            Sélectionnez les services que vous offrez
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Services */}
          {services.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {services.map(service => (
                <Badge 
                  key={service} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20 group"
                  onClick={() => toggleItem(service, services, onServicesChange)}
                >
                  {service}
                  <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Badge>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un service..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Service Options */}
          <ScrollArea className="h-[180px] rounded-md border p-3">
            <div className="grid grid-cols-2 gap-2">
              {filteredServices.map(service => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service}`}
                    checked={services.includes(service)}
                    onCheckedChange={() => toggleItem(service, services, onServicesChange)}
                  />
                  <Label 
                    htmlFor={`service-${service}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {service}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Specialties Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Spécialités médicales
          </CardTitle>
          <CardDescription>
            Ajoutez vos spécialités pour améliorer la visibilité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Specialties */}
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {specialties.map(specialty => (
                <Badge 
                  key={specialty} 
                  className="cursor-pointer hover:bg-primary/80 group"
                  onClick={() => toggleItem(specialty, specialties, onSpecialtiesChange)}
                >
                  {specialty}
                  <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Badge>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une spécialité..."
              value={specialtySearch}
              onChange={(e) => setSpecialtySearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Specialty Options */}
          <ScrollArea className="h-[180px] rounded-md border p-3">
            <div className="grid grid-cols-2 gap-2">
              {filteredSpecialties.map(specialty => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox
                    id={`specialty-${specialty}`}
                    checked={specialties.includes(specialty)}
                    onCheckedChange={() => toggleItem(specialty, specialties, onSpecialtiesChange)}
                  />
                  <Label 
                    htmlFor={`specialty-${specialty}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {specialty}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Insurance Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Assurances acceptées
          </CardTitle>
          <CardDescription>
            Indiquez les modes de paiement et assurances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {INSURANCE_OPTIONS.map(insurance => {
              const isSelected = insurances.includes(insurance);
              return (
                <Badge 
                  key={insurance}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    "cursor-pointer transition-all",
                    isSelected 
                      ? "hover:bg-primary/80" 
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => toggleItem(insurance, insurances, onInsurancesChange)}
                >
                  {insurance}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Accessibility className="h-4 w-4" />
            Accessibilité
          </CardTitle>
          <CardDescription>
            Caractéristiques d'accessibilité de votre établissement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ACCESSIBILITY_OPTIONS.map(option => {
              const isSelected = accessibility.includes(option);
              const icon = accessibilityIcons[option] || <Accessibility className="h-4 w-4" />;
              
              return (
                <div
                  key={option}
                  onClick={() => toggleItem(option, accessibility, onAccessibilityChange)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    isSelected 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-muted/30 border-border hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-full",
                    isSelected ? "bg-primary/20" : "bg-muted"
                  )}>
                    {icon}
                  </div>
                  <span className="text-sm font-medium">{option}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
