/**
 * Provider Data Validation Utilities
 * 
 * Pre-write validation to ensure data integrity between
 * registration and profile management.
 */

import { ProviderDocument, LEGACY_FIELD_MAPPING } from '@/types/provider';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Required fields for a valid provider document
 */
const REQUIRED_FIELDS: (keyof ProviderDocument)[] = [
  'id',
  'userId',
  'name',
  'type',
  'email',
  'phone',
  'address',
  'city',
  'lat',
  'lng',
  'verificationStatus',
  'isPublic',
];

/**
 * Validate provider data before writing to Firestore
 * Ensures all required fields are present and warns about deprecated field usage
 */
export function validateProviderData(
  data: Partial<ProviderDocument>,
  isFullDocument = false
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields only for full document validation
  if (isFullDocument) {
    for (const field of REQUIRED_FIELDS) {
      const value = data[field];
      if (value === undefined || value === null || value === '') {
        errors.push(`Champ requis manquant: ${field}`);
      }
    }

    // Validate specific field formats
    if (data.email && !isValidEmail(data.email)) {
      errors.push('Format email invalide');
    }

    if (data.phone && data.phone.length < 8) {
      errors.push('Numéro de téléphone trop court (min 8 caractères)');
    }

    if (data.name && data.name.length < 2) {
      errors.push('Nom trop court (min 2 caractères)');
    }

    if (data.address && data.address.length < 5) {
      errors.push('Adresse trop courte (min 5 caractères)');
    }

    // Validate coordinates
    if (data.lat !== undefined && (data.lat < -90 || data.lat > 90)) {
      errors.push('Latitude invalide (doit être entre -90 et 90)');
    }

    if (data.lng !== undefined && (data.lng < -180 || data.lng > 180)) {
      errors.push('Longitude invalide (doit être entre -180 et 180)');
    }
  }

  // Check for deprecated field usage (for any update)
  const deprecatedFields = Object.keys(LEGACY_FIELD_MAPPING);
  for (const field of deprecatedFields) {
    if (field in data) {
      const canonicalName = LEGACY_FIELD_MAPPING[field];
      warnings.push(
        `Champ déprécié "${field}" utilisé. Utiliser "${canonicalName}" à la place.`
      );
    }
  }

  // Warn about potential data issues
  if (data.gallery && !Array.isArray(data.gallery)) {
    warnings.push('Le champ "gallery" devrait être un tableau');
  }

  if (data.services && !Array.isArray(data.services)) {
    warnings.push('Le champ "services" devrait être un tableau');
  }

  if (data.insurances && !Array.isArray(data.insurances)) {
    warnings.push('Le champ "insurances" devrait être un tableau');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate an update payload to ensure it won't cause data loss
 */
export function validateProviderUpdate(
  updates: Partial<ProviderDocument>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for null/undefined values that might overwrite existing data
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) {
      // Don't include undefined values in updates
      warnings.push(`Champ "${key}" est undefined et sera ignoré`);
    }
  }

  // Check for deprecated field usage
  const deprecatedFields = Object.keys(LEGACY_FIELD_MAPPING);
  for (const field of deprecatedFields) {
    if (field in updates) {
      const canonicalName = LEGACY_FIELD_MAPPING[field];
      warnings.push(
        `Champ déprécié "${field}" détecté. Utiliser "${canonicalName}" à la place.`
      );
    }
  }

  // Validate specific field formats if they're being updated
  if (updates.email !== undefined && updates.email !== null) {
    if (!isValidEmail(updates.email)) {
      errors.push('Format email invalide');
    }
  }

  if (updates.phone !== undefined && updates.phone !== null) {
    if (updates.phone.length < 8) {
      errors.push('Numéro de téléphone trop court');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Clean update payload by removing undefined values and converting deprecated field names
 */
export function cleanProviderUpdate(
  updates: Record<string, unknown>
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    // Skip undefined values
    if (value === undefined) {
      continue;
    }

    // Convert deprecated field names to canonical names
    const canonicalKey = LEGACY_FIELD_MAPPING[key] || key;
    cleaned[canonicalKey] = value;
  }

  return cleaned;
}

/**
 * Merge legacy field values during read operations
 * Ensures backward compatibility with existing Firestore documents
 * Returns a properly typed Record for Firestore data
 */
export function mergeLegacyFields(
  docData: Record<string, unknown>
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...docData };

  // gallery: prefer 'gallery', fallback to 'galleryImages'
  if (!merged.gallery && merged.galleryImages) {
    merged.gallery = merged.galleryImages;
  }

  // services: prefer 'services', fallback to 'serviceCategories'
  if (!merged.services && merged.serviceCategories) {
    merged.services = merged.serviceCategories;
  }

  // insurances: prefer 'insurances', fallback to 'insuranceAccepted'
  if (!merged.insurances && merged.insuranceAccepted) {
    merged.insurances = merged.insuranceAccepted;
  }

  // facilityNameFr: prefer 'facilityNameFr', fallback to 'nameFr'
  if (!merged.facilityNameFr && merged.nameFr) {
    merged.facilityNameFr = merged.nameFr;
  }

  // facilityNameAr: prefer 'facilityNameAr', fallback to 'nameAr'
  if (!merged.facilityNameAr && merged.nameAr) {
    merged.facilityNameAr = merged.nameAr;
  }

  // reviewsCount: prefer 'reviewsCount', fallback to 'reviewCount' (singular)
  if (!merged.reviewsCount && merged.reviewCount) {
    merged.reviewsCount = merged.reviewCount;
  }

  return merged;
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Log validation warnings in development
 */
export function logValidationWarnings(result: ValidationResult): void {
  if (process.env.NODE_ENV === 'development') {
    result.warnings.forEach((warning) => {
      console.warn('[ProviderValidation]', warning);
    });
    result.errors.forEach((error) => {
      console.error('[ProviderValidation]', error);
    });
  }
}
