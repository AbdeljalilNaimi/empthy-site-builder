// Verification Service
// Handles verification request operations with Firestore

import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface OCRFieldResult {
  found: boolean;
  similarity: number;
  expectedValue: string;
  matchedWord?: string;
}

export interface OCRResult {
  success: boolean;
  score: number;
  fields: Record<string, OCRFieldResult>;
}

export interface VerificationRequest {
  id: string;
  providerId: string;
  providerName: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  documents: {
    license?: string;
    licenseOCR?: OCRResult;
    id?: string;
    idOCR?: OCRResult;
    additionalNotes?: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
}

const VERIFICATION_COLLECTION = 'verification_requests';
const PROVIDERS_COLLECTION = 'providers';

// Convert Firestore doc to VerificationRequest
const docToVerificationRequest = (docSnap: any): VerificationRequest => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    providerId: data.providerId,
    providerName: data.providerName,
    userId: data.userId,
    status: data.status || 'pending',
    submittedAt: data.submittedAt?.toDate?.()?.toISOString() || data.submittedAt,
    documents: data.documents || {},
    reviewedAt: data.reviewedAt?.toDate?.()?.toISOString() || data.reviewedAt,
    reviewNotes: data.reviewNotes
  };
};

// Get all verification requests (admin)
export const getAllVerificationRequests = async (): Promise<VerificationRequest[]> => {
  try {
    const q = query(
      collection(db, VERIFICATION_COLLECTION),
      orderBy('submittedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToVerificationRequest);
  } catch (error) {
    console.error('Error fetching verification requests:', error);
    return [];
  }
};

// Get pending verification requests (admin)
export const getPendingVerificationRequests = async (): Promise<VerificationRequest[]> => {
  try {
    const q = query(
      collection(db, VERIFICATION_COLLECTION),
      where('status', '==', 'pending'),
      orderBy('submittedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToVerificationRequest);
  } catch (error) {
    console.error('Error fetching pending verification requests:', error);
    return [];
  }
};

// Get verification request by user ID
export const getVerificationRequestByUserId = async (userId: string): Promise<VerificationRequest | null> => {
  try {
    const q = query(
      collection(db, VERIFICATION_COLLECTION),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return docToVerificationRequest(snapshot.docs[0]);
  } catch (error) {
    console.error('Error fetching verification request:', error);
    return null;
  }
};

// Create a new verification request
export const createVerificationRequest = async (
  request: Omit<VerificationRequest, 'id' | 'submittedAt' | 'status'>
): Promise<string> => {
  const now = Timestamp.now();
  
  const docRef = await addDoc(collection(db, VERIFICATION_COLLECTION), {
    ...request,
    status: 'pending',
    submittedAt: now
  });
  
  return docRef.id;
};

// Approve verification request (admin)
export const approveVerificationRequest = async (requestId: string, providerId: string): Promise<void> => {
  const now = Timestamp.now();
  
  // Update verification request
  const requestRef = doc(db, VERIFICATION_COLLECTION, requestId);
  await updateDoc(requestRef, {
    status: 'approved',
    reviewedAt: now
  });
  
  // Update provider status using canonical transition
  const { VERIFICATION_TRANSITIONS } = await import('@/constants/verificationStates');
  const providerRef = doc(db, PROVIDERS_COLLECTION, providerId);
  await updateDoc(providerRef, {
    ...VERIFICATION_TRANSITIONS.approve,
    updatedAt: now
  });
};

// Reject verification request (admin)
export const rejectVerificationRequest = async (
  requestId: string, 
  providerId: string, 
  notes: string
): Promise<void> => {
  const now = Timestamp.now();
  
  // Update verification request
  const requestRef = doc(db, VERIFICATION_COLLECTION, requestId);
  await updateDoc(requestRef, {
    status: 'rejected',
    reviewedAt: now,
    reviewNotes: notes
  });
  
  // Update provider status using canonical transition
  const { VERIFICATION_TRANSITIONS } = await import('@/constants/verificationStates');
  const providerRef = doc(db, PROVIDERS_COLLECTION, providerId);
  await updateDoc(providerRef, {
    ...VERIFICATION_TRANSITIONS.reject,
    updatedAt: now
  });
};

// Subscribe to real-time verification request updates (admin)
export const subscribeToVerificationRequests = (
  callback: (requests: VerificationRequest[]) => void
): (() => void) => {
  const q = query(
    collection(db, VERIFICATION_COLLECTION),
    orderBy('submittedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(docToVerificationRequest);
    callback(requests);
  }, (error) => {
    console.error('Error subscribing to verification requests:', error);
    callback([]);
  });
};
