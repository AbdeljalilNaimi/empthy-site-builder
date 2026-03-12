/**
 * Provider type constants to eliminate magic strings across the codebase
 */
export const PROVIDER_TYPES = {
  HOSPITAL: 'hospital',
  CLINIC: 'clinic',
  DOCTOR: 'doctor',
  PHARMACY: 'pharmacy',
  LAB: 'lab',
  RADIOLOGY_CENTER: 'radiology_center',
  DENTIST: 'dentist',
  BLOOD_CABIN: 'blood_cabin',
} as const;

export type ProviderTypeKey = keyof typeof PROVIDER_TYPES;
export type ProviderTypeValue = typeof PROVIDER_TYPES[ProviderTypeKey];

// All valid provider types as an array
export const ALL_PROVIDER_TYPES = Object.values(PROVIDER_TYPES);

// Provider types that can be filtered in the map
export const FILTERABLE_PROVIDER_TYPES = [
  PROVIDER_TYPES.HOSPITAL,
  PROVIDER_TYPES.CLINIC,
  PROVIDER_TYPES.DOCTOR,
  PROVIDER_TYPES.PHARMACY,
  PROVIDER_TYPES.LAB,
  PROVIDER_TYPES.RADIOLOGY_CENTER,
] as const;

// Emergency-related provider types
export const EMERGENCY_PROVIDER_TYPES = [
  PROVIDER_TYPES.HOSPITAL,
] as const;

// Blood donation provider types
export const BLOOD_PROVIDER_TYPES = [
  PROVIDER_TYPES.HOSPITAL,
  PROVIDER_TYPES.BLOOD_CABIN,
] as const;

// Provider types allowed to create/manage offers
export const OFFER_ALLOWED_PROVIDER_TYPES = [
  PROVIDER_TYPES.DOCTOR,
  PROVIDER_TYPES.PHARMACY,
] as const;
