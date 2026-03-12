// Provider Registration Service
// Handles account creation, provider document, and role assignment

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ProviderFormData, PROVIDER_TYPE_LABELS } from '@/components/provider/registration/types';
import { logError } from '@/utils/errorHandling';

export interface RegistrationResult {
  success: boolean;
  providerId?: string;
  userId?: string;
  error?: string;
}

/**
 * Create a complete provider account from registration form data
 * 1. Create Firebase Auth account (or use existing)
 * 2. Create Firestore profile
 * 3. Assign 'provider' role
 * 4. Create provider document
 * 
 * IMPORTANT: Prevents duplicate provider accounts using providerId = provider_{userId}
 */
export async function createProviderFromRegistration(
  formData: ProviderFormData
): Promise<RegistrationResult> {
  try {
    let userId: string;
    
    // Check if user is already authenticated (e.g., Google OAuth in Step 1)
    if (auth.currentUser) {
      userId = auth.currentUser.uid;
      
      // Check if provider already exists for this user
      const existingProvider = await getExistingProvider(userId);
      if (existingProvider) {
        return {
          success: false,
          error: 'Un compte professionnel existe déjà pour cet utilisateur. Veuillez vous connecter à votre espace professionnel.',
          providerId: existingProvider
        };
      }
    } else {
      // Create new Firebase Auth account
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        userId = userCredential.user.uid;
        
        // Update Firebase Auth display name
        await firebaseUpdateProfile(userCredential.user, {
          displayName: formData.facilityNameFr || formData.contactPersonName
        });
      } catch (authError: any) {
        // Handle email-already-in-use specifically
        if (authError.code === 'auth/email-already-in-use') {
          return {
            success: false,
            error: 'Cette adresse email est déjà utilisée. Si vous avez déjà un compte, veuillez vous connecter.'
          };
        }
        throw authError;
      }
    }

    // Create Firestore profile
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        id: userId,
        email: formData.email,
        full_name: formData.contactPersonName || formData.facilityNameFr,
        avatar_url: formData.logoPreview || null,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
    }

    // Assign 'provider' role (won't duplicate if exists)
    await assignProviderRole(userId);

    // Create canonical /users/{uid} document for AuthContext compatibility
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: formData.email,
        userType: 'provider',
        createdAt: Timestamp.now(),
      });
    } else {
      // If user doc exists (e.g. was a citizen), update to provider type
      // Only update if not already provider to avoid overwriting admin
      const existingType = userSnap.data().userType;
      if (existingType !== 'provider' && existingType !== 'admin') {
        await setDoc(userRef, { userType: 'provider' }, { merge: true });
      }
    }

    // Generate provider ID
    const providerId = `provider_${userId}`;

    // Upload images to cloud storage if files are provided
    let logoUrl: string | null = formData.logoPreview || null;
    let galleryUrls: string[] = formData.galleryPreviews?.length > 0 ? [...formData.galleryPreviews] : [];

    try {
      const { uploadProviderLogo, uploadGalleryImages } = await import('@/services/providerImageService');
      
      if (formData.logo) {
        logoUrl = await uploadProviderLogo(providerId, formData.logo);
      }
      
      if (formData.galleryPhotos?.length > 0) {
        galleryUrls = await uploadGalleryImages(providerId, formData.galleryPhotos);
      }
    } catch (uploadError) {
      logError(uploadError, 'providerImageUpload');
      // Continue with local previews if upload fails
    }

    // Create provider document with cloud URLs
    await createProviderDocument(providerId, userId, { ...formData, logoPreview: logoUrl || '', galleryPreviews: galleryUrls });

    return {
      success: true,
      providerId,
      userId
    };
  } catch (error: any) {
    logError(error, 'createProviderFromRegistration');
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      return {
        success: false,
        error: 'Cette adresse email est déjà utilisée. Si vous avez déjà un compte, veuillez vous connecter.'
      };
    }
    
    if (error.code === 'auth/weak-password') {
      return {
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères.'
      };
    }
    
    if (error.code === 'auth/invalid-email') {
      return {
        success: false,
        error: 'L\'adresse email n\'est pas valide.'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la création du compte.'
    };
  }
}

/**
 * Assign provider role to user
 */
export async function assignProviderRole(userId: string): Promise<void> {
  const roleDocId = `${userId}_provider`;
  const roleRef = doc(db, 'user_roles', roleDocId);
  
  // Check if role already exists
  const roleSnap = await getDoc(roleRef);
  if (!roleSnap.exists()) {
    await setDoc(roleRef, {
      user_id: userId,
      role: 'provider',
      created_at: Timestamp.now()
    });
  }
}

/**
 * Create provider document in Firestore
 */
async function createProviderDocument(
  providerId: string, 
  userId: string, 
  formData: ProviderFormData
): Promise<void> {
  const providerRef = doc(db, 'providers', providerId);

  // Map provider type to display type
  const typeMapping: Record<string, string> = {
    'hospital': 'hospital',
    'birth_hospital': 'birth_hospital',
    'clinic': 'clinic',
    'doctor': 'doctor',
    'pharmacy': 'pharmacy',
    'lab': 'lab',
    'blood_cabin': 'blood_cabin',
    'radiology_center': 'radiology_center',
    'medical_equipment': 'medical_equipment'
  };

  // Build provider document using CANONICAL field names
  const providerData = {
    // Link to Firebase Auth user
    userId,
    
    // ========== IDENTITY (Sensitive) ==========
    name: formData.facilityNameFr,
    facilityNameFr: formData.facilityNameFr,
    facilityNameAr: formData.facilityNameAr,
    type: typeMapping[formData.providerType] || formData.providerType,
    providerType: formData.providerType,
    
    // ========== CONTACT (Sensitive) ==========
    email: formData.email,
    phone: formData.phone,
    contactPersonName: formData.contactPersonName,
    contactPersonRole: formData.contactPersonRole,
    legalRegistrationNumber: formData.legalRegistrationNumber,
    
    // ========== LOCATION (Sensitive) ==========
    address: formData.address,
    city: formData.city || 'Sidi Bel Abbès',
    area: formData.area,
    postalCode: formData.postalCode,
    lat: formData.lat || 35.1975,
    lng: formData.lng || -0.6300,
    
    // ========== SCHEDULE (Non-sensitive) ==========
    schedule: formData.schedule,
    is24_7: formData.is24_7,
    homeVisitAvailable: formData.homeVisitAvailable,
    
    // ========== SERVICES (Non-sensitive) - CANONICAL NAMES ==========
    services: formData.serviceCategories,        // CANONICAL: 'services' not 'serviceCategories'
    specialties: formData.specialties,
    specialty: formData.specialties[0] || null,
    departments: formData.departments,
    equipment: formData.equipment,
    accessibilityFeatures: formData.accessibilityFeatures,
    languages: formData.languages,
    
    // ========== PROFILE (Non-sensitive) - CANONICAL NAMES ==========
    description: formData.description,
    image: formData.logoPreview || null,
    gallery: formData.galleryPreviews?.length > 0 ? formData.galleryPreviews : [],
    insurances: formData.insuranceAccepted,      // CANONICAL: 'insurances' not 'insuranceAccepted'
    consultationFee: formData.consultationFee,
    socialLinks: formData.socialLinks,
    
    // ========== TYPE-SPECIFIC FIELDS ==========
    ...(formData.bloodTypes && formData.bloodTypes.length > 0 && { bloodTypes: formData.bloodTypes }),
    ...(formData.urgentNeed !== undefined && { urgentNeed: formData.urgentNeed }),
    ...(formData.stockStatus && { stockStatus: formData.stockStatus }),
    ...(formData.imagingTypes && formData.imagingTypes.length > 0 && { imagingTypes: formData.imagingTypes }),
    ...(formData.productCategories && formData.productCategories.length > 0 && { productCategories: formData.productCategories }),
    ...(formData.rentalAvailable !== undefined && { rentalAvailable: formData.rentalAvailable }),
    ...(formData.deliveryAvailable !== undefined && { deliveryAvailable: formData.deliveryAvailable }),
    
    // ========== CATEGORY & SPECIFIC FEATURES ==========
    providerCategory: formData.providerCategory || null,
    specificFeatures: formData.specificFeatures || {},

    // ========== CARE-SPECIFIC FIELDS ==========
    emergencyCapable: formData.emergencyCapable || false,
    consultationTypes: formData.consultationTypes || ['in_person'],
    numberOfBeds: formData.numberOfBeds || null,
    hasReanimation: formData.hasReanimation || false,
    operatingBlocks: formData.operatingBlocks || null,

    // ========== DIAGNOSIS-SPECIFIC FIELDS ==========
    ...(formData.analysisTypes && formData.analysisTypes.length > 0 && { analysisTypes: formData.analysisTypes }),
    homeCollection: formData.homeCollection || false,
    onlineResults: formData.onlineResults || false,
    ...(formData.turnaroundHours && { turnaroundHours: formData.turnaroundHours }),

    // ========== LAB-SPECIFIC FIELDS ==========
    ...(formData.labTestCatalog?.length > 0 && { labTestCatalog: formData.labTestCatalog }),
    ...(formData.labResultDeliveryMethods?.length > 0 && { labResultDeliveryMethods: formData.labResultDeliveryMethods }),
    labAppointmentRequired: formData.labAppointmentRequired || false,
    ...(formData.labAccreditations?.length > 0 && { labAccreditations: formData.labAccreditations }),
    ...(formData.labFastingInfoNote && { labFastingInfoNote: formData.labFastingInfoNote }),
    ...(formData.homeCollectionZone && { homeCollectionZone: formData.homeCollectionZone }),
    ...(formData.homeCollectionFee && { homeCollectionFee: formData.homeCollectionFee }),

    // ========== RADIOLOGY-SPECIFIC FIELDS ==========
    ...(formData.radiologyExamCatalog?.length > 0 && { radiologyExamCatalog: formData.radiologyExamCatalog }),
    ...(formData.radiologyResultDeliveryMethods?.length > 0 && { radiologyResultDeliveryMethods: formData.radiologyResultDeliveryMethods }),
    radiologyAppointmentRequired: formData.radiologyAppointmentRequired || false,
    ...(formData.radiologyAccreditations?.length > 0 && { radiologyAccreditations: formData.radiologyAccreditations }),
    radiologistOnSite: formData.radiologistOnSite || false,

    // ========== PHARMACY-SPECIFIC FIELDS ==========
    isPharmacieDeGarde: formData.isPharmacieDeGarde || false,
    ...(formData.pharmacyServices?.length > 0 && { pharmacyServices: formData.pharmacyServices }),
    pharmacyDeliveryAvailable: formData.pharmacyDeliveryAvailable || false,
    ...(formData.pharmacyDeliveryZone && { pharmacyDeliveryZone: formData.pharmacyDeliveryZone }),
    ...(formData.pharmacyDeliveryFee && { pharmacyDeliveryFee: formData.pharmacyDeliveryFee }),
    ...(formData.pharmacyDeliveryHours && { pharmacyDeliveryHours: formData.pharmacyDeliveryHours }),
    ...(formData.pharmacyDutyPhone && { pharmacyDutyPhone: formData.pharmacyDutyPhone }),
    pharmacyNightBell: formData.pharmacyNightBell || false,
    ...(formData.pharmacyGardeSchedule?.length > 0 && { pharmacyGardeSchedule: formData.pharmacyGardeSchedule }),
    ...(formData.pharmacyStockInfo && { pharmacyStockInfo: formData.pharmacyStockInfo }),

    // ========== BLOOD CABIN ENHANCED FIELDS ==========
    ...(Object.keys(formData.bloodStockLevels || {}).length > 0 && { bloodStockLevels: formData.bloodStockLevels }),
    ...(formData.urgentBloodType && { urgentBloodType: formData.urgentBloodType }),
    bloodCabinWalkInAllowed: formData.bloodCabinWalkInAllowed ?? true,
    ...(formData.donationCampaigns?.length > 0 && { donationCampaigns: formData.donationCampaigns }),
    ...(formData.mobileDonationUnits?.length > 0 && { mobileDonationUnits: formData.mobileDonationUnits }),
    ...(formData.donationPreparationGuidelines && { donationPreparationGuidelines: formData.donationPreparationGuidelines }),
    ...(formData.minDaysBetweenDonations && { minDaysBetweenDonations: formData.minDaysBetweenDonations }),
    ...(formData.totalDonationsReceived && { totalDonationsReceived: formData.totalDonationsReceived }),

    // ========== MEDICAL EQUIPMENT ENHANCED FIELDS ==========
    ...(formData.equipmentBusinessTypes?.length > 0 && { equipmentBusinessTypes: formData.equipmentBusinessTypes }),
    installationAvailable: formData.installationAvailable || false,
    ...(formData.catalogPdfUrl && { catalogPdfUrl: formData.catalogPdfUrl }),
    ...(formData.equipmentCatalog?.length > 0 && { equipmentCatalog: formData.equipmentCatalog }),
    ...(formData.equipmentBrands?.length > 0 && { equipmentBrands: formData.equipmentBrands }),
    maintenanceServiceAvailable: formData.maintenanceServiceAvailable || false,
    technicalSupportAvailable: formData.technicalSupportAvailable || false,
    ...(formData.technicalSupportPhone && { technicalSupportPhone: formData.technicalSupportPhone }),
    ...(formData.equipmentDeliveryZone && { equipmentDeliveryZone: formData.equipmentDeliveryZone }),
    ...(formData.equipmentDeliveryFee && { equipmentDeliveryFee: formData.equipmentDeliveryFee }),

    // ========== HOSPITAL-SPECIFIC FIELDS ==========
    ...(formData.ambulancePhone && { ambulancePhone: formData.ambulancePhone }),
    ...(formData.receptionPhone && { receptionPhone: formData.receptionPhone }),
    ...(formData.adminPhone && { adminPhone: formData.adminPhone }),
    ...(formData.waitTimeMinutes != null && { waitTimeMinutes: formData.waitTimeMinutes }),
    ...(formData.waitTimeUpdatedAt && { waitTimeUpdatedAt: formData.waitTimeUpdatedAt }),
    ...(Object.keys(formData.departmentSchedules || {}).length > 0 && { departmentSchedules: formData.departmentSchedules }),
    ...(formData.landmarkDescription && { landmarkDescription: formData.landmarkDescription }),

    // ========== MATERNITY-SPECIFIC FIELDS ==========
    ...(formData.maternityEmergencyPhone && { maternityEmergencyPhone: formData.maternityEmergencyPhone }),
    ...(formData.deliveryRooms != null && { deliveryRooms: formData.deliveryRooms }),
    ...(formData.maternityServices?.length > 0 && { maternityServices: formData.maternityServices }),
    femaleStaffOnly: formData.femaleStaffOnly || false,
    pediatricianOnSite: formData.pediatricianOnSite || false,
    ...(formData.visitingHoursPolicy && { visitingHoursPolicy: formData.visitingHoursPolicy }),
    hasNICU: formData.hasNICU || false,

    // ========== CLINIC-SPECIFIC FIELDS ==========
    ...(formData.consultationRooms != null && { consultationRooms: formData.consultationRooms }),
    ...(formData.surgeriesOffered?.length > 0 && { surgeriesOffered: formData.surgeriesOffered }),
    ...(formData.doctorRoster?.length > 0 && { doctorRoster: formData.doctorRoster }),
    ...(formData.paymentMethods?.length > 0 && { paymentMethods: formData.paymentMethods }),
    parkingAvailable: formData.parkingAvailable || false,

    // ========== DOCTOR-SPECIFIC FIELDS ==========
    ...(formData.medicalSchool && { medicalSchool: formData.medicalSchool }),
    ...(formData.graduationYear != null && { graduationYear: formData.graduationYear }),
    ...(formData.yearsOfExperience != null && { yearsOfExperience: formData.yearsOfExperience }),
    ...(formData.secondarySpecialty && { secondarySpecialty: formData.secondarySpecialty }),
    ...(formData.homeVisitZone && { homeVisitZone: formData.homeVisitZone }),
    ...(formData.teleconsultationPlatform && { teleconsultationPlatform: formData.teleconsultationPlatform }),
    ...(formData.ordreMedecinsNumber && { ordreMedecinsNumber: formData.ordreMedecinsNumber }),
    trainedAbroad: formData.trainedAbroad || false,
    ...(formData.trainingCountry && { trainingCountry: formData.trainingCountry }),
    womenOnlyPractice: formData.womenOnlyPractice || false,
    ...(formData.patientTypes?.length > 0 && { patientTypes: formData.patientTypes }),

    // ========== DEFAULT VALUES ==========
    rating: 0,
    reviewsCount: 0,
    distance: 0,
    isOpen: false,
    accessible: formData.accessibilityFeatures.length > 0,
    emergency: formData.is24_7,
    
    // ========== VERIFICATION STATUS ==========
    verificationStatus: 'pending',
    isPublic: false,
    verified: false,
    
    // ========== TIMESTAMPS ==========
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    submittedAt: Timestamp.now(),
  };

  await setDoc(providerRef, providerData);
}

/**
 * Check if a provider already exists for a user
 */
export async function getExistingProvider(userId: string): Promise<string | null> {
  try {
    const providersRef = collection(db, 'providers');
    const q = query(providersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
    return null;
  } catch (error) {
    logError(error, 'getExistingProvider');
    return null;
  }
}

