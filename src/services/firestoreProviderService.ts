// Firestore Provider Service
// Centralized service for reading/writing providers to Firestore
// With fallback to reference data when Firestore is unavailable

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc,
  updateDoc, 
  query, 
  where,
  orderBy,
  limit,
  writeBatch,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CityHealthProvider, ProviderType, VerificationStatus, Lang } from '@/data/providers';
import { REFERENCE_PROVIDERS } from '@/data/referenceProviders';
import { logError, handleError } from '@/utils/errorHandling';
import { 
  validateProviderUpdate, 
  cleanProviderUpdate, 
  mergeLegacyFields,
  logValidationWarnings 
} from '@/utils/providerValidation';

const PROVIDERS_COLLECTION = 'providers';

// Flag to track if Firestore is available
let firestoreAvailable = true;
let fallbackUsed = false;

// Only enable fallback data in development mode
const ENABLE_FALLBACK = import.meta.env.DEV;

/**
 * Check if fallback/mock data is currently being used
 * Useful for displaying warnings in development mode
 */
export function isUsingFallbackData(): boolean {
  return fallbackUsed;
}

/**
 * Get the current data source status
 */
export function getDataSourceStatus(): { source: 'firestore' | 'fallback'; firestoreAvailable: boolean } {
  return {
    source: fallbackUsed ? 'fallback' : 'firestore',
    firestoreAvailable,
  };
}

// Get fallback providers (reference data) - only in development
function getFallbackProviders(): CityHealthProvider[] {
  if (!ENABLE_FALLBACK) {
    console.warn('[PROD] Firestore unavailable, returning empty array (fallback disabled in production)');
    return [];
  }
  console.warn('[DEV] Using reference/mock data - Firestore not connected or empty');
  fallbackUsed = true;
  return REFERENCE_PROVIDERS.filter(p => p.verificationStatus === 'verified' && p.isPublic);
}

/**
 * Convert Firestore document to CityHealthProvider
 * Handles legacy field names via fallback chains
 */
function docToProvider(docData: DocumentData, id: string): CityHealthProvider {
  // Merge legacy field names to canonical names (cast to DocumentData for type safety)
  const merged = mergeLegacyFields(docData as Record<string, unknown>) as DocumentData;
  
  return {
    id,
    name: String(merged.name || merged.facilityNameFr || ''),
    type: merged.type as ProviderType,
    specialty: merged.specialty as string | undefined,
    rating: Number(merged.rating) || 0,
    reviewsCount: Number(merged.reviewsCount || merged.reviewCount) || 0,
    distance: Number(merged.distance) || 0,
    verified: Boolean(merged.verified) || false,
    emergency: Boolean(merged.emergency || merged.is24_7) || false,
    accessible: merged.accessible !== undefined ? Boolean(merged.accessible) : true,
    isOpen: Boolean(merged.isOpen) || false,
    address: String(merged.address || ''),
    city: String(merged.city || 'Sidi Bel Abbès'),
    area: String(merged.area || ''),
    phone: String(merged.phone || ''),
    image: String(merged.image || '/placeholder.svg'),
    lat: Number(merged.lat) || 35.1975,
    lng: Number(merged.lng) || -0.6300,
    languages: (merged.languages || ['fr']) as Lang[],
    description: String(merged.description || ''),
    verificationStatus: (merged.verificationStatus || 'pending') as VerificationStatus,
    isPublic: Boolean(merged.isPublic) || false,
    
    // ========== IDENTITY FIELDS (Sensitive) ==========
    facilityNameFr: String(merged.facilityNameFr || merged.nameFr || ''),
    facilityNameAr: String(merged.facilityNameAr || merged.nameAr || ''),
    email: merged.email ? String(merged.email) : null,
    legalRegistrationNumber: String(merged.legalRegistrationNumber || ''),
    contactPersonName: String(merged.contactPersonName || ''),
    contactPersonRole: String(merged.contactPersonRole || ''),
    postalCode: String(merged.postalCode || ''),
    
    // ========== TYPE-SPECIFIC FIELDS ==========
    bloodTypes: merged.bloodTypes as string[] | undefined,
    urgentNeed: merged.urgentNeed as boolean | undefined,
    stockStatus: merged.stockStatus as 'critical' | 'low' | 'normal' | 'high' | undefined,
    imagingTypes: merged.imagingTypes as string[] | undefined,
    
    // ========== PROFILE FIELDS (Non-sensitive) - CANONICAL NAMES ==========
    gallery: (merged.gallery || []) as string[],
    services: (merged.services || []) as string[],
    insurances: (merged.insurances || []) as string[],
    specialties: (merged.specialties || []) as string[],
    schedule: merged.schedule as CityHealthProvider['schedule'] || null,
    reviews: (merged.reviews || []) as CityHealthProvider['reviews'],
    socialLinks: merged.socialLinks as CityHealthProvider['socialLinks'] || null,
    departments: (merged.departments || []) as string[],
    consultationFee: merged.consultationFee as number | null ?? null,
    website: merged.website ? String(merged.website) : null,
    homeVisitAvailable: Boolean(merged.homeVisitAvailable) || false,
    accessibilityFeatures: (merged.accessibilityFeatures || []) as string[],
    
    // ========== CATEGORY-SPECIFIC FIELDS ==========
    // Care
    emergencyCapable: Boolean(merged.emergencyCapable) || false,
    consultationTypes: (merged.consultationTypes || []) as string[],
    numberOfBeds: (merged.numberOfBeds as number | null) ?? null,
    hasReanimation: Boolean(merged.hasReanimation) || false,
    operatingBlocks: (merged.operatingBlocks as number | null) ?? null,
    // Diagnosis
    analysisTypes: (merged.analysisTypes || []) as string[],
    homeCollection: Boolean(merged.homeCollection) || false,
    onlineResults: Boolean(merged.onlineResults) || false,
    turnaroundHours: (merged.turnaroundHours as number | null) ?? null,
    // Pharmacy
    isPharmacieDeGarde: Boolean(merged.isPharmacieDeGarde) || false,
    pharmacyServices: (merged.pharmacyServices || []) as string[],
    pharmacyDeliveryAvailable: Boolean(merged.pharmacyDeliveryAvailable) || false,
    pharmacyDeliveryZone: String(merged.pharmacyDeliveryZone || ''),
    pharmacyDeliveryFee: String(merged.pharmacyDeliveryFee || ''),
    pharmacyDeliveryHours: String(merged.pharmacyDeliveryHours || ''),
    pharmacyDutyPhone: String(merged.pharmacyDutyPhone || ''),
    pharmacyNightBell: Boolean(merged.pharmacyNightBell) || false,
    pharmacyGardeSchedule: (merged.pharmacyGardeSchedule || []) as CityHealthProvider['pharmacyGardeSchedule'],
    pharmacyStockInfo: String(merged.pharmacyStockInfo || ''),
    // Blood Cabin
    bloodStockLevels: (merged.bloodStockLevels || {}) as Record<string, string>,
    urgentBloodType: String(merged.urgentBloodType || ''),
    bloodCabinWalkInAllowed: merged.bloodCabinWalkInAllowed as boolean | undefined,
    donationCampaigns: (merged.donationCampaigns || []) as CityHealthProvider['donationCampaigns'],
    mobileDonationUnits: (merged.mobileDonationUnits || []) as CityHealthProvider['mobileDonationUnits'],
    donationPreparationGuidelines: String(merged.donationPreparationGuidelines || ''),
    minDaysBetweenDonations: (merged.minDaysBetweenDonations as number | null) ?? null,
    totalDonationsReceived: (merged.totalDonationsReceived as number | null) ?? null,
    // Medical Equipment
    equipmentBusinessTypes: (merged.equipmentBusinessTypes || []) as string[],
    installationAvailable: Boolean(merged.installationAvailable) || false,
    catalogPdfUrl: String(merged.catalogPdfUrl || ''),
    equipmentCatalog: (merged.equipmentCatalog || []) as CityHealthProvider['equipmentCatalog'],
    equipmentBrands: (merged.equipmentBrands || []) as string[],
    maintenanceServiceAvailable: Boolean(merged.maintenanceServiceAvailable) || false,
    technicalSupportAvailable: Boolean(merged.technicalSupportAvailable) || false,
    technicalSupportPhone: String(merged.technicalSupportPhone || ''),
    equipmentDeliveryZone: String(merged.equipmentDeliveryZone || ''),
    equipmentDeliveryFee: String(merged.equipmentDeliveryFee || ''),
    // Lab enhanced
    labTestCatalog: (merged.labTestCatalog || []) as CityHealthProvider['labTestCatalog'],
    labResultDeliveryMethods: (merged.labResultDeliveryMethods || []) as string[],
    labAppointmentRequired: merged.labAppointmentRequired as boolean | undefined,
    labAccreditations: (merged.labAccreditations || []) as string[],
    labFastingInfoNote: String(merged.labFastingInfoNote || ''),
    homeCollectionZone: String(merged.homeCollectionZone || ''),
    homeCollectionFee: String(merged.homeCollectionFee || ''),
    // Radiology enhanced
    radiologyExamCatalog: (merged.radiologyExamCatalog || []) as CityHealthProvider['radiologyExamCatalog'],
    radiologyResultDeliveryMethods: (merged.radiologyResultDeliveryMethods || []) as string[],
    radiologyAppointmentRequired: merged.radiologyAppointmentRequired as boolean | undefined,
    radiologyAccreditations: (merged.radiologyAccreditations || []) as string[],
    radiologistOnSite: Boolean(merged.radiologistOnSite) || false,
    // Generic
    providerCategory: merged.providerCategory as CityHealthProvider['providerCategory'],
    specificFeatures: (merged.specificFeatures || {}) as Record<string, any>,
    
    // ========== HOSPITAL-SPECIFIC FIELDS ==========
    ambulancePhone: String(merged.ambulancePhone || ''),
    receptionPhone: String(merged.receptionPhone || ''),
    adminPhone: String(merged.adminPhone || ''),
    waitTimeMinutes: (merged.waitTimeMinutes as number | null) ?? null,
    waitTimeUpdatedAt: (merged.waitTimeUpdatedAt as string | null) ?? null,
    departmentSchedules: (merged.departmentSchedules || {}) as Record<string, { open: string; close: string }>,
    landmarkDescription: String(merged.landmarkDescription || ''),
    
    // ========== MATERNITY-SPECIFIC FIELDS ==========
    maternityEmergencyPhone: String(merged.maternityEmergencyPhone || ''),
    deliveryRooms: (merged.deliveryRooms as number | null) ?? null,
    maternityServices: (merged.maternityServices || []) as string[],
    femaleStaffOnly: Boolean(merged.femaleStaffOnly) || false,
    pediatricianOnSite: Boolean(merged.pediatricianOnSite) || false,
    visitingHoursPolicy: String(merged.visitingHoursPolicy || ''),
    hasNICU: Boolean(merged.hasNICU) || false,
    
    // ========== CLINIC-SPECIFIC FIELDS ==========
    consultationRooms: (merged.consultationRooms as number | null) ?? null,
    surgeriesOffered: (merged.surgeriesOffered || []) as string[],
    doctorRoster: (merged.doctorRoster || []) as Array<{ name: string; specialty: string }>,
    paymentMethods: (merged.paymentMethods || []) as string[],
    parkingAvailable: Boolean(merged.parkingAvailable) || false,
    
    // ========== DOCTOR-SPECIFIC FIELDS ==========
    medicalSchool: String(merged.medicalSchool || ''),
    graduationYear: (merged.graduationYear as number | null) ?? null,
    yearsOfExperience: (merged.yearsOfExperience as number | null) ?? null,
    secondarySpecialty: String(merged.secondarySpecialty || ''),
    homeVisitZone: String(merged.homeVisitZone || ''),
    teleconsultationPlatform: String(merged.teleconsultationPlatform || ''),
    ordreMedecinsNumber: String(merged.ordreMedecinsNumber || ''),
    trainedAbroad: Boolean(merged.trainedAbroad) || false,
    trainingCountry: String(merged.trainingCountry || ''),
    womenOnlyPractice: Boolean(merged.womenOnlyPractice) || false,
    patientTypes: (merged.patientTypes || []) as string[],
    
    // ========== VERIFICATION REVOCATION ==========
    verificationRevokedAt: merged.verificationRevokedAt as Date | string | undefined,
    verificationRevokedReason: merged.verificationRevokedReason as string | undefined,
    
    // ========== PLAN TYPE ==========
    planType: (merged.planType as 'basic' | 'standard' | 'premium') || undefined,
    
    // ========== ACCOUNT SETTINGS ==========
    settings: merged.settings as CityHealthProvider['settings'] || undefined,
    
    // ========== DEPRECATED FIELDS (for backward compatibility reads only) ==========
    insuranceAccepted: (merged.insurances || []) as string[],
  };
}

/**
 * Convert CityHealthProvider to Firestore document
 * Uses CANONICAL field names only for writes
 */
function providerToDoc(provider: CityHealthProvider & { userId?: string }): DocumentData {
  return {
    name: provider.name,
    type: provider.type,
    specialty: provider.specialty || null,
    rating: provider.rating,
    reviewsCount: provider.reviewsCount,
    distance: provider.distance,
    verified: provider.verified,
    emergency: provider.emergency,
    accessible: provider.accessible,
    isOpen: provider.isOpen,
    address: provider.address,
    city: provider.city,
    area: provider.area,
    phone: provider.phone,
    image: provider.image,
    lat: provider.lat,
    lng: provider.lng,
    languages: provider.languages,
    description: provider.description,
    verificationStatus: provider.verificationStatus,
    isPublic: provider.isPublic,
    
    // User ID linking to Firebase Auth
    ...(provider.userId && { userId: provider.userId }),
    
    // ========== IDENTITY FIELDS (Sensitive) ==========
    ...(provider.facilityNameFr && { facilityNameFr: provider.facilityNameFr }),
    ...(provider.facilityNameAr && { facilityNameAr: provider.facilityNameAr }),
    ...(provider.email && { email: provider.email }),
    ...(provider.legalRegistrationNumber && { legalRegistrationNumber: provider.legalRegistrationNumber }),
    ...(provider.contactPersonName && { contactPersonName: provider.contactPersonName }),
    ...(provider.contactPersonRole && { contactPersonRole: provider.contactPersonRole }),
    ...(provider.postalCode && { postalCode: provider.postalCode }),
    
    // ========== TYPE-SPECIFIC FIELDS ==========
    ...(provider.bloodTypes && { bloodTypes: provider.bloodTypes }),
    ...(provider.urgentNeed !== undefined && { urgentNeed: provider.urgentNeed }),
    ...(provider.stockStatus && { stockStatus: provider.stockStatus }),
    ...(provider.imagingTypes && { imagingTypes: provider.imagingTypes }),
    ...(provider.productCategories && { productCategories: provider.productCategories }),
    ...(provider.rentalAvailable !== undefined && { rentalAvailable: provider.rentalAvailable }),
    ...(provider.deliveryAvailable !== undefined && { deliveryAvailable: provider.deliveryAvailable }),
    
    // ========== PROFILE FIELDS - CANONICAL NAMES ONLY ==========
    ...(provider.gallery && { gallery: provider.gallery }),                     // CANONICAL
    ...(provider.services && { services: provider.services }),                  // CANONICAL
    ...(provider.insurances && { insurances: provider.insurances }),            // CANONICAL
    ...(provider.specialties && { specialties: provider.specialties }),
    ...(provider.schedule && { schedule: provider.schedule }),
    ...(provider.reviews && { reviews: provider.reviews }),
    ...(provider.socialLinks && { socialLinks: provider.socialLinks }),
    ...(provider.departments && { departments: provider.departments }),
    ...(provider.equipment && { equipment: provider.equipment }),
    ...(provider.accessibilityFeatures && { accessibilityFeatures: provider.accessibilityFeatures }),
    ...(provider.consultationFee !== undefined && { consultationFee: provider.consultationFee }),
    ...(provider.website && { website: provider.website }),
    ...(provider.homeVisitAvailable !== undefined && { homeVisitAvailable: provider.homeVisitAvailable }),
    ...(provider.is24_7 !== undefined && { is24_7: provider.is24_7 }),
    
    // ========== CATEGORY-SPECIFIC FIELDS ==========
    ...(provider.emergencyCapable !== undefined && { emergencyCapable: provider.emergencyCapable }),
    ...(provider.consultationTypes?.length && { consultationTypes: provider.consultationTypes }),
    ...(provider.numberOfBeds !== undefined && provider.numberOfBeds !== null && { numberOfBeds: provider.numberOfBeds }),
    ...(provider.hasReanimation !== undefined && { hasReanimation: provider.hasReanimation }),
    ...(provider.operatingBlocks !== undefined && provider.operatingBlocks !== null && { operatingBlocks: provider.operatingBlocks }),
    ...(provider.analysisTypes?.length && { analysisTypes: provider.analysisTypes }),
    ...(provider.homeCollection !== undefined && { homeCollection: provider.homeCollection }),
    ...(provider.onlineResults !== undefined && { onlineResults: provider.onlineResults }),
    ...(provider.turnaroundHours !== undefined && provider.turnaroundHours !== null && { turnaroundHours: provider.turnaroundHours }),
    ...(provider.isPharmacieDeGarde !== undefined && { isPharmacieDeGarde: provider.isPharmacieDeGarde }),
    ...(provider.pharmacyServices?.length && { pharmacyServices: provider.pharmacyServices }),
    ...(provider.pharmacyDeliveryAvailable !== undefined && { pharmacyDeliveryAvailable: provider.pharmacyDeliveryAvailable }),
    ...(provider.pharmacyDeliveryZone && { pharmacyDeliveryZone: provider.pharmacyDeliveryZone }),
    ...(provider.pharmacyDeliveryFee && { pharmacyDeliveryFee: provider.pharmacyDeliveryFee }),
    ...(provider.pharmacyDeliveryHours && { pharmacyDeliveryHours: provider.pharmacyDeliveryHours }),
    ...(provider.pharmacyDutyPhone && { pharmacyDutyPhone: provider.pharmacyDutyPhone }),
    ...(provider.pharmacyNightBell !== undefined && { pharmacyNightBell: provider.pharmacyNightBell }),
    ...(provider.pharmacyGardeSchedule?.length && { pharmacyGardeSchedule: provider.pharmacyGardeSchedule }),
    ...(provider.pharmacyStockInfo && { pharmacyStockInfo: provider.pharmacyStockInfo }),
    ...(provider.bloodStockLevels && Object.keys(provider.bloodStockLevels).length > 0 && { bloodStockLevels: provider.bloodStockLevels }),
    ...(provider.urgentBloodType && { urgentBloodType: provider.urgentBloodType }),
    ...(provider.bloodCabinWalkInAllowed !== undefined && { bloodCabinWalkInAllowed: provider.bloodCabinWalkInAllowed }),
    ...(provider.donationCampaigns?.length && { donationCampaigns: provider.donationCampaigns }),
    ...(provider.mobileDonationUnits?.length && { mobileDonationUnits: provider.mobileDonationUnits }),
    ...(provider.donationPreparationGuidelines && { donationPreparationGuidelines: provider.donationPreparationGuidelines }),
    ...(provider.minDaysBetweenDonations !== undefined && provider.minDaysBetweenDonations !== null && { minDaysBetweenDonations: provider.minDaysBetweenDonations }),
    ...(provider.totalDonationsReceived !== undefined && provider.totalDonationsReceived !== null && { totalDonationsReceived: provider.totalDonationsReceived }),
    ...(provider.equipmentBusinessTypes?.length && { equipmentBusinessTypes: provider.equipmentBusinessTypes }),
    ...(provider.installationAvailable !== undefined && { installationAvailable: provider.installationAvailable }),
    ...(provider.catalogPdfUrl && { catalogPdfUrl: provider.catalogPdfUrl }),
    ...(provider.equipmentCatalog?.length && { equipmentCatalog: provider.equipmentCatalog }),
    ...(provider.equipmentBrands?.length && { equipmentBrands: provider.equipmentBrands }),
    ...(provider.maintenanceServiceAvailable !== undefined && { maintenanceServiceAvailable: provider.maintenanceServiceAvailable }),
    ...(provider.technicalSupportAvailable !== undefined && { technicalSupportAvailable: provider.technicalSupportAvailable }),
    ...(provider.technicalSupportPhone && { technicalSupportPhone: provider.technicalSupportPhone }),
    ...(provider.equipmentDeliveryZone && { equipmentDeliveryZone: provider.equipmentDeliveryZone }),
    ...(provider.equipmentDeliveryFee && { equipmentDeliveryFee: provider.equipmentDeliveryFee }),
    // Lab enhanced
    ...(provider.labTestCatalog?.length && { labTestCatalog: provider.labTestCatalog }),
    ...(provider.labResultDeliveryMethods?.length && { labResultDeliveryMethods: provider.labResultDeliveryMethods }),
    ...(provider.labAppointmentRequired !== undefined && { labAppointmentRequired: provider.labAppointmentRequired }),
    ...(provider.labAccreditations?.length && { labAccreditations: provider.labAccreditations }),
    ...(provider.labFastingInfoNote && { labFastingInfoNote: provider.labFastingInfoNote }),
    ...(provider.homeCollectionZone && { homeCollectionZone: provider.homeCollectionZone }),
    ...(provider.homeCollectionFee && { homeCollectionFee: provider.homeCollectionFee }),
    // Radiology enhanced
    ...(provider.radiologyExamCatalog?.length && { radiologyExamCatalog: provider.radiologyExamCatalog }),
    ...(provider.radiologyResultDeliveryMethods?.length && { radiologyResultDeliveryMethods: provider.radiologyResultDeliveryMethods }),
    ...(provider.radiologyAppointmentRequired !== undefined && { radiologyAppointmentRequired: provider.radiologyAppointmentRequired }),
    ...(provider.radiologyAccreditations?.length && { radiologyAccreditations: provider.radiologyAccreditations }),
    ...(provider.radiologistOnSite !== undefined && { radiologistOnSite: provider.radiologistOnSite }),
    ...(provider.providerCategory && { providerCategory: provider.providerCategory }),
    ...(provider.specificFeatures && Object.keys(provider.specificFeatures).length > 0 && { specificFeatures: provider.specificFeatures }),
    
    // ========== HOSPITAL-SPECIFIC FIELDS ==========
    ...(provider.ambulancePhone && { ambulancePhone: provider.ambulancePhone }),
    ...(provider.receptionPhone && { receptionPhone: provider.receptionPhone }),
    ...(provider.adminPhone && { adminPhone: provider.adminPhone }),
    ...(provider.waitTimeMinutes !== undefined && provider.waitTimeMinutes !== null && { waitTimeMinutes: provider.waitTimeMinutes }),
    ...(provider.waitTimeUpdatedAt && { waitTimeUpdatedAt: provider.waitTimeUpdatedAt }),
    ...(provider.departmentSchedules && Object.keys(provider.departmentSchedules).length > 0 && { departmentSchedules: provider.departmentSchedules }),
    ...(provider.landmarkDescription && { landmarkDescription: provider.landmarkDescription }),
    
    // ========== MATERNITY-SPECIFIC FIELDS ==========
    ...(provider.maternityEmergencyPhone && { maternityEmergencyPhone: provider.maternityEmergencyPhone }),
    ...(provider.deliveryRooms !== undefined && provider.deliveryRooms !== null && { deliveryRooms: provider.deliveryRooms }),
    ...(provider.maternityServices?.length && { maternityServices: provider.maternityServices }),
    ...(provider.femaleStaffOnly !== undefined && { femaleStaffOnly: provider.femaleStaffOnly }),
    ...(provider.pediatricianOnSite !== undefined && { pediatricianOnSite: provider.pediatricianOnSite }),
    ...(provider.visitingHoursPolicy && { visitingHoursPolicy: provider.visitingHoursPolicy }),
    ...(provider.hasNICU !== undefined && { hasNICU: provider.hasNICU }),
    
    // ========== CLINIC-SPECIFIC FIELDS ==========
    ...(provider.consultationRooms !== undefined && provider.consultationRooms !== null && { consultationRooms: provider.consultationRooms }),
    ...(provider.surgeriesOffered?.length && { surgeriesOffered: provider.surgeriesOffered }),
    ...(provider.doctorRoster?.length && { doctorRoster: provider.doctorRoster }),
    ...(provider.paymentMethods?.length && { paymentMethods: provider.paymentMethods }),
    ...(provider.parkingAvailable !== undefined && { parkingAvailable: provider.parkingAvailable }),
    
    // ========== DOCTOR-SPECIFIC FIELDS ==========
    ...(provider.medicalSchool && { medicalSchool: provider.medicalSchool }),
    ...(provider.graduationYear !== undefined && provider.graduationYear !== null && { graduationYear: provider.graduationYear }),
    ...(provider.yearsOfExperience !== undefined && provider.yearsOfExperience !== null && { yearsOfExperience: provider.yearsOfExperience }),
    ...(provider.secondarySpecialty && { secondarySpecialty: provider.secondarySpecialty }),
    ...(provider.homeVisitZone && { homeVisitZone: provider.homeVisitZone }),
    ...(provider.teleconsultationPlatform && { teleconsultationPlatform: provider.teleconsultationPlatform }),
    ...(provider.ordreMedecinsNumber && { ordreMedecinsNumber: provider.ordreMedecinsNumber }),
    ...(provider.trainedAbroad !== undefined && { trainedAbroad: provider.trainedAbroad }),
    ...(provider.trainingCountry && { trainingCountry: provider.trainingCountry }),
    ...(provider.womenOnlyPractice !== undefined && { womenOnlyPractice: provider.womenOnlyPractice }),
    ...(provider.patientTypes?.length && { patientTypes: provider.patientTypes }),
    
    // ========== ACCOUNT SETTINGS ==========
    ...(provider.settings && { settings: provider.settings }),
    
    // ========== METADATA ==========
    updatedAt: Timestamp.now(),
  };
}

/**
 * Get all verified and public providers (for public search/map)
 * Falls back to reference data if Firestore is unavailable
 */
export async function getVerifiedProviders(): Promise<CityHealthProvider[]> {
  try {
    if (!firestoreAvailable) {
      return getFallbackProviders();
    }
    
    const providersRef = collection(db, PROVIDERS_COLLECTION);
    const q = query(
      providersRef,
      where('verificationStatus', '==', 'verified'),
      where('isPublic', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    // If no data in Firestore, use fallback
    if (snapshot.empty) {
      return getFallbackProviders();
    }
    
    return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
  } catch (error: any) {
    // Check if it's a permission error - silently use fallback
    if (error?.code === 'permission-denied') {
      firestoreAvailable = false;
      return getFallbackProviders();
    }
    
    logError(error, 'getVerifiedProviders');
    // Return fallback on any error
    return getFallbackProviders();
  }
}

/**
 * Get all providers (admin only)
 * In production, throws on permission errors instead of falling back to mock data.
 * In development, falls back to REFERENCE_PROVIDERS with a console warning.
 */
export async function getAllProviders(): Promise<CityHealthProvider[]> {
  try {
    if (!firestoreAvailable && !ENABLE_FALLBACK) {
      throw new Error('Firestore unavailable. Cannot load admin provider data.');
    }
    if (!firestoreAvailable) {
      console.warn('[DEV] getAllProviders: Using REFERENCE_PROVIDERS fallback');
      fallbackUsed = true;
      return REFERENCE_PROVIDERS;
    }
    
    const providersRef = collection(db, PROVIDERS_COLLECTION);
    const snapshot = await getDocs(providersRef);
    
    if (snapshot.empty) {
      if (!ENABLE_FALLBACK) {
        return [];
      }
      console.warn('[DEV] getAllProviders: Firestore empty, using REFERENCE_PROVIDERS');
      fallbackUsed = true;
      return REFERENCE_PROVIDERS;
    }
    
    fallbackUsed = false;
    return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      firestoreAvailable = false;
      if (!ENABLE_FALLBACK) {
        throw new Error('Permission denied: Cannot access provider data. Verify Firestore rules for admin access.');
      }
    }
    logError(error, 'getAllProviders');
    if (!ENABLE_FALLBACK) {
      throw error;
    }
    fallbackUsed = true;
    return REFERENCE_PROVIDERS;
  }
}

/**
 * Get a single provider by ID
 */
export async function getProviderById(id: string): Promise<CityHealthProvider | null> {
  try {
    // Check fallback first
    if (!firestoreAvailable) {
      return REFERENCE_PROVIDERS.find(p => p.id === id) || null;
    }
    
    const docRef = doc(db, PROVIDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // Try fallback
      return REFERENCE_PROVIDERS.find(p => p.id === id) || null;
    }
    
    return docToProvider(docSnap.data(), docSnap.id);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      firestoreAvailable = false;
    }
    logError(error, `getProviderById: ${id}`);
    return REFERENCE_PROVIDERS.find(p => p.id === id) || null;
  }
}

/**
 * Get providers by type
 */
export async function getProvidersByType(type: ProviderType): Promise<CityHealthProvider[]> {
  try {
    if (!firestoreAvailable) {
      return REFERENCE_PROVIDERS.filter(p => p.type === type && p.verificationStatus === 'verified' && p.isPublic);
    }
    
    const providersRef = collection(db, PROVIDERS_COLLECTION);
    const q = query(
      providersRef,
      where('type', '==', type),
      where('verificationStatus', '==', 'verified'),
      where('isPublic', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return REFERENCE_PROVIDERS.filter(p => p.type === type && p.verificationStatus === 'verified' && p.isPublic);
    }
    
    return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      firestoreAvailable = false;
    }
    return REFERENCE_PROVIDERS.filter(p => p.type === type && p.verificationStatus === 'verified' && p.isPublic);
  }
}

/**
 * Get emergency providers
 */
export async function getEmergencyProviders(): Promise<CityHealthProvider[]> {
  try {
    if (!firestoreAvailable) {
      return REFERENCE_PROVIDERS.filter(p => p.emergency && p.verificationStatus === 'verified' && p.isPublic);
    }
    
    const providersRef = collection(db, PROVIDERS_COLLECTION);
    const q = query(
      providersRef,
      where('emergency', '==', true),
      where('verificationStatus', '==', 'verified'),
      where('isPublic', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return REFERENCE_PROVIDERS.filter(p => p.emergency && p.verificationStatus === 'verified' && p.isPublic);
    }
    
    return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      firestoreAvailable = false;
    }
    return REFERENCE_PROVIDERS.filter(p => p.emergency && p.verificationStatus === 'verified' && p.isPublic);
  }
}

/**
 * Get blood donation centers
 */
export async function getBloodCenters(): Promise<CityHealthProvider[]> {
  try {
    if (!firestoreAvailable) {
      return REFERENCE_PROVIDERS.filter(p => 
        (p.type === 'blood_cabin' || p.type === 'hospital') && 
        p.verificationStatus === 'verified' && 
        p.isPublic
      );
    }
    
    const providersRef = collection(db, PROVIDERS_COLLECTION);
    const q = query(
      providersRef,
      where('type', 'in', ['blood_cabin', 'hospital']),
      where('verificationStatus', '==', 'verified'),
      where('isPublic', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return REFERENCE_PROVIDERS.filter(p => 
        (p.type === 'blood_cabin' || p.type === 'hospital') && 
        p.verificationStatus === 'verified' && 
        p.isPublic
      );
    }
    
    return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      firestoreAvailable = false;
    }
    return REFERENCE_PROVIDERS.filter(p => 
      (p.type === 'blood_cabin' || p.type === 'hospital') && 
      p.verificationStatus === 'verified' && 
      p.isPublic
    );
  }
}

/**
 * Save a single provider
 */
export async function saveProvider(provider: CityHealthProvider): Promise<void> {
  const docRef = doc(db, PROVIDERS_COLLECTION, provider.id);
  await setDoc(docRef, providerToDoc(provider));
}

/**
 * Update an existing provider with partial data
 * Used by providers to update their own profile
 * Includes validation and canonical field name enforcement
 */
export async function updateProvider(
  providerId: string,
  updates: Partial<CityHealthProvider>
): Promise<void> {
  const docRef = doc(db, PROVIDERS_COLLECTION, providerId);
  
  // Validate updates
  const validation = validateProviderUpdate(updates as Record<string, unknown>);
  logValidationWarnings(validation);
  
  if (!validation.valid) {
    throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
  }
  
  // Clean updates: remove undefined values and convert deprecated field names
  const cleanUpdates = cleanProviderUpdate(updates as Record<string, unknown>);
  
  await updateDoc(docRef, {
    ...cleanUpdates,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update provider with verification status check
 * Automatically revokes verification if sensitive fields are modified
 */
export async function updateProviderWithVerificationCheck(
  providerId: string,
  updates: Partial<CityHealthProvider>,
  currentVerificationStatus: 'pending' | 'verified' | 'rejected'
): Promise<{ success: boolean; verificationRevoked: boolean; modifiedSensitiveFields: string[] }> {
  // Import dynamically to avoid circular dependencies
  const { isSensitiveField } = await import('@/constants/sensitiveFields');
  
  // Check if any sensitive fields are being modified
  const sensitiveFieldsModified = Object.keys(updates).filter(key => 
    isSensitiveField(key)
  );
  
  const shouldRevokeVerification = 
    currentVerificationStatus === 'verified' && 
    sensitiveFieldsModified.length > 0;
  
  const docRef = doc(db, PROVIDERS_COLLECTION, providerId);
  
  // Filter out undefined values
  const cleanUpdates: Record<string, any> = {};
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanUpdates[key] = value;
    }
  });
  
  // Add verification revocation if needed
  if (shouldRevokeVerification) {
    const { VERIFICATION_TRANSITIONS } = await import('@/constants/verificationStates');
    Object.assign(cleanUpdates, VERIFICATION_TRANSITIONS.revoke);
    cleanUpdates.verificationRevokedAt = Timestamp.now();
    cleanUpdates.verificationRevokedReason = `Modified: ${sensitiveFieldsModified.join(', ')}`;
  }
  
  await updateDoc(docRef, {
    ...cleanUpdates,
    updatedAt: Timestamp.now(),
  });
  
  // Create admin notification if verification was revoked
  if (shouldRevokeVerification) {
    try {
      const { notifyVerificationRevoked } = await import('@/services/adminNotificationService');
      const providerName = updates.name || cleanUpdates.name || 'Prestataire';
      await notifyVerificationRevoked(providerId, providerName, sensitiveFieldsModified);
    } catch (error) {
      // Don't fail the main operation if notification fails
      console.error('Failed to create admin notification:', error);
    }
  }
  
  return { 
    success: true, 
    verificationRevoked: shouldRevokeVerification,
    modifiedSensitiveFields: sensitiveFieldsModified,
  };
}

/**
 * Batch save multiple providers (for migration)
 */
export async function batchSaveProviders(providers: CityHealthProvider[]): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;
  
  // Firestore batch limit is 500 operations
  const chunks: CityHealthProvider[][] = [];
  for (let i = 0; i < providers.length; i += 500) {
    chunks.push(providers.slice(i, i + 500));
  }
  
  for (const chunk of chunks) {
    const chunkBatch = writeBatch(db);
    for (const provider of chunk) {
      const docRef = doc(db, PROVIDERS_COLLECTION, provider.id);
      chunkBatch.set(docRef, {
        ...providerToDoc(provider),
        createdAt: Timestamp.now(),
      });
      count++;
    }
    await chunkBatch.commit();
  }
  
  return count;
}

/**
 * Check if providers collection has data
 */
export async function hasProviders(): Promise<boolean> {
  const providersRef = collection(db, PROVIDERS_COLLECTION);
  const q = query(providersRef, limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Search providers by name or specialty
 */
export async function searchProviders(searchQuery: string): Promise<CityHealthProvider[]> {
  // Firestore doesn't support full-text search, so we fetch verified providers
  // and filter client-side. For production, use Algolia or similar.
  const providers = await getVerifiedProviders();
  const query = searchQuery.toLowerCase();
  
  return providers.filter(p => 
    p.name.toLowerCase().includes(query) ||
    (p.specialty?.toLowerCase().includes(query)) ||
    p.address.toLowerCase().includes(query) ||
    p.area.toLowerCase().includes(query)
  );
}

/**
 * Update provider verification status (admin only)
 */
export async function updateProviderVerification(
  providerId: string,
  verificationStatus: 'pending' | 'verified' | 'rejected',
  isPublic: boolean
): Promise<void> {
  const { VERIFICATION_TRANSITIONS } = await import('@/constants/verificationStates');
  const transition = verificationStatus === 'verified'
    ? VERIFICATION_TRANSITIONS.approve
    : verificationStatus === 'rejected'
      ? VERIFICATION_TRANSITIONS.reject
      : VERIFICATION_TRANSITIONS.revoke;

  const docRef = doc(db, PROVIDERS_COLLECTION, providerId);
  await updateDoc(docRef, {
    ...transition,
    // Allow caller override for isPublic if explicitly different
    isPublic,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get all pending provider registrations (admin only)
 */
export async function getPendingProviders(): Promise<CityHealthProvider[]> {
  const providersRef = collection(db, PROVIDERS_COLLECTION);
  const q = query(
    providersRef,
    where('verificationStatus', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProvider(doc.data(), doc.id));
}

/**
 * Get provider verification status by user ID
 */
export async function getProviderByUserId(userId: string): Promise<CityHealthProvider | null> {
  const providersRef = collection(db, PROVIDERS_COLLECTION);
  const q = query(
    providersRef,
    where('userId', '==', userId),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  return docToProvider(snapshot.docs[0].data(), snapshot.docs[0].id);
}
