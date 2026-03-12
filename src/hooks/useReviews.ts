import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getReviewsByProvider, 
  getReviewsByPatient,
  getReviewStats, 
  createReview, 
  updateReview as updateReviewService,
  voteReview as voteReviewService,
  addProviderResponse as addProviderResponseService
} from '@/services/reviewService';
import { Review, ReviewStats } from '@/types/reviews';
import { useAuth } from '@/contexts/AuthContext';

// Query keys factory
export const reviewKeys = {
  all: ['reviews'] as const,
  byProvider: (providerId: string) => [...reviewKeys.all, 'provider', providerId] as const,
  byPatient: (patientId: string) => [...reviewKeys.all, 'patient', patientId] as const,
  stats: (providerId: string) => [...reviewKeys.all, 'stats', providerId] as const,
};

// Hook to fetch reviews for a provider
export const useProviderReviews = (providerId: string) => {
  return useQuery({
    queryKey: reviewKeys.byProvider(providerId),
    queryFn: () => getReviewsByProvider(providerId),
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch reviews by a patient (using their userId)
export const usePatientReviews = (patientId: string | undefined) => {
  return useQuery({
    queryKey: reviewKeys.byPatient(patientId || ''),
    queryFn: () => getReviewsByPatient(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to fetch review stats for a provider
export const useReviewStats = (providerId: string | undefined) => {
  return useQuery({
    queryKey: reviewKeys.stats(providerId || ''),
    queryFn: () => getReviewStats(providerId!),
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to submit a new review
export const useSubmitReview = (providerId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: { patientName: string; rating: number; comment: string }) => {
      if (!user) throw new Error('Must be logged in to submit a review');
      
      return createReview({
        providerId,
        patientName: data.patientName,
        patientId: user.uid,
        userId: user.uid,
        rating: data.rating,
        comment: data.comment,
        status: 'approved',
        helpfulVotes: 0,
        votedBy: [],
      });
    },
    onMutate: async (newReview) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: reviewKeys.byProvider(providerId) });
      
      // Snapshot previous value
      const previousReviews = queryClient.getQueryData<Review[]>(reviewKeys.byProvider(providerId));
      
      // Optimistically update
      const optimisticReview: Review = {
        id: 'temp-' + Date.now(),
        providerId,
        patientName: newReview.patientName,
        userId: user?.uid || '',
        rating: newReview.rating,
        comment: newReview.comment,
        status: 'approved',
        helpfulVotes: 0,
        votedBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      queryClient.setQueryData<Review[]>(
        reviewKeys.byProvider(providerId),
        (old = []) => [optimisticReview, ...old]
      );
      
      return { previousReviews };
    },
    onError: (_err, _newReview, context) => {
      // Rollback on error
      if (context?.previousReviews) {
        queryClient.setQueryData(reviewKeys.byProvider(providerId), context.previousReviews);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: reviewKeys.byProvider(providerId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats(providerId) });
    },
  });
};

// Hook to vote on a review
export const useVoteReview = (providerId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error('Must be logged in to vote');
      return voteReviewService(reviewId, user.uid);
    },
    onMutate: async (reviewId) => {
      await queryClient.cancelQueries({ queryKey: reviewKeys.byProvider(providerId) });
      
      const previousReviews = queryClient.getQueryData<Review[]>(reviewKeys.byProvider(providerId));
      
      // Optimistic update
      queryClient.setQueryData<Review[]>(
        reviewKeys.byProvider(providerId),
        (old = []) => old.map(review => 
          review.id === reviewId
            ? { 
                ...review, 
                helpfulVotes: review.helpfulVotes + 1,
                votedBy: [...review.votedBy, user?.uid || '']
              }
            : review
        )
      );
      
      return { previousReviews };
    },
    onError: (_err, _reviewId, context) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(reviewKeys.byProvider(providerId), context.previousReviews);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.byProvider(providerId) });
    },
  });
};

// Hook to add provider response
export const useAddProviderResponse = (providerId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reviewId, text }: { reviewId: string; text: string }) => {
      return addProviderResponseService(reviewId, text);
    },
    onMutate: async ({ reviewId, text }) => {
      await queryClient.cancelQueries({ queryKey: reviewKeys.byProvider(providerId) });
      
      const previousReviews = queryClient.getQueryData<Review[]>(reviewKeys.byProvider(providerId));
      
      // Optimistic update
      queryClient.setQueryData<Review[]>(
        reviewKeys.byProvider(providerId),
        (old = []) => old.map(review => 
          review.id === reviewId
            ? { 
                ...review, 
                providerResponse: {
                  text,
                  respondedAt: new Date().toISOString()
                }
              }
            : review
        )
      );
      
      return { previousReviews };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(reviewKeys.byProvider(providerId), context.previousReviews);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.byProvider(providerId) });
    },
  });
};
