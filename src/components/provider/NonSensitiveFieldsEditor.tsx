import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Paintbrush, CheckCircle2, Globe, Home, DollarSign, Link2 } from 'lucide-react';
import { ScheduleEditor } from './ScheduleEditor';
import { PhotoGalleryManager } from './PhotoGalleryManager';
import { ProfileServicesEditor } from './ProfileServicesEditor';
import type { WeeklySchedule } from '@/data/providers';

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

interface NonSensitiveFieldsData {
  description: string;
  specialty: string;
  schedule: WeeklySchedule | null;
  accessible: boolean;
  emergency: boolean;
  photos: string[];
  services: string[];
  specialties: string[];
  insurances: string[];
  accessibility: string[];
  languages: string[];
  homeVisitAvailable: boolean;
  consultationFee: string;
  socialLinks: SocialLinks;
}

interface NonSensitiveFieldsEditorProps {
  data: NonSensitiveFieldsData;
  isVerified: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  providerType?: string;
  providerId?: string;
  onDataChange: <K extends keyof NonSensitiveFieldsData>(
    field: K, 
    value: NonSensitiveFieldsData[K]
  ) => void;
  onSave: () => Promise<void>;
}

const LANGUAGE_OPTIONS = [
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية (Arabe)' },
  { code: 'en', label: 'English' },
  { code: 'amazigh', label: 'ⵜⴰⵎⴰⵣⵉⵖⵜ (Amazigh)' },
];

export function NonSensitiveFieldsEditor({
  data,
  isVerified,
  isSaving,
  hasChanges,
  providerType,
  providerId,
  onDataChange,
  onSave,
}: NonSensitiveFieldsEditorProps) {
  const isHospital = providerType === 'hospital' || providerType === 'birth_hospital' || providerType === 'clinic';
  const TYPES_WITH_EMERGENCY = ['hospital', 'birth_hospital', 'clinic', 'doctor'];
  const TYPES_WITHOUT_HOME_VISIT = ['hospital', 'birth_hospital', 'clinic', 'medical_equipment', 'blood_cabin', 'radiology_center', 'lab'];
  const TYPES_WITHOUT_CONSULTATION_FEE = ['blood_cabin', 'hospital', 'birth_hospital'];
  const showEmergency = TYPES_WITH_EMERGENCY.includes(providerType || '');
  const hideHomeVisit = TYPES_WITHOUT_HOME_VISIT.includes(providerType || '');
  const hideConsultationFee = TYPES_WITHOUT_CONSULTATION_FEE.includes(providerType || '');
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Paintbrush className="h-5 w-5 text-green-600" />
                Profil public
                <Badge variant="outline" className="ml-2 text-green-600 border-green-500/50">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Édition libre
                </Badge>
              </CardTitle>
              <CardDescription>
                {isVerified 
                  ? 'Personnalisez votre profil sans impact sur votre vérification.'
                  : 'Ces informations seront visibles après validation.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Description & Specialty */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description & Spécialité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="description">Description de l'établissement</Label>
            <Textarea
              id="description"
              rows={4}
              value={data.description}
              onChange={(e) => onDataChange('description', e.target.value)}
              placeholder="Décrivez votre établissement, vos services, votre expérience..."
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Une bonne description améliore votre visibilité dans les recherches.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Horaires d'ouverture</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleEditor
            value={data.schedule}
            onChange={(schedule) => onDataChange('schedule', schedule)}
            isEmergency={data.emergency}
          />
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Caractéristiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="accessible"
                checked={data.accessible}
                onCheckedChange={(checked) => onDataChange('accessible', !!checked)}
              />
              <Label htmlFor="accessible" className="font-normal">
                Accès PMR (personnes à mobilité réduite)
              </Label>
            </div>
            {showEmergency && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emergency"
                  checked={data.emergency}
                  onCheckedChange={(checked) => onDataChange('emergency', !!checked)}
                />
                <Label htmlFor="emergency" className="font-normal">
                  Urgences 24/7
                </Label>
              </div>
            )}
            {!hideHomeVisit && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="homeVisit"
                  checked={data.homeVisitAvailable}
                  onCheckedChange={(checked) => onDataChange('homeVisitAvailable', !!checked)}
                />
                <Label htmlFor="homeVisit" className="font-normal flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Visite à domicile
                </Label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Langues parlées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {LANGUAGE_OPTIONS.map((lang) => (
              <div key={lang.code} className="flex items-center space-x-2">
                <Checkbox
                  id={`lang-${lang.code}`}
                  checked={data.languages?.includes(lang.code)}
                  onCheckedChange={(checked) => {
                    const current = data.languages || [];
                    if (checked) {
                      onDataChange('languages', [...current, lang.code]);
                    } else {
                      onDataChange('languages', current.filter(l => l !== lang.code));
                    }
                  }}
                />
                <Label htmlFor={`lang-${lang.code}`} className="font-normal">
                  {lang.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consultation Fee - hidden for legally free services */}
      {!hideConsultationFee && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tarifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="consultationFee">Prix de consultation (DA)</Label>
              <Input
                id="consultationFee"
                value={data.consultationFee || ''}
                onChange={(e) => onDataChange('consultationFee', e.target.value)}
                placeholder="Ex: 2000 DA, 1500-3000 DA"
                className="mt-1.5 max-w-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Indiquez le prix ou la fourchette de prix.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Galerie photos ({data.photos.length}/10)</CardTitle>
          <CardDescription>
            Ajoutez des photos de votre établissement pour attirer plus de patients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoGalleryManager
            photos={data.photos}
            onPhotosChange={(photos) => onDataChange('photos', photos)}
            maxPhotos={10}
            providerId={providerId}
          />
        </CardContent>
      </Card>

      {/* Services & Specialties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Services, Assurances & Accessibilité</CardTitle>
          <CardDescription>
            Détails supplémentaires pour améliorer votre visibilité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileServicesEditor
            services={data.services}
            specialties={data.specialties}
            insurances={data.insurances}
            accessibility={data.accessibility}
            onServicesChange={(services) => onDataChange('services', services)}
            onSpecialtiesChange={(specialties) => onDataChange('specialties', specialties)}
            onInsurancesChange={(insurances) => onDataChange('insurances', insurances)}
            onAccessibilityChange={(accessibility) => onDataChange('accessibility', accessibility)}
          />
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Liens et réseaux sociaux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                value={data.socialLinks?.website || ''}
                onChange={(e) => onDataChange('socialLinks', { ...data.socialLinks, website: e.target.value })}
                placeholder="https://www.example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={data.socialLinks?.facebook || ''}
                onChange={(e) => onDataChange('socialLinks', { ...data.socialLinks, facebook: e.target.value })}
                placeholder="https://facebook.com/..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={data.socialLinks?.instagram || ''}
                onChange={(e) => onDataChange('socialLinks', { ...data.socialLinks, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={data.socialLinks?.linkedin || ''}
                onChange={(e) => onDataChange('socialLinks', { ...data.socialLinks, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={onSave}
        disabled={isSaving || !hasChanges}
        className="w-full"
        size="lg"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer le profil
            {hasChanges && <span className="ml-2 text-xs bg-primary-foreground/20 px-1.5 py-0.5 rounded">●</span>}
          </>
        )}
      </Button>
    </div>
  );
}
