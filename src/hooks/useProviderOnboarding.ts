import { useMemo } from 'react';
import { CityHealthProvider } from '@/data/providers';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  helpText?: string;
  isComplete: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  action: {
    label: string;
    tab?: string;
    scrollTo?: string;
  };
}

export interface OnboardingState {
  steps: OnboardingStep[];
  currentStepIndex: number;
  completedSteps: number;
  totalSteps: number;
  overallProgress: number;
  isOnboardingComplete: boolean;
  milestones: {
    halfwayComplete: boolean;
    profileComplete: boolean;
    documentsUploaded: boolean;
    verificationSubmitted: boolean;
    verified: boolean;
  };
}

export function useProviderOnboarding(
  providerData: CityHealthProvider | null,
  verificationStatus?: string
): OnboardingState {
  return useMemo(() => {
    if (!providerData) {
      return {
        steps: [],
        currentStepIndex: 0,
        completedSteps: 0,
        totalSteps: 8,
        overallProgress: 0,
        isOnboardingComplete: false,
        milestones: {
          halfwayComplete: false,
          profileComplete: false,
          documentsUploaded: false,
          verificationSubmitted: false,
          verified: false,
        },
      };
    }

    // Calculate step completions
    const hasBasicInfo = !!(
      providerData.name &&
      providerData.email &&
      providerData.phone
    );

    const hasLocation = !!(
      providerData.address &&
      providerData.city &&
      providerData.lat &&
      providerData.lng
    );

    const hasDescription = !!(
      providerData.description &&
      providerData.description.length >= 50
    );

    const hasSchedule = !!(
      providerData.schedule &&
      Object.keys(providerData.schedule).length > 0
    );

    const hasLicense = !!providerData.legalRegistrationNumber;

    const hasPhotos = !!(
      providerData.gallery &&
      providerData.gallery.length >= 1
    );

    // Check for verification documents - using a type-safe approach
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const verificationDocs = (providerData as any).verificationDocuments as unknown[] | undefined;
    const hasDocuments = !!(
      verificationDocs &&
      Array.isArray(verificationDocs) &&
      verificationDocs.length >= 2
    );

    const hasSubmittedVerification = !!(
      verificationStatus &&
      ['pending', 'verified', 'approved'].includes(verificationStatus.toLowerCase())
    );

    const isVerified = verificationStatus?.toLowerCase() === 'verified';

    // Define steps
    const steps: OnboardingStep[] = [
      {
        id: 'basic-info',
        title: 'Informations de base',
        description: 'Nom, email et téléphone de contact',
        helpText: 'Ces informations permettent aux patients de vous contacter.',
        isComplete: hasBasicInfo,
        isBlocked: false,
        action: {
          label: 'Compléter',
          tab: 'profile',
        },
      },
      {
        id: 'location',
        title: 'Localisation',
        description: 'Adresse complète de votre établissement',
        helpText: 'Votre adresse sera affichée sur la carte pour aider les patients à vous trouver.',
        isComplete: hasLocation,
        isBlocked: !hasBasicInfo,
        blockedReason: 'Complétez d\'abord les informations de base',
        action: {
          label: 'Ajouter l\'adresse',
          tab: 'profile',
        },
      },
      {
        id: 'description',
        title: 'Description professionnelle',
        description: 'Présentez votre pratique (min. 50 caractères)',
        helpText: 'Une bonne description aide les patients à choisir leur praticien.',
        isComplete: hasDescription,
        isBlocked: !hasLocation,
        blockedReason: 'Ajoutez d\'abord votre localisation',
        action: {
          label: 'Rédiger la description',
          tab: 'profile',
        },
      },
      {
        id: 'schedule',
        title: 'Horaires d\'ouverture',
        description: 'Configurez vos heures de disponibilité',
        helpText: 'Les patients verront quand vous êtes disponible.',
        isComplete: hasSchedule,
        isBlocked: !hasDescription,
        blockedReason: 'Ajoutez d\'abord une description',
        action: {
          label: 'Définir les horaires',
          tab: 'profile',
        },
      },
      {
        id: 'license',
        title: 'Licence professionnelle',
        description: 'Numéro d\'agrément ou d\'enregistrement',
        helpText: 'Requis pour la vérification de votre profil.',
        isComplete: hasLicense,
        isBlocked: !hasSchedule,
        blockedReason: 'Configurez d\'abord vos horaires',
        action: {
          label: 'Ajouter la licence',
          tab: 'profile',
        },
      },
      {
        id: 'photos',
        title: 'Photos du cabinet',
        description: 'Ajoutez au moins 1 photo de votre établissement',
        helpText: 'Les photos augmentent la confiance des patients.',
        isComplete: hasPhotos,
        isBlocked: !hasLicense,
        blockedReason: 'Ajoutez d\'abord votre licence',
        action: {
          label: 'Ajouter des photos',
          tab: 'profile',
          scrollTo: 'photo-gallery',
        },
      },
      {
        id: 'documents',
        title: 'Documents de vérification',
        description: 'Licence officielle + pièce d\'identité',
        helpText: 'Ces documents seront vérifiés par notre équipe.',
        isComplete: hasDocuments,
        isBlocked: !hasPhotos,
        blockedReason: 'Ajoutez d\'abord des photos',
        action: {
          label: 'Télécharger les documents',
          tab: 'verification',
        },
      },
      {
        id: 'submit',
        title: 'Soumettre pour vérification',
        description: 'Envoyez votre profil pour validation',
        helpText: 'Notre équipe vérifiera votre profil sous 48h.',
        isComplete: hasSubmittedVerification,
        isBlocked: !hasDocuments,
        blockedReason: 'Téléchargez d\'abord vos documents',
        action: {
          label: isVerified ? 'Vérifié ✓' : 'Soumettre',
          tab: 'verification',
        },
      },
    ];

    // Calculate current step (first incomplete, non-blocked step)
    let currentStepIndex = steps.findIndex(
      (step) => !step.isComplete && !step.isBlocked
    );
    if (currentStepIndex === -1) {
      currentStepIndex = steps.findIndex((step) => !step.isComplete);
    }
    if (currentStepIndex === -1) {
      currentStepIndex = steps.length - 1;
    }

    const completedSteps = steps.filter((step) => step.isComplete).length;
    const totalSteps = steps.length;
    const overallProgress = Math.round((completedSteps / totalSteps) * 100);

    // Milestones
    const profileStepsComplete = [
      hasBasicInfo,
      hasLocation,
      hasDescription,
      hasSchedule,
      hasLicense,
      hasPhotos,
    ].every(Boolean);

    return {
      steps,
      currentStepIndex,
      completedSteps,
      totalSteps,
      overallProgress,
      isOnboardingComplete: completedSteps === totalSteps,
      milestones: {
        halfwayComplete: completedSteps >= 4,
        profileComplete: profileStepsComplete,
        documentsUploaded: hasDocuments,
        verificationSubmitted: hasSubmittedVerification,
        verified: isVerified,
      },
    };
  }, [providerData, verificationStatus]);
}
