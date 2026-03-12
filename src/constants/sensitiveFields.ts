/**
 * Sensitive vs Non-Sensitive Provider Fields
 * 
 * This defines which provider fields require re-verification when modified.
 * Any change to a sensitive field will automatically revoke verification status.
 */

// Fields that require re-verification when modified
export const SENSITIVE_PROVIDER_FIELDS = [
  // Identity & Legal
  'name',
  'facilityNameFr',
  'facilityNameAr',
  'type',
  'providerType',
  
  // Legal Registration
  'legalRegistrationNumber',
  'registrationAuthority',
  
  // Location (physical presence)
  'address',
  'city',
  'area',
  'postalCode',
  'lat',
  'lng',
  
  // Contact (official)
  'phone',
  'email',
  
  // Legal Representatives
  'contactPersonName',
  'contactPersonRole',
  'legalRepresentative',
  
  // Verification Documents
  'verificationDocuments',
] as const;

// Fields that can be edited freely without impacting verification
export const NON_SENSITIVE_PROVIDER_FIELDS = [
  // Profile Content
  'description',
  'services',
  'specialties',
  'specialty', // Legacy single specialty
  
  // Operating Hours
  'schedule',
  
  // Features & Accessibility
  'accessibilityFeatures',
  'accessible',
  'homeVisitAvailable',
  'emergency',
  
  // Media
  'gallery',
  'image',
  
  // Social & Web
  'socialLinks',
  'website',
  
  // Business Details
  'insuranceAccepted',
  'insurances',
  'consultationFee',
  'languages',
  'departments',
  'keywords',
  'equipment',
  
  // Type-specific (blood/radiology)
  'imagingTypes',
  'bloodTypes',
  'stockStatus',
  'urgentNeed',
  
  // Product categories (medical equipment)
  'productCategories',
  'offersRental',
  'offersDelivery',
] as const;

export type SensitiveField = typeof SENSITIVE_PROVIDER_FIELDS[number];
export type NonSensitiveField = typeof NON_SENSITIVE_PROVIDER_FIELDS[number];

/**
 * Check if a field is sensitive (requires re-verification)
 */
export function isSensitiveField(field: string): boolean {
  return SENSITIVE_PROVIDER_FIELDS.includes(field as SensitiveField);
}

/**
 * Check if a field is non-sensitive (can be edited freely)
 */
export function isNonSensitiveField(field: string): boolean {
  return NON_SENSITIVE_PROVIDER_FIELDS.includes(field as NonSensitiveField);
}

/**
 * Get all sensitive fields from an object of updates
 */
export function getSensitiveFieldsModified(updates: Record<string, unknown>): string[] {
  return Object.keys(updates).filter(key => isSensitiveField(key));
}

/**
 * Human-readable labels for sensitive fields (French)
 */
export const SENSITIVE_FIELD_LABELS: Record<SensitiveField, string> = {
  name: "Nom de l'établissement",
  facilityNameFr: "Nom (français)",
  facilityNameAr: "Nom (arabe)",
  type: "Type d'établissement",
  providerType: "Type de prestataire",
  legalRegistrationNumber: "Numéro d'inscription légale",
  registrationAuthority: "Autorité d'enregistrement",
  address: "Adresse",
  city: "Ville",
  area: "Quartier",
  postalCode: "Code postal",
  lat: "Latitude GPS",
  lng: "Longitude GPS",
  phone: "Téléphone",
  email: "Email officiel",
  contactPersonName: "Nom du contact",
  contactPersonRole: "Fonction du contact",
  legalRepresentative: "Représentant légal",
  verificationDocuments: "Documents de vérification",
};
