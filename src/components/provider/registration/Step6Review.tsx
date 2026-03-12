import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, Edit, Building2, MapPin, Stethoscope, Image,
  Phone, Mail, Clock, Home, Loader2, PartyPopper
} from 'lucide-react';
import { ProviderFormData, PROVIDER_TYPE_LABELS, WeeklySchedule } from './types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Step6Props {
  formData: ProviderFormData;
  onPrev: () => void;
  onEditStep: (step: number) => void;
}

const DAYS_FR: Record<keyof WeeklySchedule, string> = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mer',
  thursday: 'Jeu',
  friday: 'Ven',
  saturday: 'Sam',
  sunday: 'Dim',
};

export function Step6Review({ formData, onPrev, onEditStep }: Step6Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Save to localStorage with PENDING status and isPublic = false
    const registrations = JSON.parse(localStorage.getItem('ch_pending_registrations') || '[]');
    registrations.push({
      ...formData,
      id: `reg_${Date.now()}`,
      facilityNameFr: formData.facilityNameFr,
      facilityNameAr: formData.facilityNameAr,
      providerName: formData.facilityNameFr, // For admin dashboard compatibility
      type: formData.providerType,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      // VERIFICATION GATE: Default to pending and not public
      verificationStatus: 'pending',
      isPublic: false,
    });
    localStorage.setItem('ch_pending_registrations', JSON.stringify(registrations));

    setIsSubmitting(false);
    setIsSubmitted(true);

    toast({
      title: "Inscription envoyée !",
      description: "Votre demande sera examinée sous 24-48h.",
    });
  };

  const providerTypeLabel = formData.providerType 
    ? PROVIDER_TYPE_LABELS[formData.providerType]?.fr 
    : '';

  if (isSubmitted) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <PartyPopper className="h-10 w-10 text-green-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Félicitations ! 🎉
          </h2>
          <p className="text-lg text-muted-foreground">
            Votre demande d'inscription a été envoyée avec succès
          </p>
        </div>
        <Card className="max-w-md mx-auto text-left">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Prochaines étapes :</h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                <span>Notre équipe examine votre dossier (24-48h)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">2</span>
                <span>Vous recevez un email de confirmation</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">3</span>
                <span>Accédez à votre tableau de bord professionnel</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">4</span>
                <span>Commencez à recevoir des patients !</span>
              </li>
            </ol>
          </CardContent>
        </Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
          <Button variant="outline" onClick={() => navigate('/provider/dashboard')}>
            Accéder au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Vérifiez vos informations
        </h2>
        <p className="text-muted-foreground">
          Assurez-vous que toutes les informations sont correctes avant de soumettre
        </p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations du compte
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(1)}>
              <Edit className="h-4 w-4 mr-1" /> Modifier
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            {formData.logoPreview && (
              <img 
                src={formData.logoPreview} 
                alt="Logo" 
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="font-semibold text-lg">{formData.facilityNameFr || 'Non renseigné'}</p>
              {formData.facilityNameAr && (
                <p className="text-muted-foreground" dir="rtl">{formData.facilityNameAr}</p>
              )}
              <Badge variant="secondary" className="mt-1">{providerTypeLabel}</Badge>
            </div>
          </div>
          <Separator />
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{formData.email}</span>
              {formData.emailVerified && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{formData.phone || 'Non renseigné'}</span>
              {formData.phoneVerified && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localisation
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(3)}>
              <Edit className="h-4 w-4 mr-1" /> Modifier
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>{formData.address || 'Adresse non renseignée'}</p>
          <p className="text-muted-foreground">
            {formData.area}, {formData.city} {formData.postalCode}
          </p>
          <Separator />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {formData.is24_7 ? 'Ouvert 24h/24, 7j/7' : (
                <span className="flex flex-wrap gap-1">
                  {(Object.keys(DAYS_FR) as Array<keyof WeeklySchedule>).map(day => (
                    formData.schedule[day].isOpen && (
                      <Badge key={day} variant="outline" className="text-xs">
                        {DAYS_FR[day]}: {formData.schedule[day].openTime}-{formData.schedule[day].closeTime}
                      </Badge>
                    )
                  ))}
                </span>
              )}
            </span>
          </div>
          {formData.homeVisitAvailable && (
            <div className="flex items-center gap-2 text-sm">
              <Home className="h-4 w-4 text-primary" />
              <span>Visites à domicile disponibles</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Services & Spécialisations
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(4)}>
              <Edit className="h-4 w-4 mr-1" /> Modifier
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.serviceCategories.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Services:</p>
              <div className="flex flex-wrap gap-2">
                {formData.serviceCategories.map(s => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
          )}
          {formData.specialties.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Spécialités:</p>
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map(s => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            </div>
          )}
          {formData.languages.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Langues:</p>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map(l => (
                  <Badge key={l} variant="outline">{l.toUpperCase()}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Image className="h-5 w-5" />
              Profil
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(5)}>
              <Edit className="h-4 w-4 mr-1" /> Modifier
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">{formData.description || 'Aucune description'}</p>
          {formData.galleryPreviews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {formData.galleryPreviews.map((preview, i) => (
                <img
                  key={i}
                  src={preview}
                  alt={`Photo ${i + 1}`}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              ))}
            </div>
          )}
          {formData.insuranceAccepted.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Assurances acceptées:</p>
              <div className="flex flex-wrap gap-2">
                {formData.insuranceAccepted.map(i => (
                  <Badge key={i} variant="outline">{i}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Notice */}
      <div className="bg-muted/50 p-4 rounded-lg border">
        <p className="text-sm text-muted-foreground">
          📋 En soumettant cette demande, vous acceptez que vos informations soient vérifiées par notre équipe. 
          Le processus de validation prend généralement 24 à 48 heures. Vous recevrez un email de confirmation 
          une fois votre profil approuvé.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          Précédent
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          size="lg"
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            'Soumettre ma demande'
          )}
        </Button>
      </div>
    </div>
  );
}
