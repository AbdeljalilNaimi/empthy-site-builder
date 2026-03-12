/**
 * TanStack Query hooks for provider data
 * 
 * Use these hooks for all Firestore provider reads.
 * Benefits: automatic caching, background refetching, loading states.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVerifiedProviders,
  getAllProviders,
  getProviderById,
  getProvidersByType,
  getEmergencyProviders,
  getBloodCenters,
  searchProviders,
  getPendingProviders,
  getProviderByUserId,
  updateProviderVerification,
  updateProvider,
} from '@/services/firestoreProviderService';
import { ProviderType, CityHealthProvider } from '@/data/providers';

// Query keys for cache management
export const providerKeys = {
  all: ['providers'] as const,
  verified: () => [...providerKeys.all, 'verified'] as const,
  pending: () => [...providerKeys.all, 'pending'] as const,
  detail: (id: string) => [...providerKeys.all, 'detail', id] as const,
  byType: (type: ProviderType) => [...providerKeys.all, 'type', type] as const,
  byUser: (userId: string) => [...providerKeys.all, 'user', userId] as const,
  emergency: () => [...providerKeys.all, 'emergency'] as const,
  bloodCenters: () => [...providerKeys.all, 'bloodCenters'] as const,
  search: (query: string) => [...providerKeys.all, 'search', query] as const,
};

/**
 * Fetch all verified and public providers
 * Use for: search page, map view, public listings
 */
export function useVerifiedProviders() {
  return useQuery({
    queryKey: providerKeys.verified(),
    queryFn: getVerifiedProviders,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 3 * 60 * 1000, // Auto-refetch every 3 minutes for near real-time updates
  });
}

/**
 * Fetch all providers (admin only)
 * Use for: admin dashboard
 */
export function useAllProviders() {
  return useQuery({
    queryKey: providerKeys.all,
    queryFn: getAllProviders,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch pending providers (admin only)
 * Use for: admin verification queue
 */
export function usePendingProviders() {
  return useQuery({
    queryKey: providerKeys.pending(),
    queryFn: getPendingProviders,
    staleTime: 1 * 60 * 1000, // 1 minute - more frequent updates
  });
}

/**
 * Fetch a single provider by ID
 * Use for: provider profile page
 */
export function useProvider(id: string | undefined) {
  return useQuery({
    queryKey: providerKeys.detail(id || ''),
    queryFn: () => getProviderById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch providers by type
 * Use for: filtered search results
 */
export function useProvidersByType(type: ProviderType) {
  return useQuery({
    queryKey: providerKeys.byType(type),
    queryFn: () => getProvidersByType(type),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch provider by user ID
 * Use for: provider dashboard
 */
export function useProviderByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: providerKeys.byUser(userId || ''),
    queryFn: () => getProviderByUserId(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch emergency providers
 * Use for: emergency services page, map emergency mode
 */
export function useEmergencyProviders() {
  return useQuery({
    queryKey: providerKeys.emergency(),
    queryFn: getEmergencyProviders,
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent for emergency
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes for real-time updates
  });
}

/**
 * Fetch blood donation centers
 * Use for: blood donation page, map blood mode
 */
export function useBloodCenters() {
  return useQuery({
    queryKey: providerKeys.bloodCenters(),
    queryFn: getBloodCenters,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes for real-time updates
  });
}

/**
 * Search providers by query
 * Use for: search with text input
 */
export function useSearchProviders(query: string) {
  return useQuery({
    queryKey: providerKeys.search(query),
    queryFn: () => searchProviders(query),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Mutation: Update provider verification status
 * Use for: admin approval/rejection
 */
export function useUpdateVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      providerId,
      status,
      isPublic,
    }: {
      providerId: string;
      status: 'pending' | 'verified' | 'rejected';
      isPublic: boolean;
    }) => updateProviderVerification(providerId, status, isPublic),
    onSuccess: () => {
      // Invalidate all provider queries to refetch
      queryClient.invalidateQueries({ queryKey: providerKeys.all });
    },
  });
}

/**
 * Mutation: Update provider profile data
 * Use for: provider dashboard profile updates
 */
export function useUpdateProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      providerId,
      updates,
    }: {
      providerId: string;
      updates: Partial<CityHealthProvider>;
    }) => updateProvider(providerId, updates),
    onSuccess: (_, { providerId }) => {
      // Invalidate specific provider, user-based queries, and all lists
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(providerId) });
      queryClient.invalidateQueries({ queryKey: providerKeys.verified() });
      queryClient.invalidateQueries({ queryKey: providerKeys.all });
      // Also invalidate byUser queries so the dashboard refreshes
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] === 'providers' && query.queryKey[1] === 'user'
      });
    },
  });
}

/**
 * Mutation: Update provider with verification check
 * Use for: sensitive field updates that may revoke verification
 */
export function useUpdateProviderWithVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      providerId,
      updates,
      currentVerificationStatus,
    }: {
      providerId: string;
      updates: Partial<CityHealthProvider>;
      currentVerificationStatus: 'pending' | 'verified' | 'rejected';
    }) => {
      const { updateProviderWithVerificationCheck } = await import(
        '@/services/firestoreProviderService'
      );
      return updateProviderWithVerificationCheck(providerId, updates, currentVerificationStatus);
    },
    onSuccess: (result, { providerId }) => {
      // Invalidate all provider queries
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(providerId) });
      queryClient.invalidateQueries({ queryKey: providerKeys.verified() });
      queryClient.invalidateQueries({ queryKey: providerKeys.pending() });
      queryClient.invalidateQueries({ queryKey: providerKeys.all });
      return result;
    },
  });
}
