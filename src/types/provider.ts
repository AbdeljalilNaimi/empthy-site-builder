/**
 * Canonical Provider Schema
 * 
 * SINGLE SOURCE OF TRUTH for all provider data structures.
 * Used by: Registration, Profile Management, Firestore operations
 * 
 * Field naming conventions:
 * - gallery (not galleryImages)
 * - services (not serviceCategories)
 * - insurances (not insuranceAccepted)
 * - schedule uses French day names for Algeria context (lundi, mardi, etc.)
 */

import { z } from 'zod';

// ================== ENUMS & CONSTANTS ==================

export const PROVIDER_TYPES = [
  'doctor',
  'clinic',
  'pharmacy',
  'lab',
  'hospital',
  'birth_hospital',
  'blood_cabin',
  'radiology_center',
  'medical_equipment',
] as const;

export type ProviderType = (typeof PROVIDER_TYPES)[number];

export const VERIFICATION_STATUSES = ['pending', 'verified', 'rejected'] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const SUPPORTED_LANGUAGES = ['fr', 'ar', 'en', 'amazigh'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const STOCK_STATUSES = ['critical', 'low', 'normal', 'high'] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

// ================== SUB-INTERFACES ==================

export interface DaySchedule {
  open: string;
  close: string;
  closed?: boolean;
}

// Schedule uses French day names for Algeria context
export interface WeeklySchedule {
  lundi?: DaySchedule;
  mardi?: DaySchedule;
  mercredi?: DaySchedule;
  jeudi?: DaySchedule;
  vendredi?: DaySchedule;
  samedi?: DaySchedule;
  dimanche?: DaySchedule;
}

export interface SocialLinks {
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}

export interface ProviderSettings {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  appointmentReminders?: boolean;
  marketingEmails?: boolean;
  showPhoneOnProfile?: boolean;
  showEmailOnProfile?: boolean;
  allowReviews?: boolean;
  language?: string;
}

export interface ProviderReview {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ================== CANONICAL PROVIDER INTERFACE ==================

/**
 * ProviderDocument - THE canonical interface for all provider data.
 * 
 * This interface is used for:
 * - Firestore documents
 * - Registration form data mapping
 * - Profile editing
 * - Public display
 */
export interface ProviderDocument {
  // =============== IDENTITY (Sensitive) ===============
  id: string;
  userId: string;
  
  /** Primary display name */
  name: string;
  /** French facility name */
  facilityNameFr?: string;
  /** Arabic facility name */
  facilityNameAr?: string;
  
  /** Provider type (mapped for display) */
  type: ProviderType;
  /** Original registration provider type key */
  providerType?: string;
  /** Parent category: care, diagnosis, or specialized */
  providerCategory?: 'care' | 'diagnosis' | 'specialized';
  /** Flexible key-value store for category-specific data */
  specificFeatures?: Record<string, any>;
  
  // =============== CONTACT (Sensitive) ===============
  email: string;
  phone: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  legalRegistrationNumber?: string;
  
  // =============== LOCATION (Sensitive) ===============
  address: string;
  city: string;
  area?: string;
  postalCode?: string;
  lat: number;
  lng: number;
  
  // =============== SCHEDULE (Non-sensitive) ===============
  /** Weekly schedule with French day names */
  schedule?: WeeklySchedule | null;
  is24_7?: boolean;
  homeVisitAvailable?: boolean;
  
  // =============== SERVICES (Non-sensitive) ===============
  /** Service categories - CANONICAL NAME (not serviceCategories) */
  services?: string[];
  specialties?: string[];
  /** Legacy single specialty field */
  specialty?: string;
  departments?: string[];
  equipment?: string[];
  accessibilityFeatures?: string[];
  languages?: SupportedLanguage[];
  
  // =============== PROFILE (Non-sensitive) ===============
  description?: string;
  /** Primary logo/photo URL */
  image?: string;
  /** Gallery images - CANONICAL NAME (not galleryImages) */
  gallery?: string[];
  /** Accepted insurances - CANONICAL NAME (not insuranceAccepted) */
  insurances?: string[];
  /** Consultation fee (stored as string for flexibility) */
  consultationFee?: string | number | null;
  socialLinks?: SocialLinks | null;
  
  // =============== TYPE-SPECIFIC FIELDS ===============
  // Blood cabin
  bloodTypes?: string[];
  urgentNeed?: boolean;
  stockStatus?: StockStatus;
  bloodStockLevels?: Record<string, string>;
  urgentBloodType?: string;
  bloodCabinWalkInAllowed?: boolean;
  donationCampaigns?: Array<{ id: string; title: string; date: string; location: string; description: string }>;
  mobileDonationUnits?: Array<{ id: string; name: string; schedule: string; area: string }>;
  donationPreparationGuidelines?: string;
  minDaysBetweenDonations?: number | null;
  totalDonationsReceived?: number | null;
  
  // Care (Soins & Consultations)
  emergencyCapable?: boolean;
  consultationTypes?: string[];
  numberOfBeds?: number | null;
  hasReanimation?: boolean;
  operatingBlocks?: number | null;
  
  // Diagnosis (Laboratoire, Radiologie)
  analysisTypes?: string[];
  homeCollection?: boolean;
  onlineResults?: boolean;
  turnaroundHours?: number | null;
  imagingTypes?: string[];
  
  // Pharmacy
  isPharmacieDeGarde?: boolean;
  pharmacyServices?: string[];
  pharmacyDeliveryAvailable?: boolean;
  pharmacyDeliveryZone?: string;
  pharmacyDeliveryFee?: string;
  pharmacyDeliveryHours?: string;
  pharmacyDutyPhone?: string;
  pharmacyNightBell?: boolean;
  pharmacyGardeSchedule?: Array<{ id: string; startDate: string; endDate: string; note: string }>;
  pharmacyStockInfo?: string;
  
  // Medical equipment
  productCategories?: string[];
  rentalAvailable?: boolean;
  deliveryAvailable?: boolean;
  equipmentBusinessTypes?: string[];
  installationAvailable?: boolean;
  catalogPdfUrl?: string;
  equipmentCatalog?: Array<{ id: string; name: string; category: string; salePrice: number | null; rentalPricePerDay: number | null; availableFor: string; prescriptionRequired: boolean; cnasReimbursable: boolean; stockStatus: string; brand: string }>;
  equipmentBrands?: string[];
  maintenanceServiceAvailable?: boolean;
  technicalSupportAvailable?: boolean;
  technicalSupportPhone?: string;
  equipmentDeliveryZone?: string;
  equipmentDeliveryFee?: string;

  // Lab enhanced
  labTestCatalog?: Array<{ id: string; name: string; category: string; priceMin: number | null; priceMax: number | null; turnaround: string; prescriptionRequired: boolean; fastingRequired: boolean; cnasCovered: boolean }>;
  labResultDeliveryMethods?: string[];
  labAppointmentRequired?: boolean;
  labAccreditations?: string[];
  labFastingInfoNote?: string;
  homeCollectionZone?: string;
  homeCollectionFee?: string;

  // Radiology enhanced
  radiologyExamCatalog?: Array<{ id: string; name: string; imagingType: string; priceMin: number | null; priceMax: number | null; turnaround: string; prescriptionRequired: boolean; preparationInstructions: string; cnasCovered: boolean }>;
  radiologyResultDeliveryMethods?: string[];
  radiologyAppointmentRequired?: boolean;
  radiologyAccreditations?: string[];
  radiologistOnSite?: boolean;

  // Maternity-specific
  maternityEmergencyPhone?: string;
  deliveryRooms?: number | null;
  maternityServices?: string[];
  femaleStaffOnly?: boolean;
  pediatricianOnSite?: boolean;
  visitingHoursPolicy?: string;
  hasNICU?: boolean;

  // Clinic-specific
  consultationRooms?: number | null;
  surgeriesOffered?: string[];
  doctorRoster?: Array<{ name: string; specialty: string }>;
  paymentMethods?: string[];
  parkingAvailable?: boolean;

  // Doctor-specific
  medicalSchool?: string;
  graduationYear?: number | null;
  yearsOfExperience?: number | null;
  secondarySpecialty?: string;
  homeVisitZone?: string;
  teleconsultationPlatform?: string;
  ordreMedecinsNumber?: string;
  trainedAbroad?: boolean;
  trainingCountry?: string;
  womenOnlyPractice?: boolean;
  patientTypes?: string[];

  // Hospital-specific
  ambulancePhone?: string;
  receptionPhone?: string;
  adminPhone?: string;
  waitTimeMinutes?: number | null;
  waitTimeUpdatedAt?: string | null;
  departmentSchedules?: Record<string, { open: string; close: string }>;
  landmarkDescription?: string;
  
  // =============== PLAN TYPE ===============
  planType?: 'basic' | 'standard' | 'premium';

  // =============== STATUS & VERIFICATION ===============
  verificationStatus: VerificationStatus;
  isPublic: boolean;
  /** Deprecated: use verificationStatus === 'verified' */
  verified?: boolean;
  
  // Revocation tracking
  verificationRevokedAt?: Date | string;
  verificationRevokedReason?: string;
  
  // =============== COMPUTED/DISPLAY FIELDS ===============
  rating?: number;
  reviewsCount?: number;
  accessible?: boolean;
  emergency?: boolean;
  isOpen?: boolean;
  distance?: number;
  reviews?: ProviderReview[];
  
  // =============== ACCOUNT SETTINGS ===============
  settings?: ProviderSettings;
  
  // =============== METADATA ===============
  createdAt?: Date | { seconds: number; nanoseconds: number };
  updatedAt?: Date | { seconds: number; nanoseconds: number };
  submittedAt?: Date | { seconds: number; nanoseconds: number };
}

// ================== ZOD VALIDATION SCHEMAS ==================

const DayScheduleSchema = z.object({
  open: z.string(),
  close: z.string(),
  closed: z.boolean().optional(),
});

const WeeklyScheduleSchema = z.object({
  lundi: DayScheduleSchema.optional(),
  mardi: DayScheduleSchema.optional(),
  mercredi: DayScheduleSchema.optional(),
  jeudi: DayScheduleSchema.optional(),
  vendredi: DayScheduleSchema.optional(),
  samedi: DayScheduleSchema.optional(),
  dimanche: DayScheduleSchema.optional(),
}).nullable();

const SocialLinksSchema = z.object({
  website: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
}).nullable();

/**
 * Zod schema for validating provider data before writes
 */
export const ProviderDocumentSchema = z.object({
  // Required fields
  id: z.string().min(1, 'ID requis'),
  userId: z.string().min(1, 'User ID requis'),
  name: z.string().min(2, 'Nom requis (min 2 caractères)'),
  type: z.enum(PROVIDER_TYPES),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Téléphone requis (min 8 caractères)'),
  address: z.string().min(5, 'Adresse requise (min 5 caractères)'),
  city: z.string().min(2, 'Ville requise'),
  lat: z.number(),
  lng: z.number(),
  verificationStatus: z.enum(VERIFICATION_STATUSES),
  isPublic: z.boolean(),
  
  // Optional fields
  facilityNameFr: z.string().optional(),
  facilityNameAr: z.string().optional(),
  providerType: z.string().optional(),
  providerCategory: z.enum(['care', 'diagnosis', 'specialized']).optional(),
  specificFeatures: z.record(z.any()).optional(),
  contactPersonName: z.string().optional(),
  contactPersonRole: z.string().optional(),
  legalRegistrationNumber: z.string().optional(),
  area: z.string().optional(),
  postalCode: z.string().optional(),
  schedule: WeeklyScheduleSchema.optional(),
  is24_7: z.boolean().optional(),
  homeVisitAvailable: z.boolean().optional(),
  services: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  specialty: z.string().optional(),
  departments: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  accessibilityFeatures: z.array(z.string()).optional(),
  languages: z.array(z.enum(SUPPORTED_LANGUAGES)).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  insurances: z.array(z.string()).optional(),
  consultationFee: z.union([z.string(), z.number(), z.null()]).optional(),
  socialLinks: SocialLinksSchema.optional(),
  bloodTypes: z.array(z.string()).optional(),
  urgentNeed: z.boolean().optional(),
  stockStatus: z.enum(STOCK_STATUSES).optional(),
  imagingTypes: z.array(z.string()).optional(),
  productCategories: z.array(z.string()).optional(),
  rentalAvailable: z.boolean().optional(),
  deliveryAvailable: z.boolean().optional(),
  verified: z.boolean().optional(),
  rating: z.number().optional(),
  reviewsCount: z.number().optional(),
  accessible: z.boolean().optional(),
  emergency: z.boolean().optional(),
  // Category-specific fields
  emergencyCapable: z.boolean().optional(),
  consultationTypes: z.array(z.string()).optional(),
  numberOfBeds: z.union([z.number(), z.null()]).optional(),
  hasReanimation: z.boolean().optional(),
  operatingBlocks: z.union([z.number(), z.null()]).optional(),
  analysisTypes: z.array(z.string()).optional(),
  homeCollection: z.boolean().optional(),
  onlineResults: z.boolean().optional(),
  turnaroundHours: z.union([z.number(), z.null()]).optional(),
  isPharmacieDeGarde: z.boolean().optional(),
  pharmacyServices: z.array(z.string()).optional(),
  pharmacyDeliveryAvailable: z.boolean().optional(),
  pharmacyDeliveryZone: z.string().optional(),
  pharmacyDeliveryFee: z.string().optional(),
  pharmacyDeliveryHours: z.string().optional(),
  pharmacyDutyPhone: z.string().optional(),
  pharmacyNightBell: z.boolean().optional(),
  pharmacyGardeSchedule: z.array(z.object({ id: z.string(), startDate: z.string(), endDate: z.string(), note: z.string() })).optional(),
  pharmacyStockInfo: z.string().optional(),
  bloodStockLevels: z.record(z.string()).optional(),
  urgentBloodType: z.string().optional(),
  bloodCabinWalkInAllowed: z.boolean().optional(),
  donationCampaigns: z.array(z.object({ id: z.string(), title: z.string(), date: z.string(), location: z.string(), description: z.string() })).optional(),
  mobileDonationUnits: z.array(z.object({ id: z.string(), name: z.string(), schedule: z.string(), area: z.string() })).optional(),
  donationPreparationGuidelines: z.string().optional(),
  minDaysBetweenDonations: z.union([z.number(), z.null()]).optional(),
  totalDonationsReceived: z.union([z.number(), z.null()]).optional(),
  equipmentBusinessTypes: z.array(z.string()).optional(),
  installationAvailable: z.boolean().optional(),
  catalogPdfUrl: z.string().optional(),
  equipmentCatalog: z.array(z.object({ id: z.string(), name: z.string(), category: z.string(), salePrice: z.union([z.number(), z.null()]), rentalPricePerDay: z.union([z.number(), z.null()]), availableFor: z.string(), prescriptionRequired: z.boolean(), cnasReimbursable: z.boolean(), stockStatus: z.string(), brand: z.string() })).optional(),
  equipmentBrands: z.array(z.string()).optional(),
  maintenanceServiceAvailable: z.boolean().optional(),
  technicalSupportAvailable: z.boolean().optional(),
  technicalSupportPhone: z.string().optional(),
  equipmentDeliveryZone: z.string().optional(),
  equipmentDeliveryFee: z.string().optional(),
  // Lab enhanced
  labTestCatalog: z.array(z.object({ id: z.string(), name: z.string(), category: z.string(), priceMin: z.union([z.number(), z.null()]), priceMax: z.union([z.number(), z.null()]), turnaround: z.string(), prescriptionRequired: z.boolean(), fastingRequired: z.boolean(), cnasCovered: z.boolean() })).optional(),
  labResultDeliveryMethods: z.array(z.string()).optional(),
  labAppointmentRequired: z.boolean().optional(),
  labAccreditations: z.array(z.string()).optional(),
  labFastingInfoNote: z.string().optional(),
  homeCollectionZone: z.string().optional(),
  homeCollectionFee: z.string().optional(),
  // Radiology enhanced
  radiologyExamCatalog: z.array(z.object({ id: z.string(), name: z.string(), imagingType: z.string(), priceMin: z.union([z.number(), z.null()]), priceMax: z.union([z.number(), z.null()]), turnaround: z.string(), prescriptionRequired: z.boolean(), preparationInstructions: z.string(), cnasCovered: z.boolean() })).optional(),
  radiologyResultDeliveryMethods: z.array(z.string()).optional(),
  radiologyAppointmentRequired: z.boolean().optional(),
  radiologyAccreditations: z.array(z.string()).optional(),
  radiologistOnSite: z.boolean().optional(),
  // Maternity-specific
  maternityEmergencyPhone: z.string().optional(),
  deliveryRooms: z.union([z.number(), z.null()]).optional(),
  maternityServices: z.array(z.string()).optional(),
  femaleStaffOnly: z.boolean().optional(),
  pediatricianOnSite: z.boolean().optional(),
  visitingHoursPolicy: z.string().optional(),
  hasNICU: z.boolean().optional(),
  // Clinic-specific
  consultationRooms: z.union([z.number(), z.null()]).optional(),
  surgeriesOffered: z.array(z.string()).optional(),
  doctorRoster: z.array(z.object({ name: z.string(), specialty: z.string() })).optional(),
  paymentMethods: z.array(z.string()).optional(),
  parkingAvailable: z.boolean().optional(),
  // Doctor-specific
  medicalSchool: z.string().optional(),
  graduationYear: z.union([z.number(), z.null()]).optional(),
  yearsOfExperience: z.union([z.number(), z.null()]).optional(),
  secondarySpecialty: z.string().optional(),
  homeVisitZone: z.string().optional(),
  teleconsultationPlatform: z.string().optional(),
  ordreMedecinsNumber: z.string().optional(),
  trainedAbroad: z.boolean().optional(),
  trainingCountry: z.string().optional(),
  womenOnlyPractice: z.boolean().optional(),
  patientTypes: z.array(z.string()).optional(),
  // Hospital-specific
  ambulancePhone: z.string().optional(),
  receptionPhone: z.string().optional(),
  adminPhone: z.string().optional(),
  waitTimeMinutes: z.union([z.number(), z.null()]).optional(),
  waitTimeUpdatedAt: z.union([z.string(), z.null()]).optional(),
  departmentSchedules: z.record(z.object({ open: z.string(), close: z.string() })).optional(),
  landmarkDescription: z.string().optional(),
});

/**
 * Partial schema for updates (all fields optional except those being validated)
 */
export const ProviderUpdateSchema = ProviderDocumentSchema.partial();

// ================== TYPE GUARDS & UTILITIES ==================

/**
 * Check if a value is a valid ProviderType
 */
export function isValidProviderType(value: string): value is ProviderType {
  return PROVIDER_TYPES.includes(value as ProviderType);
}

/**
 * Check if a value is a valid VerificationStatus
 */
export function isValidVerificationStatus(value: string): value is VerificationStatus {
  return VERIFICATION_STATUSES.includes(value as VerificationStatus);
}

// ================== FIELD NAME MAPPING (for legacy support) ==================

/**
 * Maps legacy field names to canonical names
 * Used during read operations for backward compatibility
 */
export const LEGACY_FIELD_MAPPING: Record<string, string> = {
  galleryImages: 'gallery',
  serviceCategories: 'services',
  insuranceAccepted: 'insurances',
  nameFr: 'facilityNameFr',
  nameAr: 'facilityNameAr',
};

/**
 * Get the canonical field name for a potentially legacy field
 */
export function getCanonicalFieldName(fieldName: string): string {
  return LEGACY_FIELD_MAPPING[fieldName] || fieldName;
}
