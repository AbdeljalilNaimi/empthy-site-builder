import { useState, useEffect, useRef, useCallback } from 'react';
import { toast as sonnerToast } from 'sonner';

type CelebrationType = 'halfway' | 'profile-complete' | 'documents-uploaded' | 'verified';

interface Milestones {
  halfwayComplete: boolean;
  profileComplete: boolean;
  documentsUploaded: boolean;
  verificationSubmitted: boolean;
  verified: boolean;
}

interface CelebrationState {
  currentCelebration: CelebrationType | null;
  dismissCelebration: () => void;
}

const MILESTONE_KEYS = {
  halfway: 'provider_milestone_halfway_seen',
  profile: 'provider_milestone_profile_seen',
  docs: 'provider_milestone_docs_seen',
  verified: 'provider_milestone_verified_seen',
} as const;

function getMilestoneKey(milestone: keyof typeof MILESTONE_KEYS, providerId?: string): string {
  return `${MILESTONE_KEYS[milestone]}_${providerId || 'unknown'}`;
}

function hasMilestoneSeen(milestone: keyof typeof MILESTONE_KEYS, providerId?: string): boolean {
  return localStorage.getItem(getMilestoneKey(milestone, providerId)) === 'true';
}

function markMilestoneSeen(milestone: keyof typeof MILESTONE_KEYS, providerId?: string): void {
  localStorage.setItem(getMilestoneKey(milestone, providerId), 'true');
}

export function useOnboardingCelebrations(
  milestones: Milestones | undefined,
  providerId?: string
): CelebrationState {
  const [currentCelebration, setCurrentCelebration] = useState<CelebrationType | null>(null);
  const previousMilestonesRef = useRef<Milestones | null>(null);
  const initialLoadRef = useRef(true);

  const dismissCelebration = useCallback(() => {
    setCurrentCelebration(null);
  }, []);

  useEffect(() => {
    if (!milestones || !providerId) return;

    // Skip on initial load to prevent celebrations from showing on page refresh
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      previousMilestonesRef.current = { ...milestones };
      return;
    }

    const prev = previousMilestonesRef.current;

    // Check for milestone transitions (from false to true)
    
    // 50% completion - Toast notification
    if (milestones.halfwayComplete && prev && !prev.halfwayComplete) {
      if (!hasMilestoneSeen('halfway', providerId)) {
        sonnerToast.success('🎯 Mi-parcours atteint !', {
          description: 'Vous avez complété 50% de votre profil. Continuez !',
          duration: 5000,
        });
        markMilestoneSeen('halfway', providerId);
      }
    }

    // Profile complete (6/8 steps) - Modal celebration
    if (milestones.profileComplete && prev && !prev.profileComplete) {
      if (!hasMilestoneSeen('profile', providerId)) {
        setCurrentCelebration('profile-complete');
        markMilestoneSeen('profile', providerId);
      }
    }

    // Documents uploaded - Toast notification
    if (milestones.documentsUploaded && prev && !prev.documentsUploaded) {
      if (!hasMilestoneSeen('docs', providerId)) {
        sonnerToast.success('📄 Documents envoyés !', {
          description: 'Notre équipe vérifiera vos documents sous 48h.',
          duration: 5000,
        });
        markMilestoneSeen('docs', providerId);
      }
    }

    // Verified - Modal celebration
    if (milestones.verified && prev && !prev.verified) {
      if (!hasMilestoneSeen('verified', providerId)) {
        setCurrentCelebration('verified');
        markMilestoneSeen('verified', providerId);
      }
    }

    // Update previous milestones reference
    previousMilestonesRef.current = { ...milestones };
  }, [milestones, providerId]);

  return {
    currentCelebration,
    dismissCelebration,
  };
}
