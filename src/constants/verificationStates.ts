// Single-source verification state constants
// Used by verificationService, firestoreProviderService, and Firestore rules alignment

export const VERIFICATION_STATES = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export type VerificationStatusValue = typeof VERIFICATION_STATES[keyof typeof VERIFICATION_STATES];

// Canonical field set for each state transition
// Every service that changes verification status MUST use these objects
export const VERIFICATION_TRANSITIONS = {
  approve: {
    verificationStatus: VERIFICATION_STATES.VERIFIED,
    isPublic: true,
    verified: true,
  },
  reject: {
    verificationStatus: VERIFICATION_STATES.REJECTED,
    isPublic: false,
    verified: false,
  },
  revoke: {
    verificationStatus: VERIFICATION_STATES.PENDING,
    isPublic: false,
    verified: false,
  },
} as const;
