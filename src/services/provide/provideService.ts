import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { ProvideOffer, ProvideCategory } from '@/types/provide';

const COLLECTION = 'provide_offers';

export const offerInputSchema = z.object({
  title: z.string().trim().min(3, 'Le titre doit avoir au moins 3 caractères').max(120),
  description: z.string().trim().min(10, 'La description doit avoir au moins 10 caractères').max(1000),
  category: z.enum(['food', 'medicine', 'tools', 'transport', 'other']),
  contactMethod: z.enum(['phone', 'email', 'in_app']),
  contactValue: z.string().trim().min(3, 'Veuillez renseigner un moyen de contact').max(100),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    label: z.string().max(200).optional(),
  }),
});

export type OfferInput = z.infer<typeof offerInputSchema>;

const docToOffer = (docSnap: any): ProvideOffer => {
  const d = docSnap.data();
  return {
    id: docSnap.id,
    ownerId: d.ownerId,
    ownerName: d.ownerName,
    title: d.title,
    description: d.description,
    category: d.category,
    location: d.location,
    contactMethod: d.contactMethod,
    contactValue: d.contactValue,
    status: d.status || 'available',
    verified: d.verified || false,
    imageUrl: d.imageUrl,
    createdAt: d.createdAt?.toDate?.()?.toISOString() || d.createdAt,
    updatedAt: d.updatedAt?.toDate?.()?.toISOString() || d.updatedAt,
  };
};

export const createOffer = async (
  data: OfferInput & { ownerId: string; ownerName: string; verified: boolean; imageUrl?: string }
): Promise<string> => {
  const result = offerInputSchema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.errors[0]?.message || 'Données invalides');
  }

  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...result.data,
    ownerId: data.ownerId,
    ownerName: data.ownerName,
    verified: data.verified,
    imageUrl: data.imageUrl || null,
    status: 'available',
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const getOfferById = async (id: string): Promise<ProvideOffer | null> => {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? docToOffer(snap) : null;
};

export const getOffersByOwner = async (ownerId: string): Promise<ProvideOffer[]> => {
  try {
    const q = query(collection(db, COLLECTION), where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(docToOffer);
  } catch {
    return [];
  }
};

export const getAllOffers = async (category?: ProvideCategory): Promise<ProvideOffer[]> => {
  try {
    let q;
    if (category) {
      q = query(collection(db, COLLECTION), where('category', '==', category), where('status', '==', 'available'), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, COLLECTION), where('status', '==', 'available'), orderBy('createdAt', 'desc'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(docToOffer);
  } catch {
    return [];
  }
};

export const updateOffer = async (id: string, data: Partial<OfferInput & { status: string; imageUrl: string }>): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteOffer = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};

export const subscribeToOffers = (
  callback: (offers: ProvideOffer[]) => void,
  category?: ProvideCategory
): (() => void) => {
  const constraints = [
    where('status', '==', 'available'),
    ...(category ? [where('category', '==', category)] : []),
    orderBy('createdAt', 'desc'),
  ];
  const q = query(collection(db, COLLECTION), ...constraints);
  return onSnapshot(q, (snap) => callback(snap.docs.map(docToOffer)), () => callback([]));
};

export const subscribeToMyOffers = (
  ownerId: string,
  callback: (offers: ProvideOffer[]) => void
): (() => void) => {
  const q = query(collection(db, COLLECTION), where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map(docToOffer)), () => callback([]));
};
