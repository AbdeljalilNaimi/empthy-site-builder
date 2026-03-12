/**
 * Admin Notification Service
 * 
 * Handles real-time notifications for administrators about important events
 * like verification revocations, new registrations, and security alerts.
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type AdminNotificationType = 
  | 'verification_revoked'
  | 'new_registration'
  | 'verification_submitted'
  | 'security_alert'
  | 'document_uploaded'
  | 'provider_edit';

export type AdminNotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AdminNotification {
  id?: string;
  type: AdminNotificationType;
  priority: AdminNotificationPriority;
  title: string;
  message: string;
  providerId?: string;
  providerName?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: Timestamp;
}

const COLLECTION_NAME = 'admin_notifications';

/**
 * Create a new admin notification
 */
export async function createAdminNotification(
  notification: Omit<AdminNotification, 'id' | 'createdAt' | 'isRead'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...notification,
      isRead: false,
      createdAt: serverTimestamp()
    });
    
    console.log(`Admin notification created: ${notification.type} - ${notification.title}`);
    return docRef.id;
  } catch (error) {
    console.error('Failed to create admin notification:', error);
    throw error;
  }
}

/**
 * Create a verification revoked notification
 * Called when a verified provider modifies sensitive fields
 */
export async function notifyVerificationRevoked(
  providerId: string,
  providerName: string,
  modifiedFields: string[]
): Promise<string> {
  const fieldLabels: Record<string, string> = {
    name: "Nom de l'établissement",
    address: "Adresse",
    phone: "Téléphone",
    email: "Email",
    lat: "Localisation GPS",
    lng: "Localisation GPS",
    city: "Ville",
    area: "Quartier",
    legalRegistrationNumber: "N° d'inscription",
    contactPersonName: "Nom du contact",
  };

  const readableFields = modifiedFields
    .map(f => fieldLabels[f] || f)
    .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
    .slice(0, 3); // Max 3 fields

  const fieldsText = readableFields.length > 2 
    ? `${readableFields.slice(0, 2).join(', ')} et ${modifiedFields.length - 2} autres`
    : readableFields.join(', ');

  return createAdminNotification({
    type: 'verification_revoked',
    priority: 'high',
    title: `Vérification révoquée: ${providerName}`,
    message: `Le prestataire a modifié: ${fieldsText}. Une nouvelle vérification est requise.`,
    providerId,
    providerName,
    metadata: {
      modifiedFields,
      revokedAt: new Date().toISOString(),
    }
  });
}

/**
 * Create a new registration notification
 */
export async function notifyNewRegistration(
  providerId: string,
  providerName: string,
  providerType: string
): Promise<string> {
  return createAdminNotification({
    type: 'new_registration',
    priority: 'medium',
    title: `Nouvelle inscription: ${providerName}`,
    message: `Un nouveau ${providerType} s'est inscrit et attend vérification.`,
    providerId,
    providerName,
    metadata: {
      providerType,
      registeredAt: new Date().toISOString(),
    }
  });
}

/**
 * Create a verification submitted notification
 */
export async function notifyVerificationSubmitted(
  providerId: string,
  providerName: string,
  documentCount: number
): Promise<string> {
  return createAdminNotification({
    type: 'verification_submitted',
    priority: 'medium',
    title: `Documents soumis: ${providerName}`,
    message: `${documentCount} document(s) de vérification soumis pour examen.`,
    providerId,
    providerName,
    metadata: {
      documentCount,
      submittedAt: new Date().toISOString(),
    }
  });
}

/**
 * Get unread notifications count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
}

/**
 * Get recent admin notifications
 */
export async function getAdminNotifications(
  limitCount: number = 50,
  unreadOnly: boolean = false
): Promise<AdminNotification[]> {
  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    if (unreadOnly) {
      q = query(
        collection(db, COLLECTION_NAME),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AdminNotification[];
  } catch (error) {
    console.error('Failed to get admin notifications:', error);
    return [];
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, notificationId);
    await updateDoc(docRef, { isRead: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(docSnap => {
      batch.update(docSnap.ref, { isRead: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time notifications
 * Returns an unsubscribe function
 */
export function subscribeToNotifications(
  callback: (notifications: AdminNotification[]) => void,
  limitCount: number = 20,
  onError?: (error: any) => void
): () => void {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(
    q, 
    (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminNotification[];
      callback(notifications);
    }, 
    (error) => {
      console.error('Notification subscription error:', error);
      if (onError) {
        onError(error);
      }
    }
  );
}

/**
 * Get notifications by type
 */
export async function getNotificationsByType(
  type: AdminNotificationType,
  limitCount: number = 20
): Promise<AdminNotification[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('type', '==', type),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AdminNotification[];
  } catch (error) {
    console.error('Failed to get notifications by type:', error);
    return [];
  }
}
