/**
 * TanStack Query hooks for favorites
 * 
 * Use these hooks for all favorite-related Firestore operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService } from '@/services/favoritesService';
import { useAuth } from '@/contexts/AuthContext';
import { providerAnalytics } from '@/services/providerAnalyticsService';

// Query keys
export const favoriteKeys = {
  all: ['favorites'] as const,
  user: (userId: string) => [...favoriteKeys.all, userId] as const,
};

/**
 * Fetch user's favorite provider IDs
 * Use for: favorites page, displaying heart icons on provider cards
 */
export function useFavorites() {
  const { user } = useAuth();

  return useQuery({
    queryKey: favoriteKeys.user(user?.uid || ''),
    queryFn: () => favoritesService.getUserFavorites(user!.uid),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Check if a provider is favorited
 * Use for: individual provider cards
 */
export function useIsFavorite(providerId: string) {
  const { data: favorites = [] } = useFavorites();
  return favorites.includes(providerId);
}

/**
 * Mutation: Add a provider to favorites
 */
export function useAddFavorite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (providerId: string) => 
      favoritesService.addFavorite(user!.uid, providerId),
    onMutate: async (providerId) => {
      // Optimistic update
      const queryKey = favoriteKeys.user(user!.uid);
      await queryClient.cancelQueries({ queryKey });
      
      const previous = queryClient.getQueryData<string[]>(queryKey);
      queryClient.setQueryData<string[]>(queryKey, (old = []) => [...old, providerId]);
      
      return { previous };
    },
    onError: (err, providerId, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(favoriteKeys.user(user!.uid), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.user(user!.uid) });
    },
    onSuccess: (_data, providerId) => {
      providerAnalytics.trackFavoriteAdd(providerId, user?.uid);
    },
  });
}

/**
 * Mutation: Remove a provider from favorites
 */
export function useRemoveFavorite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (providerId: string) => 
      favoritesService.removeFavorite(user!.uid, providerId),
    onMutate: async (providerId) => {
      // Optimistic update
      const queryKey = favoriteKeys.user(user!.uid);
      await queryClient.cancelQueries({ queryKey });
      
      const previous = queryClient.getQueryData<string[]>(queryKey);
      queryClient.setQueryData<string[]>(queryKey, (old = []) => 
        old.filter(id => id !== providerId)
      );
      
      return { previous };
    },
    onError: (err, providerId, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(favoriteKeys.user(user!.uid), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.user(user!.uid) });
    },
    onSuccess: (_data, providerId) => {
      providerAnalytics.trackFavoriteRemove(providerId, user?.uid);
    },
  });
}

/**
 * Toggle favorite status
 * Use for: heart button on provider cards
 */
export function useToggleFavorite() {
  const { data: favorites = [] } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  return {
    toggle: (providerId: string) => {
      if (favorites.includes(providerId)) {
        removeFavorite.mutate(providerId);
      } else {
        addFavorite.mutate(providerId);
      }
    },
    isLoading: addFavorite.isPending || removeFavorite.isPending,
  };
}
