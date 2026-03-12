import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, Phone, Mail, User, FileText, CheckCircle2, Loader2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProviderFormData, PROVIDER_TYPE_LABELS } from './types';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { z } from 'zod';

interface Step2Props {
  formData: ProviderFormData;
  updateFormData: (data: Partial<ProviderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Zod schema for Algerian phone validation (+213)
const algerianPhoneSchema = z.string()
  .min(1, 'Le numéro de téléphone est requis')
  .regex(
    /^(\+213|0)(5|6|7)[0-9]{8}$/,
    'Format invalide. Utilisez +213XXXXXXXXX ou 0XXXXXXXXX'
  );

// Basic info validation schema
const basicInfoSchema = z.object({
  facilityNameFr: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  facilityNameAr: z.string().optional(),
  legalRegistrationNumber: z.string()
    .min(1, 'Le numéro d\'enregistrement est requis')
    .max(50, 'Numéro trop long'),
  contactPersonName: z.string()
    .min(2, 'Le nom du contact est requis')
    .max(100, 'Nom trop long'),
  phone: algerianPhoneSchema,
});

export function Step2BasicInfo({ formData, updateFormData, onNext, onPrev }: Step2Props) {
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const validateForm = () => {
    try {
      basicInfoSchema.parse({
        facilityNameFr: formData.facilityNameFr,
        facilityNameAr: formData.facilityNameAr,
        legalRegistrationNumber: formData.legalRegistrationNumber,
        contactPersonName: formData.contactPersonName,
        phone: formData.phone,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleVerifyPhone = async () => {
    // First validate the phone format
    try {
      algerianPhoneSchema.parse(formData.phone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, phone: error.errors[0]?.message || 'Format invalide' }));
        return;
      }
    }

    setIsVerifyingPhone(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    updateFormData({ phoneVerified: true });
    setIsVerifyingPhone(false);
    toast({
      title: "Numéro vérifié",
      description: "Votre numéro de téléphone a été vérifié avec succès.",
    });
  };

  const handleVerifyEmail = async () => {
    setIsVerifyingEmail(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    updateFormData({ emailVerified: true });
    setIsVerifyingEmail(false);
    toast({
      title: "Email vérifié",
      description: "Votre adresse email a été vérifiée avec succès.",
    });
  };

  // Format phone input to Algerian format
  const handlePhoneChange = (value: string) => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Auto-add +213 prefix if starting with 0
    if (cleaned.startsWith('0') && cleaned.length > 1) {
      // Keep as is for local format
    } else if (!cleaned.startsWith('+') && cleaned.length > 0 && !cleaned.startsWith('0')) {
      cleaned = '+213' + cleaned;
    }
    
    updateFormData({ phone: cleaned, phoneVerified: false });
  };

  const providerTypeLabel = formData.providerType 
    ? PROVIDER_TYPE_LABELS[formData.providerType]?.fr 
    : '';

  const providerTypeAr = formData.providerType 
    ? PROVIDER_TYPE_LABELS[formData.providerType]?.ar 
    : '';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Informations de l'établissement
          </h2>
        </div>
        <p className="text-muted-foreground">
          Ces informations seront affichées sur votre profil public
        </p>
        {providerTypeLabel && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{providerTypeLabel}</Badge>
            {providerTypeAr && (
              <Badge variant="outline" dir="rtl">{providerTypeAr}</Badge>
            )}
          </div>
        )}
      </div>

      {/* Bilingual Facility Name Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <Label className="text-base font-semibold mb-4 block">
            Nom de l'établissement (Bilingue)
          </Label>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* French Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-600">
                  FR
                </span>
                <Label htmlFor="facilityNameFr">
                  Français <span className="text-destructive">*</span>
                </Label>
              </div>
              <div className="relative">
                <Building2 className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                  isRTL ? "right-3" : "left-3"
                )} />
                <Input
                  id="facilityNameFr"
                  placeholder="Ex: Clinique El Amal"
                  className={cn(
                    isRTL ? "pr-10" : "pl-10",
                    errors.facilityNameFr && "border-destructive"
                  )}
                  value={formData.facilityNameFr}
                  onChange={(e) => updateFormData({ facilityNameFr: e.target.value })}
                />
              </div>
              {errors.facilityNameFr && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.facilityNameFr}
                </p>
              )}
            </div>

            {/* Arabic Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-600">
                  AR
                </span>
                <Label htmlFor="facilityNameAr">
                  العربية (Recommandé)
                </Label>
              </div>
              <div className="relative">
                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="facilityNameAr"
                  placeholder="مثال: عيادة الأمل"
                  className="pr-10 text-right"
                  dir="rtl"
                  value={formData.facilityNameAr}
                  onChange={(e) => updateFormData({ facilityNameAr: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Améliore la visibilité pour les patients arabophones
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Registration */}
      <div className="space-y-2">
        <Label htmlFor="legalRegistrationNumber">
          Numéro d'enregistrement légal <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <FileText className={cn(
            "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
            isRTL ? "right-3" : "left-3"
          )} />
          <Input
            id="legalRegistrationNumber"
            placeholder="Ex: RC-22-00001 ou Agrément ministériel"
            className={cn(
              isRTL ? "pr-10" : "pl-10",
              errors.legalRegistrationNumber && "border-destructive"
            )}
            value={formData.legalRegistrationNumber}
            onChange={(e) => updateFormData({ legalRegistrationNumber: e.target.value })}
          />
        </div>
        {errors.legalRegistrationNumber && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.legalRegistrationNumber}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Numéro du registre de commerce ou agrément ministériel
        </p>
      </div>

      {/* Contact Person */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactPersonName">
            Personne de contact <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
              isRTL ? "right-3" : "left-3"
            )} />
            <Input
              id="contactPersonName"
              placeholder="Nom complet"
              className={cn(
                isRTL ? "pr-10" : "pl-10",
                errors.contactPersonName && "border-destructive"
              )}
              value={formData.contactPersonName}
              onChange={(e) => updateFormData({ contactPersonName: e.target.value })}
            />
          </div>
          {errors.contactPersonName && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.contactPersonName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPersonRole">
            Fonction
          </Label>
          <Input
            id="contactPersonRole"
            placeholder="Ex: Directeur, Responsable administratif"
            value={formData.contactPersonRole}
            onChange={(e) => updateFormData({ contactPersonRole: e.target.value })}
          />
        </div>
      </div>

      {/* Phone & Email Verification with Algerian Format */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">
            Numéro de téléphone <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                isRTL ? "right-3" : "left-3"
              )} />
              <Input
                id="phone"
                type="tel"
                placeholder="+213 5XX XXX XXX"
                className={cn(
                  isRTL ? "pr-10" : "pl-10",
                  errors.phone && "border-destructive"
                )}
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant={formData.phoneVerified ? "secondary" : "outline"}
              onClick={handleVerifyPhone}
              disabled={!formData.phone || formData.phoneVerified || isVerifyingPhone}
            >
              {isVerifyingPhone ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : formData.phoneVerified ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                "Vérifier"
              )}
            </Button>
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.phone}
            </p>
          )}
          {formData.phoneVerified && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Numéro vérifié
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Format: +213 5/6/7 XX XX XX XX
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailVerify">
            Email de contact
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                isRTL ? "right-3" : "left-3"
              )} />
              <Input
                id="emailVerify"
                type="email"
                placeholder={formData.email}
                className={cn(
                  "bg-muted/50",
                  isRTL ? "pr-10" : "pl-10"
                )}
                value={formData.email}
                disabled
              />
            </div>
            <Button
              type="button"
              variant={formData.emailVerified ? "secondary" : "outline"}
              onClick={handleVerifyEmail}
              disabled={formData.emailVerified || isVerifyingEmail}
            >
              {isVerifyingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : formData.emailVerified ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                "Vérifier"
              )}
            </Button>
          </div>
          {formData.emailVerified && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Email vérifié
            </p>
          )}
        </div>
      </div>

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
