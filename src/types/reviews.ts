export interface Review {
  id: string;
  providerId: string;
  patientName: string;
  patientId?: string;
  userId: string; // Firebase auth user ID - required for Firestore rules
  rating: number; // 1-5
  comment: string;
  visitDate?: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  helpfulVotes: number;
  votedBy: string[]; // user IDs who voted
  providerResponse?: {
    text: string;
    respondedAt: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
