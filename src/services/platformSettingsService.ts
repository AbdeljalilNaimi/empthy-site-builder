import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logAdminAction } from './auditLogService';

export interface PlatformSettings {
  // General
  platformName: string;
  supportEmail: string;
  emergencyNumber: string;
  
  // Registration
  requireDocumentVerification: boolean;
  autoApproveNewProviders: boolean;
  maxDocumentSizeMb: number;
  allowedDocumentTypes: string[];
  
  // Features
  enableAIChat: boolean;
  enableMedicalAds: boolean;
  enableBloodDonation: boolean;
  enableEmergencyModule: boolean;
  enableReviewSystem: boolean;
  
  // Notifications
  sendEmailOnRegistration: boolean;
  sendEmailOnApproval: boolean;
  sendEmailOnRejection: boolean;
  adminNotifyOnNewRegistration: boolean;
  adminNotifyOnVerificationRequest: boolean;
  
  // Limits
  maxPhotosPerProvider: number;
  maxServicesPerProvider: number;
  reviewModerationEnabled: boolean;
  
  // Timestamps
  updatedAt?: any;
  updatedBy?: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'SantéDZ',
  supportEmail: 'support@santedz.com',
  emergencyNumber: '115',
  
  requireDocumentVerification: true,
  autoApproveNewProviders: false,
  maxDocumentSizeMb: 10,
  allowedDocumentTypes: ['pdf', 'jpg', 'jpeg', 'png'],
  
  enableAIChat: true,
  enableMedicalAds: true,
  enableBloodDonation: true,
  enableEmergencyModule: true,
  enableReviewSystem: true,
  
  sendEmailOnRegistration: true,
  sendEmailOnApproval: true,
  sendEmailOnRejection: true,
  adminNotifyOnNewRegistration: true,
  adminNotifyOnVerificationRequest: true,
  
  maxPhotosPerProvider: 10,
  maxServicesPerProvider: 20,
  reviewModerationEnabled: true,
};

const SETTINGS_DOC_ID = 'platform_settings';

/**
 * Get platform settings
 */
export async function getSettings(): Promise<PlatformSettings> {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // Initialize with defaults
      await setDoc(docRef, {
        ...DEFAULT_SETTINGS,
        updatedAt: serverTimestamp(),
      });
      return DEFAULT_SETTINGS;
    }
    
    return {
      ...DEFAULT_SETTINGS,
      ...docSnap.data()
    } as PlatformSettings;
  } catch (error) {
    console.error('Failed to get settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update platform settings
 */
export async function updateSettings(
  updates: Partial<PlatformSettings>,
  adminId: string,
  adminEmail: string
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail,
    });

    await logAdminAction(
      adminId,
      adminEmail,
      'settings_changed',
      SETTINGS_DOC_ID,
      'settings',
      { changes: Object.keys(updates) }
    );
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw error;
  }
}

/**
 * Reset settings to defaults
 */
export async function resetToDefaults(
  adminId: string,
  adminEmail: string
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    
    await setDoc(docRef, {
      ...DEFAULT_SETTINGS,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail,
    });

    await logAdminAction(
      adminId,
      adminEmail,
      'settings_changed',
      SETTINGS_DOC_ID,
      'settings',
      { action: 'reset_to_defaults' }
    );
  } catch (error) {
    console.error('Failed to reset settings:', error);
    throw error;
  }
}

/**
 * Get a specific setting value
 */
export async function getSetting<K extends keyof PlatformSettings>(
  key: K
): Promise<PlatformSettings[K]> {
  const settings = await getSettings();
  return settings[key];
}
