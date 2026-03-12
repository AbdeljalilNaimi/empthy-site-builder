import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DynamicProgressBar } from '@/components/provider/registration/DynamicProgressBar';
import { Step1EliteIdentity } from '@/components/provider/registration/Step1EliteIdentity';
import { Step2BasicInfo } from '@/components/provider/registration/Step2BasicInfo';
import { Step3Location } from '@/components/provider/registration/Step3Location';
import { Step4Services } from '@/components/provider/registration/Step4Services';
import { Step5MediaUpload } from '@/components/provider/registration/Step5MediaUpload';
import { Step6MirrorPreview } from '@/components/provider/registration/Step6MirrorPreview';
import { useRegistrationWizard } from '@/hooks/useRegistrationWizard';
import { useToast } from '@/hooks/use-toast';

const STEPS = [
  { number: 1, title: 'Identité', description: 'Type & Compte' },
  { number: 2, title: 'Établissement', description: 'Informations' },
  { number: 3, title: 'Localisation', description: 'Adresse & horaires' },
  { number: 4, title: 'Services', description: 'Spécialisations' },
  { number: 5, title: 'Profil', description: 'Photos (Optionnel)' },
  { number: 6, title: 'Aperçu', description: 'Publier' },
];

export default function ProviderRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    formData, 
    updateFormData, 
    currentStep,
    completedSteps,
    goToStep, 
    nextStep, 
    prevStep,
    resetForm,
    profileScore,
    lastSaved,
    isSaving,
  } = useRegistrationWizard();

  const handleSaveAndExit = () => {
    toast({
      title: "Brouillon sauvegardé",
      description: "Vous pouvez reprendre votre inscription plus tard.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Inscription Professionnel
          </h1>
          <p className="text-muted-foreground">
            Rejoignez CityHealth et connectez-vous avec des milliers de patients
          </p>
        </div>

        {/* Dynamic Progress Bar with Scoring */}
        <div className="mb-8">
          <DynamicProgressBar 
            steps={STEPS} 
            currentStep={currentStep}
            completedSteps={completedSteps}
            profileScore={profileScore}
            lastSaved={lastSaved}
            isSaving={isSaving}
            onStepClick={goToStep}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="sm" onClick={handleSaveAndExit}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder et quitter
          </Button>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur">
          <CardContent className="p-6 md:p-8">
            {currentStep === 1 && (
              <Step1EliteIdentity 
                formData={formData} 
                updateFormData={updateFormData} 
                onNext={nextStep} 
              />
            )}
            {currentStep === 2 && (
              <Step2BasicInfo 
                formData={formData} 
                updateFormData={updateFormData} 
                onNext={nextStep} 
                onPrev={prevStep} 
              />
            )}
            {currentStep === 3 && (
              <Step3Location 
                formData={formData} 
                updateFormData={updateFormData} 
                onNext={nextStep} 
                onPrev={prevStep} 
              />
            )}
            {currentStep === 4 && (
              <Step4Services 
                formData={formData} 
                updateFormData={updateFormData} 
                onNext={nextStep} 
                onPrev={prevStep} 
              />
            )}
            {currentStep === 5 && (
              <Step5MediaUpload 
                formData={formData} 
                updateFormData={updateFormData} 
                onNext={nextStep} 
                onPrev={prevStep} 
              />
            )}
            {currentStep === 6 && (
              <Step6MirrorPreview 
                formData={formData} 
                profileScore={profileScore}
                resetForm={resetForm}
                onPrev={prevStep} 
                onEditStep={goToStep} 
              />
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Besoin d'aide ? <a href="/contact" className="text-primary hover:underline">Contactez-nous</a>
        </p>
      </div>
    </div>
  );
}
