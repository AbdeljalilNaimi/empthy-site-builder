/**
 * Category Configuration Registry
 * 
 * Central source of truth for category-specific behavior.
 * Maps each provider category/sub-type to its registration sections,
 * profile modules, and feature keys.
 */

export type ProviderCategoryId = 'care' | 'diagnosis' | 'specialized';

export interface CategoryFieldConfig {
  /** Which extra form sections to show during registration */
  registrationSections: string[];
  /** Which layout modules to load on the public profile */
  profileModules: string[];
  /** Which specificFeatures keys are relevant */
  featureKeys: string[];
  /** Category-specific required features for validation */
  requiredFeatures?: string[];
}

export const CATEGORY_CONFIGS: Record<ProviderCategoryId, CategoryFieldConfig> = {
  care: {
    registrationSections: [
      'specialties', 'emergencyToggle', 'infrastructure',
      'consultationType', 'consultationFee', 'homeVisit', 'departments'
    ],
    profileModules: [
      'SpecialtiesHeader', 'EmergencyBadge', 'InfrastructureInfo',
      'AppointmentWidget', 'ConsultationInfo'
    ],
    featureKeys: [
      'acceptsWalkIns', 'teleconsultation', 'emergencyCapable',
      'numberOfBeds', 'hasReanimation', 'operatingBlocks', 'consultationTypes'
    ],
  },
  diagnosis: {
    registrationSections: [
      'imagingTypes', 'analysisTypes', 'diagnosticOptions',
      'turnaroundTime', 'equipment'
    ],
    profileModules: [
      'PlateauTechnique', 'OnlineResults', 'HomeCollection',
      'TurnaroundTime', 'EquipmentList'
    ],
    featureKeys: [
      'onlineResults', 'homeCollection', 'turnaroundHours',
      'imagingTypes', 'analysisTypes'
    ],
  },
  specialized: {
    registrationSections: ['productCategories', 'bloodTypes', 'stockStatus', 'delivery', 'pharmacieDeGarde', 'insurances'],
    profileModules: ['ProductCatalog', 'StockStatus', 'DeliveryInfo', 'PharmacieDeGardeBadge'],
    featureKeys: ['deliveryAvailable', 'rentalAvailable', 'urgentNeed', 'isPharmacieDeGarde'],
  },
};

/** Sub-type overrides for more granular control than category level */
export const SUBTYPE_OVERRIDES: Partial<Record<string, Partial<CategoryFieldConfig>>> = {
  blood_cabin: {
    registrationSections: [
      'bloodTypes', 'bloodStockLevels', 'urgentAlert',
      'bloodCabinWalkIn', 'donationCampaigns', 'mobileDonationUnits',
      'donationPreparationGuidelines', 'donationStats'
    ],
    profileModules: [
      'BloodStockDashboard', 'UrgentAlert', 'WalkInBadge',
      'DonationCampaignCalendar', 'MobileDonationSchedule',
      'PreparationGuidelines', 'DonationCounter', 'MinWaitTime'
    ],
    featureKeys: [
      'bloodTypes', 'urgentNeed', 'bloodStockLevels', 'urgentBloodType',
      'bloodCabinWalkInAllowed', 'donationCampaigns', 'mobileDonationUnits',
      'donationPreparationGuidelines', 'minDaysBetweenDonations',
      'totalDonationsReceived'
    ],
  },
  pharmacy: {
    registrationSections: [
      'pharmacieDeGarde', 'pharmacyGardeSchedule', 'pharmacyDutyPhone',
      'pharmacyServices', 'pharmacyDelivery', 'pharmacyStockInfo', 'insurances'
    ],
    profileModules: [
      'PharmacieDeGardeBadge', 'GardeScheduleCalendar', 'DutyPhoneCard',
      'PharmacyServices', 'DeliveryInfo', 'StockInfo', 'InsuranceList',
      'NightBellBadge'
    ],
    featureKeys: [
      'isPharmacieDeGarde', 'pharmacyServices', 'insuranceAccepted',
      'pharmacyDeliveryAvailable', 'pharmacyDeliveryZone', 'pharmacyDeliveryFee',
      'pharmacyDeliveryHours', 'pharmacyDutyPhone', 'pharmacyNightBell',
      'pharmacyGardeSchedule', 'pharmacyStockInfo'
    ],
  },
  radiology_center: {
    registrationSections: [
      'imagingTypes', 'radiologyExamCatalog', 'radiologyResultDelivery',
      'diagnosticOptions', 'radiologyAppointmentRequired', 'radiologistOnSite',
      'radiologyAccreditations', 'insurances'
    ],
    profileModules: [
      'PlateauTechnique', 'ExamCatalog', 'ResultDelivery',
      'OnlineResults', 'TurnaroundTime', 'RadiologistOnSiteBadge',
      'AccreditationDisplay', 'InsuranceList', 'PreparationInstructions'
    ],
    featureKeys: [
      'imagingTypes', 'onlineResults', 'turnaroundHours',
      'radiologyExamCatalog', 'radiologyResultDeliveryMethods',
      'radiologyAppointmentRequired', 'radiologyAccreditations',
      'radiologistOnSite'
    ],
  },
  lab: {
    registrationSections: [
      'analysisTypes', 'labTestCatalog', 'labResultDelivery',
      'diagnosticOptions', 'labAppointmentRequired', 'labAccreditations',
      'labFastingInfo', 'insurances'
    ],
    profileModules: [
      'PlateauTechnique', 'TestCatalog', 'ResultDelivery',
      'OnlineResults', 'HomeCollection', 'TurnaroundTime',
      'AccreditationDisplay', 'FastingInfo', 'InsuranceList'
    ],
    featureKeys: [
      'analysisTypes', 'onlineResults', 'homeCollection', 'turnaroundHours',
      'labTestCatalog', 'labResultDeliveryMethods', 'labAppointmentRequired',
      'labAccreditations', 'labFastingInfoNote', 'homeCollectionZone',
      'homeCollectionFee'
    ],
  },
  hospital: {
    registrationSections: [
      'specialties', 'emergencyToggle', 'infrastructure', 'departments',
      'ambulanceContact', 'multiplePhones', 'departmentHours', 'waitTime'
    ],
    profileModules: [
      'SpecialtiesHeader', 'EmergencyBadge', 'InfrastructureInfo',
      'AppointmentWidget', 'DepartmentList', 'WaitTimeDisplay',
      'AmbulanceContact', 'DepartmentHours'
    ],
    featureKeys: [
      'emergencyCapable', 'numberOfBeds', 'hasReanimation', 'operatingBlocks',
      'consultationTypes', 'ambulancePhone', 'receptionPhone', 'adminPhone',
      'waitTimeMinutes', 'waitTimeUpdatedAt', 'departmentSchedules', 'landmarkDescription'
    ],
  },
  birth_hospital: {
    registrationSections: [
      'emergencyToggle', 'maternityServices', 'infrastructure',
      'maternityEmergencyContact', 'femaleStaffFlag', 'pediatricianOnSite',
      'visitingHours', 'insurances'
    ],
    profileModules: [
      'EmergencyBadge', 'MaternityServicesHeader', 'InfrastructureInfo',
      'AppointmentWidget', 'FemaleStaffBadge', 'PediatricianBadge',
      'VisitingHours', 'InsuranceList'
    ],
    featureKeys: [
      'emergencyCapable', 'numberOfBeds', 'deliveryRooms', 'hasNICU',
      'maternityEmergencyPhone', 'maternityServices', 'femaleStaffOnly',
      'pediatricianOnSite', 'visitingHoursPolicy', 'hasReanimation'
    ],
  },
  medical_equipment: {
    registrationSections: [
      'equipmentBusinessType', 'equipmentCatalog', 'equipmentBrands',
      'delivery', 'deliveryZone', 'installation',
      'maintenance', 'technicalSupport', 'catalogPdf'
    ],
    profileModules: [
      'EquipmentCatalog', 'BrandsDisplay', 'DeliveryInfo', 'DeliveryZone',
      'MaintenanceBadge', 'TechnicalSupportCard', 'QuoteRequest', 'CatalogPdf'
    ],
    featureKeys: [
      'productCategories', 'rentalAvailable', 'deliveryAvailable',
      'equipmentBusinessTypes', 'installationAvailable', 'catalogPdfUrl',
      'equipmentCatalog', 'equipmentBrands', 'maintenanceServiceAvailable',
      'technicalSupportAvailable', 'technicalSupportPhone',
      'equipmentDeliveryZone', 'equipmentDeliveryFee'
    ],
  },
  clinic: {
    registrationSections: [
      'specialties', 'infrastructure', 'surgeriesOffered',
      'doctorRoster', 'paymentMethods', 'parking',
      'insurances', 'consultationFee', 'consultationType'
    ],
    profileModules: [
      'SpecialtiesHeader', 'InfrastructureInfo', 'AppointmentWidget',
      'SurgeriesList', 'DoctorRoster', 'PaymentMethods', 'ParkingInfo',
      'InsuranceList', 'ConsultationFee', 'ConsultationTypes'
    ],
    featureKeys: [
      'numberOfBeds', 'consultationRooms', 'operatingBlocks', 'hasReanimation',
      'consultationTypes', 'surgeriesOffered', 'doctorRoster',
      'paymentMethods', 'parkingAvailable', 'insuranceAccepted', 'consultationFee'
    ],
  },
  doctor: {
    registrationSections: [
      'specialties', 'education', 'consultationType', 'consultationFee',
      'homeVisit', 'teleconsultation', 'patientTypes', 'insurances'
    ],
    profileModules: [
      'SpecialtiesHeader', 'EducationInfo', 'AppointmentWidget',
      'ConsultationInfo', 'HomeVisitZone', 'TrainedAbroadBadge',
      'PatientTypesBadge', 'ConsultationFee', 'InsuranceList'
    ],
    featureKeys: [
      'medicalSchool', 'graduationYear', 'yearsOfExperience',
      'secondarySpecialty', 'homeVisitZone', 'teleconsultationPlatform',
      'ordreMedecinsNumber', 'trainedAbroad', 'trainingCountry',
      'womenOnlyPractice', 'patientTypes', 'consultationTypes',
      'consultationFee', 'insuranceAccepted'
    ],
  },
};

/**
 * Get the resolved field config for a given category + sub-type.
 * Sub-type overrides take precedence over category defaults.
 */
export function getProviderFieldConfig(
  category: ProviderCategoryId,
  subType: string
): CategoryFieldConfig {
  const base = CATEGORY_CONFIGS[category];
  const override = SUBTYPE_OVERRIDES[subType];
  if (!override) return base;
  return {
    registrationSections: override.registrationSections ?? base.registrationSections,
    profileModules: override.profileModules ?? base.profileModules,
    featureKeys: override.featureKeys ?? base.featureKeys,
    requiredFeatures: override.requiredFeatures ?? base.requiredFeatures,
  };
}
