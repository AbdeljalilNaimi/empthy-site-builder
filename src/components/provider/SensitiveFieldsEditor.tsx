import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Lock, Save, Shield, Loader2 } from 'lucide-react';
import { SENSITIVE_FIELD_LABELS, type SensitiveField } from '@/constants/sensitiveFields';
import { LocationPicker } from './LocationPicker';
import { PROVIDER_TYPE_LABELS, type ProviderType } from '@/data/providers';

interface SensitiveFieldsData {
  name: string;
  facilityNameFr?: string;
  facilityNameAr?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area: string;
  postalCode: string;
  lat: number;
  lng: number;
  legalRegistrationNumber?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  providerType?: string;
}

interface SensitiveFieldsEditorProps {
  data: SensitiveFieldsData;
  originalData: SensitiveFieldsData;
  isVerified: boolean;
  isSaving: boolean;
  onDataChange: (field: keyof SensitiveFieldsData, value: string | number) => void;
  onSave: () => Promise<void>;
}

export function SensitiveFieldsEditor({
  data,
  originalData,
  isVerified,
  isSaving,
  onDataChange,
  onSave,
}: SensitiveFieldsEditorProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Detect which sensitive fields have been modified
  const getModifiedFields = (): SensitiveField[] => {
    const modified: SensitiveField[] = [];
    const fieldsToCheck: (keyof SensitiveFieldsData)[] = [
      'name', 'facilityNameFr', 'facilityNameAr', 'phone', 'email', 
      'address', 'city', 'area', 'postalCode', 'lat', 'lng', 
      'legalRegistrationNumber', 'contactPersonName', 'contactPersonRole'
    ];
    
    for (const field of fieldsToCheck) {
      if (data[field] !== originalData[field]) {
        modified.push(field as SensitiveField);
      }
    }
    return modified;
  };

  const modifiedFields = getModifiedFields();
  const hasChanges = modifiedFields.length > 0;

  const handleSaveClick = () => {
    if (isVerified && hasChanges) {
      // Show confirmation dialog for verified providers
      setShowConfirmDialog(true);
    } else {
      // Non-verified can save directly
      onSave();
    }
  };

  const handleConfirmSave = async () => {
    setShowConfirmDialog(false);
    await onSave();
  };

  return (
    <>
      <Card className={isVerified ? 'border-amber-500/30' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                Informations légales
                {isVerified && (
                  <Badge variant="outline" className="ml-2 text-amber-600 border-amber-500/50">
                    <Lock className="h-3 w-3 mr-1" />
                    Sensible
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isVerified 
                  ? 'Modifier ces champs révoquera votre vérification.'
                  : 'Informations officielles de votre établissement.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Warning for verified providers */}
          {isVerified && (
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-700 text-sm">
                <strong>Attention :</strong> Toute modification de ces champs entraînera 
                la révocation de votre statut vérifié. Vous devrez soumettre 
                une nouvelle demande de vérification.
              </AlertDescription>
            </Alert>
          )}

          {/* Form Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Provider Type (Read-only) */}
            {data.providerType && (
              <div className="sm:col-span-2">
                <Label>Type d'établissement</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md border">
                  <span className="text-lg">
                    {PROVIDER_TYPE_LABELS[data.providerType as ProviderType]?.icon || '🏥'}
                  </span>
                  <span className="font-medium">
                    {PROVIDER_TYPE_LABELS[data.providerType as ProviderType]?.fr || data.providerType}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    ({PROVIDER_TYPE_LABELS[data.providerType as ProviderType]?.ar || ''})
                  </span>
                </div>
              </div>
            )}

            <div className="sm:col-span-2">
              <Label htmlFor="name">
                Nom de l'établissement
                {isVerified && <Lock className="h-3 w-3 inline ml-1 text-amber-500" />}
              </Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => onDataChange('name', e.target.value)}
                className={modifiedFields.includes('name') ? 'border-amber-500' : ''}
              />
            </div>

            {/* Bilingual Names */}
            <div>
              <Label htmlFor="facilityNameFr">
                Nom en français
                {isVerified && <Lock className="h-3 w-3 inline ml-1 text-amber-500" />}
              </Label>
              <Input
                id="facilityNameFr"
                value={data.facilityNameFr || ''}
                onChange={(e) => onDataChange('facilityNameFr', e.target.value)}
                placeholder="Nom officiel en français"
                className={modifiedFields.includes('facilityNameFr') ? 'border-amber-500' : ''}
              />
            </div>

            <div>
              <Label htmlFor="facilityNameAr">
                الاسم بالعربية
                {isVerified && <Lock className="h-3 w-3 inline ml-1 text-amber-500" />}
              </Label>
              <Input
                id="facilityNameAr"
                dir="rtl"
                value={data.facilityNameAr || ''}
                onChange={(e) => onDataChange('facilityNameAr', e.target.value)}
                placeholder="الاسم الرسمي بالعربية"
                className={modifiedFields.includes('facilityNameAr') ? 'border-amber-500' : ''}
              />
            </div>

            <div>
              <Label htmlFor="phone">
                Téléphone officiel
                {isVerified && <Lock className="h-3 w-3 inline ml-1 text-amber-500" />}
              </Label>
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) => onDataChange('phone', e.target.value)}
                className={modifiedFields.includes('phone') ? 'border-amber-500' : ''}
              />
            </div>

            <div>
              <Label htmlFor="email">
                Email officiel
                {isVerified && <Lock className="h-3 w-3 inline ml-1 text-amber-500" />}
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email || ''}
                onChange={(e) => onDataChange('email', e.target.value)}
                className={modifiedFields.includes('email') ? 'border-amber-500' : ''}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="address">
                Adresse
                {isVerified && <Lock className="h-3 w-3 inline ml-1 text-amber-500" />}
              </Label>
              <Input
                id="address"
                value={data.address}
                onChange={(e) => onDataChange('address', e.target.value)}
                className={modifiedFields.includes('address') ? 'border-amber-500' : ''}
              />
            </div>

            <div>
              <Label htmlFor="city">
                Ville
                {isVerified && <Lock className="h-3 w-3 inline ml-1 text-amber-500" />}
              </Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => onDataChange('city', e.target.value)}
                className={modifiedFields.includes('city') ? 'border-amber-500' : ''}
              />
            </div>

            <div>
              <Label htmlFor="area">
                Quartier
                {isVerified && <Lock className="h-3 w-3 inline ml-1 text-amber-500" />}
              </Label>
              <Input
                id="area"
                value={data.area}
                onChange={(e) => onDataChange('area', e.target.value)}
                className={modifiedFields.includes('area') ? 'border-amber-500' : ''}
              />
            </div>

            <div>
              <Label htmlFor="postalCode">
                Code postal
                {isVerified && <Lock className="h-3 w-3 inline ml-1 text-amber-500" />}
              </Label>
              <Input
                id="postalCode"
                value={data.postalCode || ''}
                onChange={(e) => onDataChange('postalCode', e.target.value)}
                placeholder="22000"
                className={modifiedFields.includes('postalCode') ? 'border-amber-500' : ''}
              />
            </div>

            <div>
              <Label htmlFor="legalRegistrationNumber">
                N° d'inscription légale
                {isVerified && <Lock className="h-3 w-3 inline ml-1 text-amber-500" />}
              </Label>
              <Input
                id="legalRegistrationNumber"
                value={data.legalRegistrationNumber || ''}
                onChange={(e) => onDataChange('legalRegistrationNumber', e.target.value)}
                className={modifiedFields.includes('legalRegistrationNumber') ? 'border-amber-500' : ''}
              />
            </div>

            <div>
              <Label htmlFor="contactPersonName">
                Nom du contact
                {isVerified && <Lock className="h-3 w-3 inline ml-1 text-amber-500" />}
              </Label>
              <Input
                id="contactPersonName"
                value={data.contactPersonName || ''}
                onChange={(e) => onDataChange('contactPersonName', e.target.value)}
                className={modifiedFields.includes('contactPersonName') ? 'border-amber-500' : ''}
              />
            </div>

            <div>
              <Label htmlFor="contactPersonRole">
                Fonction du contact
                {isVerified && <Lock className="h-3 w-3 inline ml-1 text-amber-500" />}
              </Label>
              <Input
                id="contactPersonRole"
                value={data.contactPersonRole || ''}
                onChange={(e) => onDataChange('contactPersonRole', e.target.value)}
                placeholder="Directeur, Gérant..."
                className={modifiedFields.includes('contactPersonRole') ? 'border-amber-500' : ''}
              />
            </div>
          </div>

          {/* Location Map */}
          <div>
            <Label className="mb-2 block">
              Localisation GPS
              {isVerified && <Lock className="h-3 w-3 inline ml-1 text-amber-500" />}
            </Label>
            <div className={`h-[200px] rounded-lg overflow-hidden border ${
              (modifiedFields.includes('lat') || modifiedFields.includes('lng')) 
                ? 'border-amber-500' 
                : ''
            }`}>
              <LocationPicker
                lat={data.lat}
                lng={data.lng}
                onLocationChange={(lat, lng) => {
                  onDataChange('lat', lat);
                  onDataChange('lng', lng);
                }}
              />
            </div>
          </div>

          {/* Modified fields indicator */}
          {hasChanges && (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-amber-600 font-medium">Champs modifiés :</span>
              {modifiedFields.map((field) => (
                <Badge 
                  key={field} 
                  variant="outline" 
                  className="text-amber-600 border-amber-500/50"
                >
                  {SENSITIVE_FIELD_LABELS[field] || field}
                </Badge>
              ))}
            </div>
          )}

          {/* Save Button */}
          <Button 
            onClick={handleSaveClick}
            disabled={isSaving || !hasChanges}
            className={isVerified && hasChanges ? 'bg-amber-600 hover:bg-amber-700' : ''}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isVerified && hasChanges 
                  ? 'Enregistrer (révoquera la vérification)'
                  : 'Enregistrer les informations légales'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Modification de données sensibles
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Vous modifiez les champs suivants :</p>
              <ul className="list-disc list-inside bg-amber-500/10 rounded-lg p-3 space-y-1">
                {modifiedFields.map((field) => (
                  <li key={field} className="text-amber-700">
                    {SENSITIVE_FIELD_LABELS[field] || field}
                  </li>
                ))}
              </ul>
              <p className="font-semibold text-destructive">
                ⚠️ Votre vérification sera révoquée et vous devrez soumettre 
                de nouveaux documents pour validation. Votre profil ne sera 
                plus visible publiquement.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmSave}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Je comprends, continuer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
