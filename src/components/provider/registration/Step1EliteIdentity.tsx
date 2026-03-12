import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, Stethoscope, Pill, FlaskConical, Hospital,
  Mail, Lock, Eye, EyeOff, Baby, Droplet, Scan, Package,
  Sparkles, Shield, Users, Loader2, Heart, Activity, Microscope
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProviderFormData, PROVIDER_TYPE_LABELS, ProviderTypeKey } from './types';
import { useLanguage } from '@/contexts/LanguageContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Step1Props {
  formData: ProviderFormData;
  updateFormData: (data: Partial<ProviderFormData>) => void;
  onNext: () => void;
}

// Grouped provider types for reduced cognitive load
const PROVIDER_CATEGORIES = [
  {
    id: 'care',
    title: 'Soins & Consultations',
    titleAr: 'الرعاية والاستشارات',
    icon: <Heart className="h-5 w-5" />,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/5 border-rose-500/20',
    types: ['hospital', 'clinic', 'birth_hospital', 'doctor'] as ProviderTypeKey[],
  },
  {
    id: 'diagnosis',
    title: 'Diagnostic & Analyse',
    titleAr: 'التشخيص والتحليل',
    icon: <Microscope className="h-5 w-5" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/5 border-purple-500/20',
    types: ['lab', 'radiology_center'] as ProviderTypeKey[],
  },
  {
    id: 'specialized',
    title: 'Services Spécialisés',
    titleAr: 'الخدمات المتخصصة',
    icon: <Activity className="h-5 w-5" />,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/5 border-emerald-500/20',
    types: ['pharmacy', 'blood_cabin', 'medical_equipment'] as ProviderTypeKey[],
  },
];

// Icon config for each provider type
const PROVIDER_TYPE_CONFIG: Record<string, { 
  icon: React.ReactNode; 
  color: string;
  description: string;
}> = {
  hospital: { 
    icon: <Hospital className="h-5 w-5" />, 
    color: 'text-red-500',
    description: 'CHU, EPH, Hôpital privé'
  },
  birth_hospital: { 
    icon: <Baby className="h-5 w-5" />, 
    color: 'text-pink-500',
    description: 'Maternité, Clinique d\'accouchement'
  },
  clinic: { 
    icon: <Building2 className="h-5 w-5" />, 
    color: 'text-blue-500',
    description: 'Polyclinique, Centre médical'
  },
  doctor: { 
    icon: <Stethoscope className="h-5 w-5" />, 
    color: 'text-emerald-500',
    description: 'Médecin généraliste ou spécialiste'
  },
  pharmacy: { 
    icon: <Pill className="h-5 w-5" />, 
    color: 'text-green-500',
    description: 'Officine, Pharmacie de garde'
  },
  lab: { 
    icon: <FlaskConical className="h-5 w-5" />, 
    color: 'text-purple-500',
    description: 'Analyses médicales, Biologie'
  },
  blood_cabin: { 
    icon: <Droplet className="h-5 w-5" />, 
    color: 'text-rose-600',
    description: 'Don de sang, Transfusion'
  },
  radiology_center: { 
    icon: <Scan className="h-5 w-5" />, 
    color: 'text-cyan-500',
    description: 'Scanner, IRM, Radio, Écho'
  },
  medical_equipment: { 
    icon: <Package className="h-5 w-5" />, 
    color: 'text-amber-500',
    description: 'Vente & location matériel médical'
  },
};

export function Step1EliteIdentity({ formData, updateFormData, onNext }: Step1Props) {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.providerType) {
      newErrors.providerType = 'Veuillez sélectionner un type d\'établissement';
    }
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleGoogleSignIn = async () => {
    if (!formData.providerType) {
      setErrors({ providerType: 'Veuillez sélectionner un type d\'établissement' });
      toast({
        title: "Sélection requise",
        description: "Veuillez d'abord sélectionner votre type d'établissement",
        variant: "destructive",
      });
      return;
    }

    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      updateFormData({
        email: user.email || '',
        emailVerified: true,
        acceptTerms: true,
        password: crypto.randomUUID(),
        confirmPassword: crypto.randomUUID(),
      });

      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${user.displayName || user.email}!`,
      });

      onNext();
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Impossible de se connecter avec Google",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleTypeSelect = (type: ProviderTypeKey, categoryId: string) => {
    updateFormData({ 
      providerType: type,
      providerCategory: categoryId as ProviderFormData['providerCategory'],
    });
    setErrors(prev => ({ ...prev, providerType: '' }));
  };

  // Find which category the selected type belongs to
  const getSelectedCategory = () => {
    if (!formData.providerType) return null;
    return PROVIDER_CATEGORIES.find(cat => cat.types.includes(formData.providerType as ProviderTypeKey));
  };

  return (
    <div className="space-y-8">
      {/* Premium Welcome Message */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Bienvenue sur CityHealth Pro
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Rejoignez notre réseau de professionnels de santé et développez votre visibilité auprès de milliers de patients
        </p>
        
        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Données sécurisées</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-blue-500" />
            <span>+15,000 patients</span>
          </div>
        </div>
      </div>

      {/* Grouped Provider Type Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          Choisissez votre catégorie 
          <span className="text-destructive">*</span>
        </Label>
        
        <div className="space-y-4">
          {PROVIDER_CATEGORIES.map((category) => {
            const isExpanded = expandedCategory === category.id || getSelectedCategory()?.id === category.id;
            const hasSelectedType = category.types.includes(formData.providerType as ProviderTypeKey);

            return (
              <Card 
                key={category.id}
                className={cn(
                  "transition-all duration-300 overflow-hidden",
                  category.bgColor,
                  hasSelectedType && "ring-2 ring-primary"
                )}
              >
                {/* Category Header */}
                <CardHeader 
                  className="cursor-pointer py-4"
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg bg-background/50", category.color)}>
                        {category.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{category.title}</CardTitle>
                        <p className="text-sm text-muted-foreground" dir="rtl">{category.titleAr}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasSelectedType && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <svg 
                        className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform",
                          isExpanded && "rotate-180"
                        )} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Types */}
                {isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {category.types.map((type) => {
                        const config = PROVIDER_TYPE_CONFIG[type];
                        const labels = PROVIDER_TYPE_LABELS[type];
                        const isSelected = formData.providerType === type;

                        return (
                          <div
                            key={type}
                            onClick={() => handleTypeSelect(type, category.id)}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border-2",
                              isSelected 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "border-transparent bg-background/50 hover:bg-background/80 hover:border-border"
                            )}
                          >
                            <div className={cn("p-2 rounded-lg bg-muted", config.color)}>
                              {config.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{labels.fr}</p>
                              <p className="text-xs text-muted-foreground truncate">{config.description}</p>
                            </div>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
        
        {errors.providerType && (
          <p className="text-sm text-destructive">{errors.providerType}</p>
        )}
      </div>

      <Separator />

      {/* Email & Password */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            Email professionnel <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
              isRTL ? "right-3" : "left-3"
            )} />
            <Input
              id="email"
              type="email"
              placeholder="contact@votre-etablissement.dz"
              className={cn(
                isRTL ? "pr-10" : "pl-10",
                errors.email && "border-destructive"
              )}
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              Mot de passe <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                isRTL ? "right-3" : "left-3"
              )} />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 caractères"
                className={cn(
                  isRTL ? "pr-10 pl-10" : "pl-10 pr-10",
                  errors.password && "border-destructive"
                )}
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                  isRTL ? "left-3" : "right-3"
                )}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirmer le mot de passe <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                isRTL ? "right-3" : "left-3"
              )} />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Retapez votre mot de passe"
                className={cn(
                  isRTL ? "pr-10 pl-10" : "pl-10 pr-10",
                  errors.confirmPassword && "border-destructive"
                )}
                value={formData.confirmPassword}
                onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                  isRTL ? "left-3" : "right-3"
                )}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>
        </div>
      </div>

      <Separator />

      {/* Terms */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms"
          checked={formData.acceptTerms}
          onCheckedChange={(checked) => updateFormData({ acceptTerms: !!checked })}
          className={errors.acceptTerms ? "border-destructive" : ""}
        />
        <div className="space-y-1">
          <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
            J'accepte les{' '}
            <a href="/terms" className="text-primary hover:underline font-medium">
              Conditions d'utilisation
            </a>{' '}
            et la{' '}
            <a href="/privacy" className="text-primary hover:underline font-medium">
              Politique de confidentialité
            </a>
          </Label>
          {errors.acceptTerms && (
            <p className="text-sm text-destructive">{errors.acceptTerms}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="space-y-3">
        <Button onClick={handleSubmit} size="lg" className="w-full">
          Créer mon compte
        </Button>
        
      </div>
    </div>
  );
}
