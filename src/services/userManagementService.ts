import { 
  collection, 
  query, 
  where, 
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logAdminAction } from './auditLogService';

export interface CitizenUser {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended';
  appointmentsCount: number;
  favoritesCount: number;
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'moderator' | 'support';
  avatarUrl?: string;
  lastLoginAt?: Timestamp;
  createdAt: Timestamp;
}

/**
 * Get all citizen users
 */
export async function getAllCitizens(): Promise<CitizenUser[]> {
  try {
    const citizensSnap = await getDocs(
      query(collection(db, 'citizens'), orderBy('createdAt', 'desc'))
    );
    
    return citizensSnap.docs.map(docSnap => {
      const data = docSnap.data();
      const fullName = data.fullName || data.displayName || data.name || data.email?.split('@')[0] || 'Utilisateur';
      return {
        id: docSnap.id,
        email: data.email || '',
        fullName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        status: data.status || 'active',
        appointmentsCount: data.appointmentsCount || 0,
        favoritesCount: data.favoritesCount || 0,
        createdAt: data.createdAt || Timestamp.now(),
        lastLoginAt: data.lastLoginAt,
      };
    });
  } catch (error) {
    console.error('Failed to get citizens:', error);
    return [];
  }
}

/**
 * Get citizen by ID
 */
export async function getCitizenById(citizenId: string): Promise<CitizenUser | null> {
  try {
    const docSnap = await getDoc(doc(db, 'citizens', citizenId));
    
    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as CitizenUser;
  } catch (error) {
    console.error('Failed to get citizen:', error);
    return null;
  }
}

/**
 * Update citizen status
 */
export async function updateCitizenStatus(
  citizenId: string,
  status: 'active' | 'suspended',
  adminId: string,
  adminEmail: string,
  reason?: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'citizens', citizenId), {
      status,
      updatedAt: serverTimestamp(),
    });

    await logAdminAction(
      adminId,
      adminEmail,
      'user_role_changed',
      citizenId,
      'user',
      { status },
      reason
    );
  } catch (error) {
    console.error('Failed to update citizen status:', error);
    throw error;
  }
}

/**
 * Get all admin users
 */
export async function getAllAdmins(): Promise<AdminUser[]> {
  try {
    const adminsSnap = await getDocs(
      query(collection(db, 'admin_profiles'), orderBy('createdAt', 'desc'))
    );
    
    return adminsSnap.docs.map(docSnap => ({
      id: docSnap.id,
      email: docSnap.data().email || '',
      fullName: docSnap.data().fullName || docSnap.data().email?.split('@')[0],
      role: docSnap.data().role || 'moderator',
      avatarUrl: docSnap.data().avatarUrl,
      lastLoginAt: docSnap.data().lastLoginAt,
      createdAt: docSnap.data().createdAt || Timestamp.now(),
    }));
  } catch (error) {
    console.error('Failed to get admins:', error);
    return [];
  }
}

/**
 * Create a new admin (invite)
 */
export async function createAdmin(
  email: string,
  role: 'super_admin' | 'moderator' | 'support',
  invitedBy: { id: string; email: string }
): Promise<string> {
  try {
    // Create admin profile document (auth user creation would need Firebase Admin SDK or Cloud Functions)
    const adminId = `admin_${Date.now()}`;
    
    await setDoc(doc(db, 'admin_profiles', adminId), {
      email,
      fullName: email.split('@')[0],
      role,
      permissions: getDefaultPermissions(role),
      createdAt: serverTimestamp(),
      invitedBy: invitedBy.email,
    });

    await logAdminAction(
      invitedBy.id,
      invitedBy.email,
      'user_role_changed',
      adminId,
      'user',
      { action: 'admin_created', role }
    );

    return adminId;
  } catch (error) {
    console.error('Failed to create admin:', error);
    throw error;
  }
}

/**
 * Update admin role
 */
export async function updateAdminRole(
  adminId: string,
  newRole: 'super_admin' | 'moderator' | 'support',
  updatedBy: { id: string; email: string }
): Promise<void> {
  try {
    await updateDoc(doc(db, 'admin_profiles', adminId), {
      role: newRole,
      permissions: getDefaultPermissions(newRole),
      updatedAt: serverTimestamp(),
    });

    await logAdminAction(
      updatedBy.id,
      updatedBy.email,
      'user_role_changed',
      adminId,
      'user',
      { newRole }
    );
  } catch (error) {
    console.error('Failed to update admin role:', error);
    throw error;
  }
}

/**
 * Delete admin
 */
export async function deleteAdmin(
  adminId: string,
  deletedBy: { id: string; email: string }
): Promise<void> {
  try {
    // Prevent self-deletion
    if (adminId === deletedBy.id) {
      throw new Error('Cannot delete your own admin account');
    }

    const adminDoc = await getDoc(doc(db, 'admin_profiles', adminId));
    const adminData = adminDoc.data();

    await deleteDoc(doc(db, 'admin_profiles', adminId));

    await logAdminAction(
      deletedBy.id,
      deletedBy.email,
      'user_role_changed',
      adminId,
      'user',
      { action: 'admin_deleted', deletedEmail: adminData?.email }
    );
  } catch (error) {
    console.error('Failed to delete admin:', error);
    throw error;
  }
}

/**
 * Get default permissions for a role
 */
function getDefaultPermissions(role: 'super_admin' | 'moderator' | 'support'): string[] {
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
 * Search users
 */
export async function searchUsers(searchTerm: string): Promise<{
  citizens: CitizenUser[];
  admins: AdminUser[];
}> {
  try {
    const [citizens, admins] = await Promise.all([
      getAllCitizens(),
      getAllAdmins(),
    ]);

    const lowerSearch = searchTerm.toLowerCase();

    return {
      citizens: citizens.filter(c => 
        c.email.toLowerCase().includes(lowerSearch) ||
        c.fullName?.toLowerCase().includes(lowerSearch)
      ),
      admins: admins.filter(a => 
        a.email.toLowerCase().includes(lowerSearch) ||
        a.fullName.toLowerCase().includes(lowerSearch)
      ),
    };
  } catch (error) {
    console.error('Failed to search users:', error);
    return { citizens: [], admins: [] };
  }
}
