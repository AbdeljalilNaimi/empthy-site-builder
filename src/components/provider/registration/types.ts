// Expanded Provider Types for Algeria Healthcare System
export type ProviderTypeKey = 
  | 'hospital' 
  | 'birth_hospital' 
  | 'clinic' 
  | 'doctor' 
  | 'pharmacy' 
  | 'lab' 
  | 'blood_cabin' 
  | 'radiology_center' 
  | 'medical_equipment'
  | '';

export type ProviderCategoryKey = 'care' | 'diagnosis' | 'specialized' | '';

export interface ProviderFormData {
  // Step 1: Account Creation
  providerType: ProviderTypeKey;
  providerCategory: ProviderCategoryKey;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;

  // Step 2: Basic Information
  facilityNameFr: string;
  facilityNameAr: string;
  legalRegistrationNumber: string;
  contactPersonName: string;
  contactPersonRole: string;
  phone: string;
  phoneVerified: boolean;
  emailVerified: boolean;

  // Step 3: Location & Availability
  address: string;
  city: string;
  area: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
  schedule: WeeklySchedule;
  is24_7: boolean;
  homeVisitAvailable: boolean;
  additionalLocations: AdditionalLocation[];

  // Step 4: Services & Specializations
  serviceCategories: string[];
  specialties: string[];
  departments: string[];
  equipment: string[];
  accessibilityFeatures: string[];
  languages: string[];

  // Care-specific fields (Step 4)
  emergencyCapable: boolean;
  consultationTypes: string[];
  numberOfBeds: number | null;
  hasReanimation: boolean;
  operatingBlocks: number | null;

  // Step 5: Profile Enhancement
  logo: File | null;
  logoPreview: string;
  galleryPhotos: File[];
  galleryPreviews: string[];
  description: string;
  insuranceAccepted: string[];
  consultationFee: string;
  socialLinks: SocialLinks;
  verificationDocuments: { name: string; type: 'license' | 'certificate' | 'photo' }[];

  // Type-Specific Fields (Blood Cabin)
  bloodTypes?: string[];
  urgentNeed?: boolean;
  stockStatus?: 'critical' | 'low' | 'normal' | 'high';
  bloodStockLevels: Record<string, 'critical' | 'low' | 'normal'>;
  urgentBloodType: string;

  // Type-Specific Fields (Radiology Center)
  imagingTypes?: string[];
  radiologyExamCatalog: RadiologyExam[];
  radiologyResultDeliveryMethods: string[];
  radiologyAppointmentRequired: boolean;
  radiologyAccreditations: string[];
  radiologistOnSite: boolean;

  // Type-Specific Fields (Medical Equipment)
  productCategories?: string[];
  rentalAvailable?: boolean;
  deliveryAvailable?: boolean;
  equipmentBusinessTypes: string[];
  installationAvailable: boolean;
  catalogPdfUrl: string;
  equipmentCatalog: EquipmentProduct[];
  equipmentBrands: string[];
  maintenanceServiceAvailable: boolean;
  technicalSupportAvailable: boolean;
  technicalSupportPhone: string;
  equipmentDeliveryZone: string;
  equipmentDeliveryFee: string;

  // Pharmacy-specific fields
  isPharmacieDeGarde: boolean;
  pharmacyServices: string[];
  pharmacyDeliveryAvailable: boolean;
  pharmacyDeliveryZone: string;
  pharmacyDeliveryFee: string;
  pharmacyDeliveryHours: string;
  pharmacyDutyPhone: string;
  pharmacyNightBell: boolean;
  pharmacyGardeSchedule: PharmacyGardeSlot[];
  pharmacyStockInfo: string;

  // Hospital-specific fields
  ambulancePhone: string;
  receptionPhone: string;
  adminPhone: string;
  waitTimeMinutes: number | null;
  waitTimeUpdatedAt: string | null;
  departmentSchedules: Record<string, { open: string; close: string }>;
  landmarkDescription: string;

  // Maternity-specific fields
  maternityEmergencyPhone: string;
  deliveryRooms: number | null;
  maternityServices: string[];
  femaleStaffOnly: boolean;
  pediatricianOnSite: boolean;
  visitingHoursPolicy: string;
  hasNICU: boolean;

  // Clinic-specific fields
  consultationRooms: number | null;
  surgeriesOffered: string[];
  doctorRoster: Array<{ name: string; specialty: string; consultationDays?: string; phone?: string }>;
  paymentMethods: string[];
  parkingAvailable: boolean;

  // Doctor-specific fields
  medicalSchool: string;
  graduationYear: number | null;
  yearsOfExperience: number | null;
  secondarySpecialty: string;
  homeVisitZone: string;
  teleconsultationPlatform: string;
  ordreMedecinsNumber: string;
  trainedAbroad: boolean;
  trainingCountry: string;
  womenOnlyPractice: boolean;
  patientTypes: string[];

  // Diagnosis-specific fields (Step 4)
  analysisTypes: string[];
  homeCollection: boolean;
  onlineResults: boolean;
  turnaroundHours: number | null;

  // Lab-specific fields
  labTestCatalog: LabTest[];
  labResultDeliveryMethods: string[];
  labAppointmentRequired: boolean;
  labAccreditations: string[];
  labFastingInfoNote: string;
  homeCollectionZone: string;
  homeCollectionFee: string;

  // Blood Cabin enhanced fields
  donationCampaigns: DonationCampaign[];
  bloodCabinWalkInAllowed: boolean;
  donationPreparationGuidelines: string;
  mobileDonationUnits: MobileDonationUnit[];
  minDaysBetweenDonations: number | null;
  totalDonationsReceived: number | null;

  // Flexible category-specific data
  specificFeatures: Record<string, any>;

  // Metadata
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isPublic: boolean;
}

export interface LabTest {
  id: string;
  name: string;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  turnaround: 'same_day' | '24h' | '48h' | '1_week';
  prescriptionRequired: boolean;
  fastingRequired: boolean;
  cnasCovered: boolean;
}

export interface RadiologyExam {
  id: string;
  name: string;
  imagingType: string;
  priceMin: number | null;
  priceMax: number | null;
  turnaround: 'same_day' | '24h' | '48h' | '1_week';
  prescriptionRequired: boolean;
  preparationInstructions: string;
  cnasCovered: boolean;
}

export interface EquipmentProduct {
  id: string;
  name: string;
  category: string;
  salePrice: number | null;
  rentalPricePerDay: number | null;
  availableFor: 'sale' | 'rental' | 'both';
  prescriptionRequired: boolean;
  cnasReimbursable: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order';
  brand: string;
}

export interface DonationCampaign {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

export interface MobileDonationUnit {
  id: string;
  name: string;
  schedule: string;
  area: string;
}

export interface PharmacyGardeSlot {
  id: string;
  startDate: string;
  endDate: string;
  note: string;
}

export const RADIOLOGY_ACCREDITATIONS = ['ISO 9001', 'Agrément ministériel', 'Accréditation COFRAC', 'Certification ARS'];

export const LAB_RESULT_DELIVERY_METHODS = ['En personne', 'Portail en ligne', 'WhatsApp PDF', 'Email'];

export const LAB_TURNAROUND_OPTIONS = [
  { key: 'same_day', label: 'Même jour' },
  { key: '24h', label: '24 heures' },
  { key: '48h', label: '48 heures' },
  { key: '1_week', label: '1 semaine' },
] as const;

export const LAB_ACCREDITATIONS = ['ISO 15189', 'ISO 9001', 'Agrément ministériel', 'Accréditation COFRAC'];

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface AdditionalLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

// Expanded Provider Type Labels
export const PROVIDER_TYPE_LABELS: Record<string, { fr: string; ar: string; en: string; icon: string; category: string }> = {
  hospital: { fr: 'Hôpital', ar: 'مستشفى', en: 'Hospital', icon: '🏥', category: 'medical' },
  birth_hospital: { fr: 'Maternité', ar: 'مستشفى الولادة', en: 'Maternity', icon: '👶', category: 'medical' },
  clinic: { fr: 'Clinique', ar: 'عيادة', en: 'Clinic', icon: '🏨', category: 'medical' },
  doctor: { fr: 'Cabinet Médical', ar: 'عيادة طبية', en: 'Medical Office', icon: '👨‍⚕️', category: 'medical' },
  pharmacy: { fr: 'Pharmacie', ar: 'صيدلية', en: 'Pharmacy', icon: '💊', category: 'pharmacy' },
  lab: { fr: 'Laboratoire d\'Analyses', ar: 'مختبر التحاليل', en: 'Laboratory', icon: '🔬', category: 'diagnostic' },
  blood_cabin: { fr: 'Centre de Don de Sang', ar: 'مركز التبرع بالدم', en: 'Blood Donation Center', icon: '🩸', category: 'diagnostic' },
  radiology_center: { fr: 'Centre de Radiologie', ar: 'مركز الأشعة', en: 'Radiology Center', icon: '📷', category: 'diagnostic' },
  medical_equipment: { fr: 'Équipement Médical', ar: 'معدات طبية', en: 'Medical Equipment', icon: '🦽', category: 'equipment' },
};

// Pharmacy Services
export const PHARMACY_SERVICES = [
  'Orthopédie',
  'Parapharmacie',
  'Préparation magistrale',
  'Homéopathie',
  'Phytothérapie',
  'Matériel médical',
  'Conseils nutritionnels',
  'Vaccination',
  'Test rapide (glycémie, tension)',
  'Livraison à domicile',
];

// Blood Types for Blood Cabin
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Stock Status Labels
export const STOCK_STATUS_LABELS: Record<string, { fr: string; ar: string; color: string }> = {
  critical: { fr: 'Critique', ar: 'حرج', color: 'destructive' },
  low: { fr: 'Faible', ar: 'منخفض', color: 'warning' },
  normal: { fr: 'Normal', ar: 'عادي', color: 'default' },
  high: { fr: 'Élevé', ar: 'مرتفع', color: 'success' },
};

// Imaging Types for Radiology
export const IMAGING_TYPES = [
  'Radiographie standard',
  'Scanner (CT)',
  'IRM',
  'Échographie',
  'Mammographie',
  'Panoramique dentaire',
  'Densitométrie osseuse',
  'Angiographie',
];

// Analysis Types for Laboratories
export const ANALYSIS_TYPES = [
  'Biologie médicale',
  'Hématologie',
  'Biochimie',
  'Sérologie',
  'Microbiologie',
  'Parasitologie',
  'Génétique',
  'Immunologie',
  'Toxicologie',
  'Anatomopathologie',
];

// Medical Equipment Categories
export const EQUIPMENT_CATEGORIES = [
  'Fauteuils roulants',
  'Lits médicalisés',
  'Oxygène médical',
  'Matériel de perfusion',
  'Prothèses',
  'Orthèses',
  'Matériel de rééducation',
  'Moniteurs de santé',
  'Aide à la mobilité',
];

export const SERVICE_CATEGORIES = [
  'Médecine générale',
  'Médecine spécialisée',
  'Chirurgie',
  'Urgences',
  'Radiologie',
  'Analyses médicales',
  'Kinésithérapie',
  'Soins dentaires',
  'Ophtalmologie',
  'Gynécologie',
  'Pédiatrie',
  'Cardiologie',
  'Dermatologie',
  'Neurologie',
  'Psychiatrie',
  'Pharmacie',
];

export const MEDICAL_SPECIALTIES = [
  'Médecine générale',
  'Cardiologie',
  'Dermatologie',
  'Gastro-entérologie',
  'Gynécologie-Obstétrique',
  'Neurologie',
  'Ophtalmologie',
  'ORL',
  'Orthopédie',
  'Pédiatrie',
  'Pneumologie',
  'Psychiatrie',
  'Radiologie',
  'Rhumatologie',
  'Urologie',
  'Anesthésie-Réanimation',
  'Chirurgie générale',
  'Médecine interne',
];

export const EQUIPMENT_OPTIONS = [
  'Scanner / CT',
  'IRM',
  'Radiographie',
  'Échographie',
  'ECG',
  'Laboratoire sur place',
  'Bloc opératoire',
  'Salle d\'accouchement',
  'Réanimation',
  'Dialyse',
  'Stérilisation',
  'Oxygène médical',
];

export const ACCESSIBILITY_OPTIONS = [
  'Accès fauteuil roulant',
  'Ascenseur',
  'Parking handicapé',
  'Toilettes adaptées',
  'Signalétique braille',
  'Personnel formé LSF',
  'Audio-guidage',
];

export const INSURANCE_OPTIONS = [
  'CNAS',
  'CASNOS',
  'Assurance privée',
  'Mutuelles',
  'Tiers payant',
  'Sans assurance (paiement direct)',
];

export const LANGUAGES_OPTIONS = [
  { code: 'ar', label: 'العربية (Arabe)' },
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'amazigh', label: 'ⵜⴰⵎⴰⵣⵉⵖⵜ (Amazigh)' },
];

export const EQUIPMENT_BUSINESS_TYPES = [
  { key: 'sale', label: 'Vente', icon: 'ShoppingBag' },
  { key: 'rental', label: 'Location', icon: 'RefreshCw' },
  { key: 'repair', label: 'Réparation', icon: 'Wrench' },
] as const;

export const EQUIPMENT_PRODUCT_CATEGORIES = [
  'Mobilité (fauteuils, déambulateurs)',
  'Orthopédie (attelles, corsets, semelles)',
  'Monitoring (tensiomètre, oxymètre, glucomètre)',
  'Consommables (compresses, seringues, sondes)',
  'Lits médicalisés & matelas',
  'Oxygénothérapie',
  'Aide respiratoire',
  'Prothèses',
  'Rééducation',
  'Matériel de perfusion',
];

export const EQUIPMENT_STOCK_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  in_stock: { label: 'En stock', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  low_stock: { label: 'Stock faible', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  out_of_stock: { label: 'Rupture', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  on_order: { label: 'En commande', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

export const COMMON_EQUIPMENT_BRANDS = [
  'Invacare', 'Thuasne', 'Ottobock', 'DJO Global', 'Sunrise Medical',
  'Drive DeVilbiss', 'Coloplast', 'Omron', 'Philips', 'ResMed',
  'Medela', 'Weinmann', 'Salter Labs', 'Hartmann', 'Mölnlycke',
];


export const MATERNITY_SERVICES = [
  'Accouchement normal',
  'Césarienne',
  'Péridurale',
  'Réanimation néonatale (NICU)',
  'Suivi prénatal',
  'Suivi postnatal',
  'Échographie obstétricale',
  'Préparation à la naissance',
  'Allaitement - consultation',
];

// Clinic Surgery Types
export const SURGERY_TYPES = [
  'Chirurgie générale',
  'Chirurgie orthopédique',
  'Chirurgie cardiaque',
  'Chirurgie ophtalmologique',
  'Chirurgie ORL',
  'Chirurgie urologique',
  'Chirurgie plastique',
  'Chirurgie bariatrique',
  'Endoscopie',
];

// Clinic Payment Methods
export const PAYMENT_METHODS = [
  'Espèces',
  'CCP/Baridi Mob',
  'Carte bancaire',
  'Tiers payant CNAS',
  'Tiers payant assurance privée',
  'Chèque',
];

// Doctor Patient Types
export const PATIENT_TYPES = [
  'Adultes',
  'Enfants',
  'Femmes uniquement',
  'Nourrissons',
  'Personnes âgées',
];

// Teleconsultation Platforms
export const TELECONSULTATION_PLATFORMS = [
  'WhatsApp Video',
  'Zoom',
  'Google Meet',
  'Téléphone uniquement',
];

export const CONSULTATION_TYPES = [
  { key: 'in_person', label: 'En cabinet', icon: 'Building2' },
  { key: 'teleconsultation', label: 'Téléconsultation', icon: 'Video' },
  { key: 'home_visit', label: 'Visite à domicile', icon: 'Home' },
] as const;

export const DEFAULT_SCHEDULE: WeeklySchedule = {
  monday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  tuesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  wednesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  thursday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  friday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  saturday: { isOpen: true, openTime: '08:00', closeTime: '12:00' },
  sunday: { isOpen: false, openTime: '08:00', closeTime: '12:00' },
};

export const getInitialFormData = (): ProviderFormData => ({
  providerType: '',
  providerCategory: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  facilityNameFr: '',
  facilityNameAr: '',
  legalRegistrationNumber: '',
  contactPersonName: '',
  contactPersonRole: '',
  phone: '',
  phoneVerified: false,
  emailVerified: false,
  address: '',
  city: 'Sidi Bel Abbès',
  area: '',
  postalCode: '',
  lat: null,
  lng: null,
  schedule: DEFAULT_SCHEDULE,
  is24_7: false,
  homeVisitAvailable: false,
  additionalLocations: [],
  serviceCategories: [],
  specialties: [],
  departments: [],
  equipment: [],
  accessibilityFeatures: [],
  languages: ['fr', 'ar'],
  // Care-specific defaults
  emergencyCapable: false,
  consultationTypes: ['in_person'],
  numberOfBeds: null,
  hasReanimation: false,
  operatingBlocks: null,
  logo: null,
  logoPreview: '',
  galleryPhotos: [],
  galleryPreviews: [],
  description: '',
  insuranceAccepted: [],
  consultationFee: '',
  socialLinks: {},
  verificationDocuments: [],
  specificFeatures: {},
  // Type-specific fields
  bloodTypes: [],
  urgentNeed: false,
  stockStatus: 'normal',
  bloodStockLevels: {},
  urgentBloodType: '',
  // Blood Cabin enhanced defaults
  donationCampaigns: [],
  bloodCabinWalkInAllowed: true,
  donationPreparationGuidelines: '',
  mobileDonationUnits: [],
  minDaysBetweenDonations: 56,
  totalDonationsReceived: null,
  imagingTypes: [],
  radiologyExamCatalog: [],
  radiologyResultDeliveryMethods: [],
  radiologyAppointmentRequired: true,
  radiologyAccreditations: [],
  radiologistOnSite: false,
  productCategories: [],
  rentalAvailable: false,
  deliveryAvailable: false,
  equipmentBusinessTypes: [],
  installationAvailable: false,
  catalogPdfUrl: '',
  equipmentCatalog: [],
  equipmentBrands: [],
  maintenanceServiceAvailable: false,
  technicalSupportAvailable: false,
  technicalSupportPhone: '',
  equipmentDeliveryZone: '',
  equipmentDeliveryFee: '',
  isPharmacieDeGarde: false,
  pharmacyServices: [],
  pharmacyDeliveryAvailable: false,
  pharmacyDeliveryZone: '',
  pharmacyDeliveryFee: '',
  pharmacyDeliveryHours: '',
  pharmacyDutyPhone: '',
  pharmacyNightBell: false,
  pharmacyGardeSchedule: [],
  pharmacyStockInfo: '',
  // Hospital-specific defaults
  ambulancePhone: '',
  receptionPhone: '',
  adminPhone: '',
  waitTimeMinutes: null,
  waitTimeUpdatedAt: null,
  departmentSchedules: {},
  landmarkDescription: '',
  // Maternity-specific defaults
  maternityEmergencyPhone: '',
  deliveryRooms: null,
  maternityServices: [],
  femaleStaffOnly: false,
  pediatricianOnSite: false,
  visitingHoursPolicy: '',
  hasNICU: false,
  // Clinic-specific defaults
  consultationRooms: null,
  surgeriesOffered: [],
  doctorRoster: [],
  paymentMethods: [],
  parkingAvailable: false,
  // Doctor-specific defaults
  medicalSchool: '',
  graduationYear: null,
  yearsOfExperience: null,
  secondarySpecialty: '',
  homeVisitZone: '',
  teleconsultationPlatform: '',
  ordreMedecinsNumber: '',
  trainedAbroad: false,
  trainingCountry: '',
  womenOnlyPractice: false,
  patientTypes: [],
  // Diagnosis-specific defaults
  analysisTypes: [],
  homeCollection: false,
  onlineResults: false,
  turnaroundHours: null,
  // Lab-specific defaults
  labTestCatalog: [],
  labResultDeliveryMethods: [],
  labAppointmentRequired: false,
  labAccreditations: [],
  labFastingInfoNote: '',
  homeCollectionZone: '',
  homeCollectionFee: '',
  // Metadata
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'draft',
  verificationStatus: 'pending',
  isPublic: false,
});

// Helper to get type-specific fields config
export const getTypeSpecificFields = (providerType: ProviderTypeKey) => {
  switch (providerType) {
    case 'blood_cabin':
      return {
        showBloodTypes: true,
        showStockStatus: true,
        showUrgentNeed: true,
      };
    case 'radiology_center':
      return {
        showImagingTypes: true,
      };
    case 'medical_equipment':
      return {
        showProductCategories: true,
        showRentalOption: true,
        showDeliveryOption: true,
      };
    default:
      return {};
  }
};
