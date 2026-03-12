import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface MedicalAd {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  content: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
  views: number;
  rejectionReason?: string;
}

interface MedicalAdInput {
  providerId: string;
  providerUserId: string;
  providerName: string;
  title: string;
  content: string;
  imageUrl?: string;
}

const COLLECTION_NAME = 'ads';

// Convert Firestore doc to MedicalAd
function docToAd(docSnap: any): MedicalAd {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    providerId: data.providerId,
    providerName: data.providerName,
    title: data.title,
    content: data.content,
    imageUrl: data.imageUrl,
    status: data.status || 'pending',
    createdAt: data.createdAt?.toDate() || new Date(),
    expiresAt: data.expiresAt?.toDate() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    views: data.views || 0,
    rejectionReason: data.rejectionReason
  };
}

// Create a new ad
export async function createAd(input: MedicalAdInput): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...input,
    status: 'pending',
    views: 0,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  });
  return docRef.id;
}

// Get ads for a specific provider
export async function getProviderAds(providerId: string): Promise<MedicalAd[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('providerId', '==', providerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToAd);
}

// Get all ads (for admin moderation)
export async function getAllAds(): Promise<MedicalAd[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToAd);
}

// Get pending ads (for admin moderation)
export async function getPendingAds(): Promise<MedicalAd[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToAd);
}

// Get approved ads (for public display)
export async function getApprovedAds(): Promise<MedicalAd[]> {
  const now = new Date();
  const q = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(docToAd)
    .filter(ad => ad.expiresAt > now);
}

// Approve an ad
export async function approveAd(adId: string): Promise<void> {
  const adRef = doc(db, COLLECTION_NAME, adId);
  await updateDoc(adRef, {
    status: 'approved',
    updatedAt: serverTimestamp()
  });
}

// Reject an ad
export async function rejectAd(adId: string, reason?: string): Promise<void> {
  const adRef = doc(db, COLLECTION_NAME, adId);
  await updateDoc(adRef, {
    status: 'rejected',
    rejectionReason: reason || 'Non conforme aux règles de la plateforme',
    updatedAt: serverTimestamp()
  });
}

// Delete an ad
export async function deleteAd(adId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, adId));
}

// Increment ad views
export async function incrementAdViews(adId: string): Promise<void> {
  const adRef = doc(db, COLLECTION_NAME, adId);
  const adSnap = await getDoc(adRef);
  if (adSnap.exists()) {
    const currentViews = adSnap.data().views || 0;
    await updateDoc(adRef, {
      views: currentViews + 1
    });
  }
}

// Subscribe to ads for a provider (real-time, by auth UID)
export function subscribeToProviderAds(
  providerUserId: string,
  callback: (ads: MedicalAd[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('providerUserId', '==', providerUserId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const ads = snapshot.docs.map(docToAd);
    callback(ads);
  }, (error) => {
    console.error('Provider ads subscription error:', error);
    if (onError) onError(error);
    else callback([]);
  });
}

// Subscribe to all ads (for admin, real-time)
export function subscribeToAllAds(
  callback: (ads: MedicalAd[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(
    q, 
    (snapshot) => {
      const ads = snapshot.docs.map(docToAd);
      callback(ads);
    },
    (error) => {
      console.error('Ads subscription error:', error);
      if (onError) {
        onError(error);
      }
    }
  );
}
