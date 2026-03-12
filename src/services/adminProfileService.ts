import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { 
  updatePassword, 
  reauthenticateWithCredential,
  EmailAuthProvider 
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/lib/firebase';

export type AdminRole = 'super_admin' | 'moderator' | 'support';

export interface AdminProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  role: AdminRole;
  permissions: string[];
  lastLoginAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  preferences: {
    theme: 'light';
    language: 'fr' | 'ar' | 'en';
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
}

const DEFAULT_PREFERENCES: AdminProfile['preferences'] = {
  theme: 'light',
  language: 'fr',
  emailNotifications: true,
  pushNotifications: true,
};

/**
 * Get admin profile by ID
 */
export async function getAdminProfile(adminId: string): Promise<AdminProfile | null> {
  try {
    const docRef = doc(db, 'admin_profiles', adminId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as AdminProfile;
  } catch (error) {
    console.error('Failed to get admin profile:', error);
    throw error;
  }
}

/**
 * Create or initialize admin profile
 */
export async function createAdminProfile(
  adminId: string, 
  email: string,
  role: AdminRole = 'moderator'
): Promise<AdminProfile> {
  try {
    const profile: Omit<AdminProfile, 'id'> = {
      email,
      fullName: email.split('@')[0],
      role,
      permissions: getDefaultPermissions(role),
      createdAt: Timestamp.now(),
      preferences: DEFAULT_PREFERENCES,
    };

    await setDoc(doc(db, 'admin_profiles', adminId), {
      ...profile,
      createdAt: serverTimestamp(),
    });

    return { id: adminId, ...profile };
  } catch (error) {
    console.error('Failed to create admin profile:', error);
    throw error;
  }
}

/**
 * Update admin profile
 */
export async function updateAdminProfile(
  adminId: string,
  updates: Partial<Omit<AdminProfile, 'id' | 'email' | 'createdAt'>>
): Promise<void> {
  try {
    const docRef = doc(db, 'admin_profiles', adminId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to update admin profile:', error);
    throw error;
  }
}

/**
 * Upload admin avatar
 */
export async function uploadAdminAvatar(adminId: string, file: File): Promise<string> {
  try {
    const storageRef = ref(storage, `admin_avatars/${adminId}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    
    await updateAdminProfile(adminId, { avatarUrl: downloadUrl });
    
    return downloadUrl;
  } catch (error) {
    console.error('Failed to upload admin avatar:', error);
    throw error;
  }
}

/**
 * Change admin password
 */
export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user');
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Failed to change password:', error);
    throw error;
  }
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(adminId: string): Promise<void> {
  try {
    const docRef = doc(db, 'admin_profiles', adminId);
    await updateDoc(docRef, {
      lastLoginAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to update last login:', error);
    // Non-critical, don't throw
  }
}

/**
 * Get default permissions for a role
 */
function getDefaultPermissions(role: AdminRole): string[] {
  switch (role) {
    case 'super_admin':
      return [
        'manage_providers',
        'manage_users',
        'manage_admins',
        'manage_ads',
        'manage_settings',
        'view_analytics',
        'view_audit_logs',
        'export_data',
      ];
    case 'moderator':
      return [
        'manage_providers',
        'manage_ads',
        'view_analytics',
        'view_audit_logs',
      ];
    case 'support':
      return [
        'view_providers',
        'view_users',
        'view_analytics',
      ];
    default:
      return [];
  }
}

/**
 * Check if admin has a specific permission
 */
export function hasPermission(profile: AdminProfile, permission: string): boolean {
  return profile.permissions.includes(permission) || profile.role === 'super_admin';
}
