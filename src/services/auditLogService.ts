import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type AuditAction = 
  | 'provider_approved'
  | 'provider_rejected'
  | 'provider_edited'
  | 'provider_deleted'
  | 'ad_approved'
  | 'ad_rejected'
  | 'user_role_changed'
  | 'settings_changed';

export interface AuditLogEntry {
  id?: string;
  adminId: string;
  adminEmail: string;
  action: AuditAction;
  targetId: string;
  targetType: 'provider' | 'ad' | 'user' | 'settings';
  details?: Record<string, any>;
  reason?: string;
  timestamp: Timestamp;
}

/**
 * Log an admin action to the audit_log collection
 */
export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: AuditAction,
  targetId: string,
  targetType: 'provider' | 'ad' | 'user' | 'settings',
  details?: Record<string, any>,
  reason?: string
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'audit_log'), {
      adminId,
      adminEmail,
      action,
      targetId,
      targetType,
      details: details || null,
      reason: reason || null,
      timestamp: serverTimestamp()
    });
    
    console.log(`Audit log created: ${action} on ${targetType}/${targetId}`);
    return docRef.id;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    throw error;
  }
}

/**
 * Get audit logs for a specific target
 */
export async function getAuditLogsForTarget(
  targetId: string,
  targetType: 'provider' | 'ad' | 'user' | 'settings'
): Promise<AuditLogEntry[]> {
  try {
    const q = query(
      collection(db, 'audit_log'),
      where('targetId', '==', targetId),
      where('targetType', '==', targetType),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AuditLogEntry[];
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    throw error;
  }
}

/**
 * Get recent audit logs (admin dashboard)
 */
export async function getRecentAuditLogs(limit: number = 50): Promise<AuditLogEntry[]> {
  try {
    const q = query(
      collection(db, 'audit_log'),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AuditLogEntry[];
  } catch (error) {
    console.error('Failed to get recent audit logs:', error);
    throw error;
  }
}

/**
 * Get audit logs by admin
 */
export async function getAuditLogsByAdmin(adminId: string): Promise<AuditLogEntry[]> {
  try {
    const q = query(
      collection(db, 'audit_log'),
      where('adminId', '==', adminId),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AuditLogEntry[];
  } catch (error) {
    console.error('Failed to get audit logs by admin:', error);
    throw error;
  }
}
