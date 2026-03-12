import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SupabaseReview {
  id: string;
  provider_id: string;
  patient_id: string;
  patient_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface ReviewWithProvider extends SupabaseReview {
  provider_name?: string;
  provider_type?: string;
}

export interface ReviewReport {
  id: string;
  review_id: string;
  reporter_id: string;
  reporter_type: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
}

function computeStats(reviews: SupabaseReview[]): ReviewStats {
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    dist[r.rating] = (dist[r.rating] || 0) + 1;
    sum += r.rating;
  }
  return {
    averageRating: reviews.length > 0 ? sum / reviews.length : 0,
    totalReviews: reviews.length,
    ratingDistribution: dist as Record<1 | 2 | 3 | 4 | 5, number>,
  };
}

export function useSupabaseReviews(providerId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['provider-reviews', providerId];

  const { data: reviews = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!providerId) return [];
      const { data, error } = await supabase
        .from('provider_reviews')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as SupabaseReview[];
    },
    enabled: !!providerId,
  });

  const stats = computeStats(reviews);

  const submitReview = useMutation({
    mutationFn: async (input: { patientId: string; patientName: string; rating: number; comment: string }) => {
      const { error } = await supabase.from('provider_reviews').insert({
        provider_id: providerId!,
        patient_id: input.patientId,
        patient_name: input.patientName,
        rating: input.rating,
        comment: input.comment,
      });
      if (error) {
        if (error.code === '23505') {
          throw new Error('Vous avez déjà laissé un avis pour ce professionnel.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { reviews, stats, isLoading, submitReview };
}

// Hook to fetch all reviews by a patient (citizen)
export function usePatientSupabaseReviews(patientId: string | undefined) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['patient-reviews', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from('provider_reviews')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as SupabaseReview[];
    },
    enabled: !!patientId,
  });

  return { data: reviews, isLoading };
}

// Delete a review by ID
export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('provider_reviews')
        .delete()
        .eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['provider-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
    },
  });
}

// Update a review (rating + comment)
export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { reviewId: string; rating: number; comment: string }) => {
      const { error } = await supabase
        .from('provider_reviews')
        .update({ rating: input.rating, comment: input.comment })
        .eq('id', input.reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['provider-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
    },
  });
}

// Report a review
export function useReportReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { reviewId: string; reporterId: string; reporterType: string; reason: string; details?: string }) => {
      const { error } = await supabase
        .from('review_reports' as any)
        .insert({
          review_id: input.reviewId,
          reporter_id: input.reporterId,
          reporter_type: input.reporterType,
          reason: input.reason,
          details: input.details || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-reports'] });
    },
  });
}

// Admin: fetch all review reports
export function useReviewReports() {
  return useQuery({
    queryKey: ['review-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_reports' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ReviewReport[];
    },
  });
}

// Admin: update report status
export function useUpdateReportStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { reportId: string; status: string }) => {
      const { error } = await supabase
        .from('review_reports' as any)
        .update({ status: input.status })
        .eq('id', input.reportId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-reports'] });
    },
  });
}

// Admin: fetch all reviews with optional filters
export interface AllReviewsFilters {
  providerType?: string;
  providerId?: string;
  rating?: number;
  dateFrom?: string;
  dateTo?: string;
}

export function useAllReviews(filters: AllReviewsFilters = {}) {
  return useQuery({
    queryKey: ['all-reviews', filters],
    queryFn: async () => {
      // Fetch all reviews
      let query = supabase
        .from('provider_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.providerId) {
        query = query.eq('provider_id', filters.providerId);
      }
      if (filters.rating) {
        query = query.eq('rating', filters.rating);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59');
      }

      const { data: reviews, error } = await query;
      if (error) throw error;

      // Fetch provider info to enrich reviews
      const providerIds = [...new Set((reviews || []).map((r: any) => r.provider_id))];
      let providersMap: Record<string, { name: string; type: string }> = {};

      if (providerIds.length > 0) {
        const { data: providers } = await supabase
          .from('providers_public')
          .select('id, name, type')
          .in('id', providerIds);
        if (providers) {
          providers.forEach((p: any) => {
            providersMap[p.id] = { name: p.name, type: p.type };
          });
        }
      }

      const enriched: ReviewWithProvider[] = (reviews || []).map((r: any) => ({
        ...r,
        provider_name: providersMap[r.provider_id]?.name || r.provider_id,
        provider_type: providersMap[r.provider_id]?.type || 'unknown',
      }));

      // Client-side filter by provider type if needed
      if (filters.providerType) {
        return enriched.filter(r => r.provider_type === filters.providerType);
      }

      return enriched;
    },
  });
}
