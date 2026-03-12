import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Image, Upload, X, Facebook, Instagram, Linkedin, Globe, DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProviderFormData, INSURANCE_OPTIONS } from './types';
import { useToast } from '@/hooks/use-toast';

interface Step5Props {
  formData: ProviderFormData;
  updateFormData: (data: Partial<ProviderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step5Profile({ formData, updateFormData, onNext, onPrev }: Step5Props) {
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description || formData.description.length < 50) {
      newErrors.description = 'La description doit contenir au moins 50 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "Le logo ne doit pas dépasser 5 Mo",
          variant: "destructive",
        });
        return;
      }
      const preview = URL.createObjectURL(file);
      updateFormData({ logo: file, logoPreview: preview });
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPhotos = formData.galleryPhotos.length + files.length;
    
    if (totalPhotos > 10) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez pas ajouter plus de 10 photos",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
    const previews = validFiles.map(f => URL.createObjectURL(f));
    
    updateFormData({
      galleryPhotos: [...formData.galleryPhotos, ...validFiles],
      galleryPreviews: [...formData.galleryPreviews, ...previews],
    });
  };

  const removeGalleryPhoto = (index: number) => {
    updateFormData({
      galleryPhotos: formData.galleryPhotos.filter((_, i) => i !== index),
      galleryPreviews: formData.galleryPreviews.filter((_, i) => i !== index),
    });
  };

  const toggleInsurance = (insurance: string) => {
    const current = formData.insuranceAccepted;
    const updated = current.includes(insurance)
      ? current.filter(i => i !== insurance)
      : [...current, insurance];
    updateFormData({ insuranceAccepted: updated });
  };

  const updateSocialLink = (platform: keyof ProviderFormData['socialLinks'], value: string) => {
    updateFormData({
      socialLinks: {
        ...formData.socialLinks,
        [platform]: value,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Image className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Enrichissez votre profil
          </h2>
        </div>
        <p className="text-muted-foreground">
          Un profil complet attire plus de patients
        </p>
      </div>

      {/* Logo Upload */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Logo / Photo de profil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div 
              className={cn(
                "w-32 h-32 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors",
                formData.logoPreview ? "border-primary" : "border-muted-foreground/30 hover:border-primary"
              )}
              onClick={() => logoInputRef.current?.click()}
            >
              {formData.logoPreview ? (
                <img 
                  src={formData.logoPreview} 
                  alt="Logo preview" 
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-xs">Ajouter</p>
                </div>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                Téléchargez votre logo ou photo de profil
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Format: JPG, PNG ou WebP</li>
                <li>• Taille maximale: 5 Mo</li>
                <li>• Dimensions recommandées: 400x400 px</li>
              </ul>
              {formData.logoPreview && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => updateFormData({ logo: null, logoPreview: '' })}
                >
                  Supprimer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Galerie photos
            <span className="text-sm font-normal text-muted-foreground">
              {formData.galleryPreviews.length}/10 photos
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {formData.galleryPreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                <img 
                  src={preview} 
                  alt={`Gallery ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryPhoto(index)}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {formData.galleryPreviews.length < 10 && (
              <div
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => galleryInputRef.current?.click()}
              >
                <div className="text-center text-muted-foreground">
                  <Upload className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-xs">Ajouter</p>
                </div>
              </div>
            )}
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleGalleryChange}
          />
          <p className="text-xs text-muted-foreground mt-3">
            Ajoutez des photos de votre établissement, équipements, équipe...
          </p>
        </CardContent>
      </Card>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description détaillée <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Décrivez votre établissement, vos services, votre équipe, votre approche..."
          rows={6}
          className={errors.description ? "border-destructive" : ""}
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
        />
        <div className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            {formData.description.length}/500 caractères (minimum 50)
          </p>
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Insurance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Assurances acceptées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {INSURANCE_OPTIONS.map((insurance) => (
              <Badge
                key={insurance}
                variant={formData.insuranceAccepted.includes(insurance) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => toggleInsurance(insurance)}
              >
                {insurance}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <div className="space-y-2">
        <Label htmlFor="consultationFee" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Tarif de consultation (optionnel)
        </Label>
        <Input
          id="consultationFee"
          placeholder="Ex: 2000 DA - 3500 DA"
          value={formData.consultationFee}
          onChange={(e) => updateFormData({ consultationFee: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Indiquez une fourchette de prix pour aider les patients
        </p>
      </div>

      {/* Social Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Réseaux sociaux (optionnel)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Site web"
                className="pl-10"
                value={formData.socialLinks.website || ''}
                onChange={(e) => updateSocialLink('website', e.target.value)}
              />
            </div>
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Page Facebook"
                className="pl-10"
                value={formData.socialLinks.facebook || ''}
                onChange={(e) => updateSocialLink('facebook', e.target.value)}
              />
            </div>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Profil Instagram"
                className="pl-10"
                value={formData.socialLinks.instagram || ''}
                onChange={(e) => updateSocialLink('instagram', e.target.value)}
              />
            </div>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Profil LinkedIn"
                className="pl-10"
                value={formData.socialLinks.linkedin || ''}
                onChange={(e) => updateSocialLink('linkedin', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
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
