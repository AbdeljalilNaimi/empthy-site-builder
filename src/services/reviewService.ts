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
  arrayUnion,
  increment,
  getDoc
} from 'firebase/firestore';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { Review, ReviewStats } from '@/types/reviews';

const REVIEWS_COLLECTION = 'reviews';

// Input validation schemas
const reviewInputSchema = z.object({
  providerId: z.string().min(1, 'Provider ID required'),
  patientName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  patientId: z.string().min(1, 'Patient ID required'),
  userId: z.string().min(1, 'User ID required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().trim().max(1000, 'Comment too long').optional(),
  visitDate: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

const providerResponseSchema = z.object({
  text: z.string().trim().min(1, 'Response cannot be empty').max(1000, 'Response too long'),
});

// Helper to convert Firestore doc to Review
const docToReview = (docSnap: any): Review => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    providerId: data.providerId,
    patientName: data.patientName,
    patientId: data.patientId,
    userId: data.userId,
    rating: data.rating,
    comment: data.comment,
    visitDate: data.visitDate,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    status: data.status || 'approved',
    helpfulVotes: data.helpfulVotes || 0,
    votedBy: data.votedBy || [],
    providerResponse: data.providerResponse ? {
      text: data.providerResponse.text,
      respondedAt: data.providerResponse.respondedAt?.toDate?.()?.toISOString() || data.providerResponse.respondedAt
    } : undefined
  };
};

// Get all reviews for a provider
export const getReviewsByProvider = async (providerId: string): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('providerId', '==', providerId),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToReview);
  } catch {
    return [];
  }
};

// Get all reviews by a patient (using patientId or userId)
export const getReviewsByPatient = async (patientId: string): Promise<Review[]> => {
  try {
    // Query by userId (Firebase auth ID) which is the reliable field
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('userId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToReview);
  } catch {
    return [];
  }
};

// Create a new review
export const createReview = async (
  review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  // Validate input
  const validationResult = reviewInputSchema.safeParse(review);
  if (!validationResult.success) {
    throw new Error(validationResult.error.errors[0]?.message || 'Invalid review data');
  }

  const validatedData = validationResult.data;
  const now = Timestamp.now();
  
  const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
    ...validatedData,
    helpfulVotes: 0,
    votedBy: [],
    status: 'approved', // Auto-approve for now
    createdAt: now,
    updatedAt: now
  });
  
  return docRef.id;
};

// Update a review
export const updateReview = async (
  reviewId: string, 
  updates: Partial<Review>
): Promise<void> => {
  const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

// Vote on a review (atomic operation)
export const voteReview = async (reviewId: string, userId: string): Promise<void> => {
  const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
  
  // First check if user already voted
  const reviewSnap = await getDoc(docRef);
  if (reviewSnap.exists()) {
    const data = reviewSnap.data();
    if (data.votedBy?.includes(userId)) {
      throw new Error('User has already voted on this review');
    }
  }
  
  // Use atomic increment() instead of read-then-write pattern
  await updateDoc(docRef, {
    votedBy: arrayUnion(userId),
    helpfulVotes: increment(1),
    updatedAt: Timestamp.now()
  });
};

// Add provider response to a review
export const addProviderResponse = async (
  reviewId: string, 
  responseText: string
): Promise<void> => {
  // Validate input
  const validationResult = providerResponseSchema.safeParse({ text: responseText });
  if (!validationResult.success) {
    throw new Error(validationResult.error.errors[0]?.message || 'Invalid response');
  }

  const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
  await updateDoc(docRef, {
    providerResponse: {
      text: validationResult.data.text,
      respondedAt: Timestamp.now()
    },
    updatedAt: Timestamp.now()
  });
};

// Calculate review stats for a provider
export const getReviewStats = async (providerId: string): Promise<ReviewStats> => {
  const reviews = await getReviewsByProvider(providerId);
  
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;

  reviews.forEach(review => {
    const rating = Math.min(5, Math.max(1, Math.round(review.rating)));
    distribution[rating as keyof typeof distribution]++;
    totalRating += review.rating;
  });

  return {
    averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
    totalReviews: reviews.length,
    ratingDistribution: distribution
  };
};

// Get all reviews count for platform stats (admin)
export const getAllReviewsCount = async (): Promise<number> => {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('status', '==', 'approved')
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch {
    return 0;
  }
};
