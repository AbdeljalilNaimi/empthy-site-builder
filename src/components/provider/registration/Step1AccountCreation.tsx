import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, Stethoscope, Pill, FlaskConical, Hospital,
  Mail, Lock, Eye, EyeOff, Baby, Droplet, Scan, Package,
  Sparkles, Shield, Users, Loader2
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

// Premium icons with color themes for each provider type
const PROVIDER_TYPE_CONFIG: Record<string, { 
  icon: React.ReactNode; 
  color: string; 
  bgColor: string;
  description: string;
}> = {
  hospital: { 
    icon: <Hospital className="h-7 w-7" />, 
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 border-red-500/20 hover:border-red-500/50',
    description: 'CHU, EPH, Hôpital privé'
  },
  birth_hospital: { 
    icon: <Baby className="h-7 w-7" />, 
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10 border-pink-500/20 hover:border-pink-500/50',
    description: 'Maternité, Clinique d\'accouchement'
  },
  clinic: { 
    icon: <Building2 className="h-7 w-7" />, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50',
    description: 'Polyclinique, Centre médical'
  },
  doctor: { 
    icon: <Stethoscope className="h-7 w-7" />, 
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50',
    description: 'Médecin généraliste ou spécialiste'
  },
  pharmacy: { 
    icon: <Pill className="h-7 w-7" />, 
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 border-green-500/20 hover:border-green-500/50',
    description: 'Officine, Pharmacie de garde'
  },
  lab: { 
    icon: <FlaskConical className="h-7 w-7" />, 
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50',
    description: 'Analyses médicales, Biologie'
  },
  blood_cabin: { 
    icon: <Droplet className="h-7 w-7" />, 
    color: 'text-rose-600',
    bgColor: 'bg-rose-600/10 border-rose-600/20 hover:border-rose-600/50',
    description: 'Don de sang, Transfusion'
  },
  radiology_center: { 
    icon: <Scan className="h-7 w-7" />, 
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/50',
    description: 'Scanner, IRM, Radio, Écho'
  },
  medical_equipment: { 
    icon: <Package className="h-7 w-7" />, 
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50',
    description: 'Vente & location matériel médical'
  },
};

export function Step1AccountCreation({ formData, updateFormData, onNext }: Step1Props) {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      
      // Pre-fill form data with Google account info
      updateFormData({
        email: user.email || '',
        emailVerified: true,
        acceptTerms: true,
        // Set a random secure password (user authenticated via Google)
        password: crypto.randomUUID(),
        confirmPassword: crypto.randomUUID(),
      });

      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${user.displayName || user.email}!`,
      });

      // Auto-advance to next step
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

      {/* Premium Provider Type Selection Grid */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          Sélectionnez votre type d'établissement 
          <span className="text-destructive">*</span>
        </Label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(PROVIDER_TYPE_LABELS).map(([type, labels]) => {
            const config = PROVIDER_TYPE_CONFIG[type];
            const isSelected = formData.providerType === type;
            
            return (
              <Card 
                key={type}
                className={cn(
                  "cursor-pointer transition-all duration-300 border-2",
                  "hover:shadow-lg hover:scale-[1.02]",
                  isSelected 
                    ? `ring-2 ring-primary border-primary ${config.bgColor}` 
                    : `border-border/50 ${config.bgColor}`
                )}
                onClick={() => updateFormData({ providerType: type as ProviderTypeKey })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-all",
                      isSelected ? `${config.color} bg-white/80 dark:bg-black/20 shadow-sm` : `${config.color} opacity-70`
                    )}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-semibold text-base mb-0.5 transition-colors",
                        isSelected ? "text-foreground" : "text-foreground/80"
                      )}>
                        {labels.fr}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1" dir="rtl">
                        {labels.ar}
                      </p>
                      <p className="text-xs text-muted-foreground/70 leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </CardContent>
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
          Continuer
        </Button>
        
      </div>
    </div>
  );
}
