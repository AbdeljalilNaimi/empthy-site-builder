import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Phone, Clock, Star, CheckCircle2, AlertCircle,
  Building2, Stethoscope, Languages, Edit, Eye
} from 'lucide-react';
import { ProviderFormData, PROVIDER_TYPE_LABELS, WeeklySchedule } from './types';
import { cn } from '@/lib/utils';

interface ProfilePreviewCardProps {
  formData: ProviderFormData;
  onEditSection?: (step: number) => void;
  mode?: 'compact' | 'full';
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

export function ProfilePreviewCard({ 
  formData, 
  onEditSection,
  mode = 'full' 
}: ProfilePreviewCardProps) {
  const providerTypeLabel = formData.providerType 
    ? PROVIDER_TYPE_LABELS[formData.providerType]?.fr 
    : '';
  
  const providerTypeIcon = formData.providerType 
    ? PROVIDER_TYPE_LABELS[formData.providerType]?.icon 
    : Stethoscope;
  
  const TypeIcon = providerTypeIcon;

  // Calculate "open now" status
  const now = new Date();
  const dayNames: (keyof WeeklySchedule)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];
  const currentDay = dayNames[now.getDay()];
  const currentSchedule = formData.schedule[currentDay];
  const isOpenNow = formData.is24_7 || (
    currentSchedule.isOpen && 
    now.getHours() >= parseInt(currentSchedule.openTime) &&
    now.getHours() < parseInt(currentSchedule.closeTime)
  );

  return (
    <div className="relative">
      {/* Pending Review Watermark */}
      <div className="absolute -top-3 -right-3 z-10">
        <Badge 
          variant="secondary" 
          className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-lg px-3 py-1"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          En attente de vérification
        </Badge>
      </div>

      <Card className="overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 shadow-lg">
        {/* Hero Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20">
          {formData.galleryPreviews.length > 0 ? (
            <img
              src={formData.galleryPreviews[0]}
              alt="Établissement"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Logo overlay */}
          {formData.logoPreview && (
            <div className="absolute -bottom-8 left-4 w-20 h-20 rounded-xl border-4 border-background overflow-hidden shadow-lg">
              <img
                src={formData.logoPreview}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Quick edit button */}
          {onEditSection && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-3 left-3 bg-background/80 backdrop-blur"
              onClick={() => onEditSection(5)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Modifier photos
            </Button>
          )}
        </div>

        <CardContent className={cn("pt-12", !formData.logoPreview && "pt-6")}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-foreground">
                  {formData.facilityNameFr || 'Nom de l\'établissement'}
                </h3>
                {/* Where verified badge will appear */}
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center" title="Badge vérifié après approbation">
                  <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              {formData.facilityNameAr && (
                <p className="text-muted-foreground" dir="rtl">{formData.facilityNameAr}</p>
              )}
            </div>
            {onEditSection && (
              <Button variant="ghost" size="icon" onClick={() => onEditSection(2)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Type & Rating */}
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <TypeIcon className="h-3 w-3" />
              {providerTypeLabel}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">Nouveau</span>
            </div>
            <Badge 
              variant={isOpenNow ? "default" : "secondary"}
              className={cn(
                isOpenNow 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" 
                  : ""
              )}
            >
              <Clock className="h-3 w-3 mr-1" />
              {formData.is24_7 ? '24h/24' : isOpenNow ? 'Ouvert' : 'Fermé'}
            </Badge>
          </div>

          {/* Location */}
          <div 
            className={cn(
              "flex items-start gap-2 mb-3 p-2 -mx-2 rounded-lg transition-colors",
              onEditSection && "hover:bg-muted/50 cursor-pointer"
            )}
            onClick={() => onEditSection?.(3)}
          >
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-foreground">{formData.address || 'Adresse non renseignée'}</p>
              <p className="text-muted-foreground">
                {formData.area}, {formData.city}
              </p>
            </div>
            {onEditSection && <Edit className="h-3 w-3 text-muted-foreground ml-auto" />}
          </div>

          {/* Phone */}
          {formData.phone && (
            <div className="flex items-center gap-2 mb-4">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-sm">{formData.phone}</span>
            </div>
          )}

          {/* Specialties */}
          {formData.specialties.length > 0 && (
            <div 
              className={cn(
                "mb-4 p-2 -mx-2 rounded-lg transition-colors",
                onEditSection && "hover:bg-muted/50 cursor-pointer"
              )}
              onClick={() => onEditSection?.(4)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Spécialités</span>
                {onEditSection && <Edit className="h-3 w-3 text-muted-foreground ml-auto" />}
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.specialties.slice(0, 4).map(spec => (
                  <Badge key={spec} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {formData.specialties.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{formData.specialties.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Languages */}
          {formData.languages.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Languages className="h-4 w-4 text-primary" />
              <div className="flex gap-1">
                {formData.languages.map(lang => (
                  <Badge key={lang} variant="secondary" className="text-xs uppercase">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description preview */}
          {mode === 'full' && formData.description && (
            <div 
              className={cn(
                "p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground mb-4",
                onEditSection && "cursor-pointer hover:bg-muted"
              )}
              onClick={() => onEditSection?.(5)}
            >
              <p className="line-clamp-3">{formData.description}</p>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" disabled>
              <Phone className="h-4 w-4 mr-2" />
              Appeler
            </Button>
            <Button variant="outline" className="flex-1" disabled>
              <Eye className="h-4 w-4 mr-2" />
              Voir profil
            </Button>
          </div>

          {/* Preview notice */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Aperçu du profil public • Les boutons seront actifs après vérification
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
