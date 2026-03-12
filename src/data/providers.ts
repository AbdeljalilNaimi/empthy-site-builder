// Centralized mock data and localStorage utilities for CityHealth
// NOTE: This is a frontend-only data layer for the MVP (no backend)

// Expanded Provider Types for Algeria Healthcare System
export type ProviderType = 
  | 'doctor' 
  | 'clinic' 
  | 'pharmacy' 
  | 'lab' 
  | 'hospital'
  | 'birth_hospital'
  | 'blood_cabin'
  | 'radiology_center'
  | 'medical_equipment';

export type Lang = 'ar' | 'fr' | 'en';

// Import from canonical source (re-exported for backwards compatibility)
import type { VerificationStatus as VerificationStatusType } from '@/types/provider';
export type VerificationStatus = VerificationStatusType;

// Opening hours for a day
export interface DaySchedule {
  open: string;
  close: string;
  closed?: boolean;
}

// Weekly schedule
export interface WeeklySchedule {
  lundi?: DaySchedule;
  mardi?: DaySchedule;
  mercredi?: DaySchedule;
  jeudi?: DaySchedule;
  vendredi?: DaySchedule;
  samedi?: DaySchedule;
  dimanche?: DaySchedule;
}

// Review for a provider
export interface ProviderReview {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CityHealthProvider {
  id: string;
  name: string;
  type: ProviderType;
  specialty?: string;
  rating: number;
  reviewsCount: number;
  distance: number; // km from city center (mocked)
  /** @deprecated Use verificationStatus === 'verified' via isProviderVerified() utility */
  verified: boolean;
  emergency: boolean;
  accessible: boolean;
  isOpen: boolean;
  address: string;
  city: string;
  area: string;
  phone: string;
  image: string;
  lat: number;
  lng: number;
  languages: Lang[];
  description: string;
  
  // ========== VERIFICATION FIELDS ==========
  verificationStatus: VerificationStatus;
  isPublic: boolean;
  verificationRevokedAt?: Date | string;
  verificationRevokedReason?: string;
  
  // ========== TYPE-SPECIFIC FIELDS ==========
  bloodTypes?: string[];
  urgentNeed?: boolean;
  stockStatus?: 'critical' | 'low' | 'normal' | 'high';
  imagingTypes?: string[];
  // Medical equipment specific
  productCategories?: string[];
  rentalAvailable?: boolean;
  deliveryAvailable?: boolean;
  
  // ========== HOSPITAL-SPECIFIC FIELDS ==========
  ambulancePhone?: string;
  receptionPhone?: string;
  adminPhone?: string;
  waitTimeMinutes?: number | null;
  waitTimeUpdatedAt?: string | null;
  departmentSchedules?: Record<string, { open: string; close: string }>;
  landmarkDescription?: string;
  
  // ========== MATERNITY-SPECIFIC FIELDS ==========
  maternityEmergencyPhone?: string;
  deliveryRooms?: number | null;
  maternityServices?: string[];
  femaleStaffOnly?: boolean;
  pediatricianOnSite?: boolean;
  visitingHoursPolicy?: string;
  hasNICU?: boolean;
  
  // ========== CLINIC-SPECIFIC FIELDS ==========
  consultationRooms?: number | null;
  surgeriesOffered?: string[];
  doctorRoster?: Array<{ name: string; specialty: string }>;
  paymentMethods?: string[];
  parkingAvailable?: boolean;
  
  // ========== DOCTOR-SPECIFIC FIELDS ==========
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
  
  // ========== PROFILE FIELDS - CANONICAL NAMES ==========
  /** Gallery images - CANONICAL (not galleryImages) */
  gallery?: string[];
  schedule?: WeeklySchedule | null;
  reviews?: ProviderReview[];
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  } | null;
  departments?: string[];
  /** Consultation fee (can be number or null) */
  consultationFee?: number | null;
  /** Accepted insurances - CANONICAL (not insuranceAccepted) */
  insurances?: string[];
  /** @deprecated Use insurances instead */
  insuranceAccepted?: string[];
  website?: string | null;
  email?: string | null;
  /** Service categories - CANONICAL (not serviceCategories) */
  services?: string[];
  specialties?: string[];
  accessibilityFeatures?: string[];
  equipment?: string[];
  
  // ========== IDENTITY FIELDS (Sensitive) ==========
  legalRegistrationNumber?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  postalCode?: string;
  facilityNameFr?: string;
  facilityNameAr?: string;
  
  // ========== CATEGORY FIELDS ==========
  /** Parent category: care, diagnosis, or specialized */
  providerCategory?: 'care' | 'diagnosis' | 'specialized';
  /** Flexible key-value store for category-specific data */
  specificFeatures?: Record<string, any>;
  
  // ========== ADDITIONAL BUSINESS FIELDS ==========
  homeVisitAvailable?: boolean;
  is24_7?: boolean;
  
  // ========== CATEGORY-SPECIFIC FIELDS ==========
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
  // Blood Cabin
  bloodStockLevels?: Record<string, string>;
  urgentBloodType?: string;
  bloodCabinWalkInAllowed?: boolean;
  donationCampaigns?: Array<{ id: string; title: string; date: string; location: string; description: string }>;
  mobileDonationUnits?: Array<{ id: string; name: string; schedule: string; area: string }>;
  donationPreparationGuidelines?: string;
  minDaysBetweenDonations?: number | null;
  totalDonationsReceived?: number | null;
  // Medical Equipment
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

  // ========== PLAN TYPE ==========
  planType?: 'basic' | 'standard' | 'premium';

  // ========== ACCOUNT SETTINGS ==========
  settings?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    appointmentReminders?: boolean;
    marketingEmails?: boolean;
    showPhoneOnProfile?: boolean;
    showEmailOnProfile?: boolean;
    allowReviews?: boolean;
    language?: string;
  };
}

// Provider Type Labels (French/Arabic/English)
export const PROVIDER_TYPE_LABELS: Record<ProviderType, { fr: string; ar: string; en: string; icon: string }> = {
  hospital: { fr: 'Hôpital', ar: 'مستشفى', en: 'Hospital', icon: '🏥' },
  birth_hospital: { fr: 'Maternité', ar: 'مستشفى الولادة', en: 'Maternity', icon: '👶' },
  clinic: { fr: 'Clinique', ar: 'عيادة', en: 'Clinic', icon: '🏨' },
  doctor: { fr: 'Cabinet Médical', ar: 'عيادة طبية', en: 'Medical Office', icon: '👨‍⚕️' },
  pharmacy: { fr: 'Pharmacie', ar: 'صيدلية', en: 'Pharmacy', icon: '💊' },
  lab: { fr: 'Laboratoire d\'Analyses', ar: 'مختبر التحاليل', en: 'Laboratory', icon: '🔬' },
  blood_cabin: { fr: 'Centre de Don de Sang', ar: 'مركز التبرع بالدم', en: 'Blood Donation Center', icon: '🩸' },
  radiology_center: { fr: 'Centre de Radiologie', ar: 'مركز الأشعة', en: 'Radiology Center', icon: '📷' },
  medical_equipment: { fr: 'Équipement Médical', ar: 'معدات طبية', en: 'Medical Equipment', icon: '🦽' },
};

export const SPECIALTIES = [
  'Médecine générale',
  'Cardiologie',
  'Dermatologie',
  'Pédiatrie',
  'Gynécologie',
  'Ophtalmologie',
  'Dentisterie',
  'Radiologie',
  'Analyses médicales',
];

export const PROVIDER_TYPES: ProviderType[] = [
  'doctor',
  'clinic',
  'pharmacy',
  'lab',
  'hospital',
  'birth_hospital',
  'blood_cabin',
  'radiology_center',
  'medical_equipment',
];

export const AREAS = [
  'Centre Ville',
  'Hay El Badr',
  'Sidi Bel Abbès Est',
  'Sidi Bel Abbès Ouest',
  'Périphérie Nord',
  'Périphérie Sud',
];

const STORAGE_KEYS = {
  providers: 'ch_providers_v3',
  favorites: 'ch_favorites_v1',
}

function randomFrom<T>(arr: T[], i: number) {
  return arr[i % arr.length]
}

function pseudoRandom(i: number, min: number, max: number) {
  // deterministic pseudo-random based on index
  const x = Math.sin(i + 1) * 10000
  const frac = x - Math.floor(x)
  return Math.round((min + frac * (max - min)) * 10) / 10
}

function genPhone(i: number) {
  const a = 48
  const b = 50 + (i % 50)
  const c = 10 + (i % 40)
  const d = 10 + ((i * 3) % 40)
  return `+213 ${a} ${b.toString().padStart(2, '0')} ${c.toString().padStart(2, '0')} ${d.toString().padStart(2, '0')}`
}

function makeName(type: ProviderType, specialty: string | undefined, i: number) {
  switch (type) {
    case 'doctor':
      return `Dr. ${['Ahmed', 'Sara', 'Youssef', 'Imen', 'Nadia', 'Khaled', 'Rania', 'Leila', 'Mohamed', 'Amira'][i % 10]} ${['Benali', 'Bendaoud', 'Merabet', 'Saadi', 'Zerrouki', 'Boudiaf', 'Cherif', 'Mesbah'][i % 8]}${specialty ? ' - ' + specialty : ''}`
    case 'clinic':
      return `Clinique ${['El Amal', 'El Chifa', 'Ibn Sina', 'An Nasr', 'El Rahma', 'El Hayat', 'Sidi Bel Abbès'][i % 7]}`
    case 'pharmacy':
      return `Pharmacie ${['Centrale', 'El Fajr', 'El Baraka', 'El Wafa', 'Ibn Rochd', 'El Afia'][i % 6]}`
    case 'lab':
      return `Laboratoire ${['Atlas', 'Pasteur', 'BioLab', 'El Yakine', 'Alpha Bio', 'MedLab'][i % 6]}`
    case 'hospital':
      return `Hôpital ${['Universitaire de SBA', 'Régional Hassani', 'Privé Al Hayat', 'Militaire'][i % 4]}`
    case 'birth_hospital':
      return `Maternité ${['El Amel', 'Sidi Bel Abbès', 'El Afya', 'Mère et Enfant'][i % 4]}`
    case 'blood_cabin':
      return `Centre de Don de Sang ${['Central', 'El Wiam', 'Croissant Rouge', 'Universitaire'][i % 4]}`
    case 'radiology_center':
      return `Centre de Radiologie ${['El Nour', 'ImagiMed', 'ScanPlus', 'RadioDiag'][i % 4]}`
    case 'medical_equipment':
      return `${['MedEquip', 'OrthoPharma', 'SBA MedTech', 'Al Shifa Équipements', 'SantéPlus'][i % 5]}`
    default:
      return `Prestataire ${i + 1}`
  }
}

function makeDescription(type: ProviderType) {
  const base = 'Service de santé de confiance à Sidi Bel Abbès, avec une équipe dédiée et des équipements modernes.'
  switch (type) {
    case 'doctor':
      return base + ' Consultation sur rendez-vous, suivi personnalisé et prévention.'
    case 'clinic':
      return base + ' Prise en charge pluridisciplinaire et urgences mineures.'
    case 'pharmacy':
      return base + ' Conseils pharmaceutiques, disponibilité 24/7 pour certaines officines.'
    case 'lab':
      return base + ' Analyses médicales rapides et précises, résultats numériques.'
    case 'hospital':
      return base + " Plateaux techniques complets et services d'urgences 24/7."
    case 'birth_hospital':
      return base + ' Suivi de grossesse, accouchement et soins néonatals.'
    case 'blood_cabin':
      return base + ' Don de sang volontaire, collecte et distribution de produits sanguins.'
    case 'radiology_center':
      return base + ' Imagerie médicale avancée : radiographie, échographie, scanner et IRM.'
    case 'medical_equipment':
      return base + " Vente, location et maintenance d'équipements médicaux professionnels."
    default:
      return base
  }
}

export function generateMockProviders(count = 50): CityHealthProvider[] {
  const centerLat = 35.1975;
  const centerLng = -0.6300;
  const list: CityHealthProvider[] = [];
  
  // First, add dedicated ophthalmologists to ensure coverage
  const dedicatedDoctors: Array<{ name: string; specialty: string; area: string }> = [
    { name: "Dr. Amina Belkacemi - Ophtalmologie", specialty: "Ophtalmologie", area: "Centre Ville" },
    { name: "Dr. Rachid Mesbah - Ophtalmologie", specialty: "Ophtalmologie", area: "Hay El Badr" },
    { name: "Dr. Fatima Cherif - Cardiologie", specialty: "Cardiologie", area: "Centre Ville" },
    { name: "Dr. Omar Boudiaf - Pédiatrie", specialty: "Pédiatrie", area: "Sidi Bel Abbès Est" },
  ];

  dedicatedDoctors.forEach((doc, idx) => {
    const i = count + idx;
    const lat = centerLat + (pseudoRandom(i, -0.02, 0.02) as number);
    const lng = centerLng + (pseudoRandom(i + 3, -0.02, 0.02) as number);
    list.push({
      id: `doc-${idx + 1}`,
      name: doc.name,
      type: 'doctor',
      specialty: doc.specialty,
      rating: 4.5 + (idx % 3) * 0.2,
      reviewsCount: 30 + idx * 15,
      distance: pseudoRandom(i, 0.5, 5),
      verified: true,
      emergency: false,
      accessible: true,
      isOpen: true,
      address: `${10 + idx} Boulevard de la Santé, ${doc.area}`,
      city: 'Sidi Bel Abbès',
      area: doc.area,
      phone: genPhone(i),
      image: '/placeholder.svg',
      lat,
      lng,
      languages: ['fr', 'ar'],
      description: `Spécialiste en ${doc.specialty} à Sidi Bel Abbès. Consultation sur rendez-vous, suivi personnalisé.`,
      verificationStatus: 'verified',
      isPublic: true,
    });
  });

  for (let i = 0; i < count; i++) {
    const type = randomFrom(PROVIDER_TYPES, i);
    const specialty = type === 'doctor' ? randomFrom(SPECIALTIES, i) 
      : type === 'lab' ? 'Analyses médicales' 
      : type === 'pharmacy' ? 'Pharmacie' 
      : type === 'radiology_center' ? randomFrom(['Radiologie générale', 'Scanner', 'IRM', 'Échographie'], i)
      : type === 'birth_hospital' ? 'Obstétrique & Néonatalogie'
      : type === 'medical_equipment' ? randomFrom(['Orthopédie', 'Respiratoire', 'Mobilité', 'Diagnostic'], i)
      : type === 'blood_cabin' ? 'Hématologie'
      : undefined;
    const rating = Math.min(5, Math.max(3.6, 3.5 + (i % 15) * 0.1 + (i % 3) * 0.05));
    const distance = pseudoRandom(i, 0.3, 18);
    const lat = centerLat + (pseudoRandom(i, -0.03, 0.03) as number);
    const lng = centerLng + (pseudoRandom(i + 3, -0.03, 0.03) as number);
    const verified = i % 3 !== 0;
    const emergency = type === 'hospital' || type === 'birth_hospital' || (i % 17 === 0);
    const accessible = i % 4 !== 0;
    const isOpen = i % 5 !== 0;
    const area = randomFrom(AREAS, i);
    const languages: Lang[] = (() => { const arr: Lang[] = ['fr']; if (i % 2 === 0) arr.push('ar'); if (i % 5 === 0) arr.push('en'); return arr; })();
    
    // Default to verified for mock data display
    const verificationStatus: VerificationStatus = verified ? 'verified' : 'pending';
    const isPublic = verificationStatus === 'verified';

    const item: CityHealthProvider = {
      id: (i + 1).toString(),
      name: makeName(type, specialty, i),
      type,
      specialty,
      rating: Math.round(rating * 10) / 10,
      reviewsCount: 20 + (i % 120),
      distance,
      verified,
      emergency,
      accessible,
      isOpen,
      address: `${1 + (i % 90)} Rue principale, ${area}`,
      city: 'Sidi Bel Abbès',
      area,
      phone: genPhone(i),
      image: '/placeholder.svg',
      lat,
      lng,
      languages,
      description: makeDescription(type),
      verificationStatus,
      isPublic,
      // Type-specific fields for blood_cabin
      ...(type === 'blood_cabin' ? {
        bloodTypes: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].slice(0, (i % 4) + 2),
        urgentNeed: i % 7 === 0,
        stockStatus: (['normal', 'low', 'critical', 'high'] as const)[i % 4],
      } : {}),
      // Type-specific fields for radiology_center
      ...(type === 'radiology_center' ? {
        imagingTypes: ['Radiographie standard', 'Scanner (CT)', 'Échographie', 'IRM'].slice(0, (i % 3) + 1),
      } : {}),
      // Type-specific fields for medical_equipment
      ...(type === 'medical_equipment' ? {
        productCategories: ['Fauteuils roulants', 'Oxygénothérapie', 'Lits médicaux', 'Prothèses'].slice(0, (i % 3) + 1),
        rentalAvailable: i % 2 === 0,
        deliveryAvailable: i % 3 !== 0,
      } : {}),
      // Type-specific fields for birth_hospital
      ...(type === 'birth_hospital' ? {
        deliveryRooms: 2 + (i % 4),
        maternityServices: ['Accouchement naturel', 'Césarienne', 'Suivi post-natal'].slice(0, (i % 2) + 2),
        pediatricianOnSite: i % 2 === 0,
        hasNICU: i % 3 === 0,
      } : {}),
    };
    list.push(item);
  }
  return list;
}

export function seedProvidersIfNeeded(count = 50) {
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.providers)
    if (!existing) {
      const gen = generateMockProviders(count)
      localStorage.setItem(STORAGE_KEYS.providers, JSON.stringify(gen))
    }
  } catch (e) {
    // ignore storage errors in restricted environments
  }
}

export function getProviders(): CityHealthProvider[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.providers)
    if (!raw) return []
    return JSON.parse(raw) as CityHealthProvider[]
  } catch {
    return []
  }
}

export function getProviderById(id: string): CityHealthProvider | undefined {
  return getProviders().find((p) => p.id === id)
}

export function getFavoriteIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '[]') as string[]
  } catch {
    return []
  }
}

export function isFavorite(id: string): boolean {
  return getFavoriteIds().includes(id)
}

export function toggleFavorite(id: string): boolean {
  try {
    const ids = getFavoriteIds()
    const idx = ids.indexOf(id)
    if (idx >= 0) ids.splice(idx, 1)
    else ids.push(id)
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(ids))
    return ids.includes(id)
  } catch {
    return false
  }
}

export function getFavoriteProviders(): CityHealthProvider[] {
  const ids = new Set(getFavoriteIds())
  return getProviders().filter((p) => ids.has(p.id))
}

// Legacy export for backward compatibility
export const providers = getProviders();
