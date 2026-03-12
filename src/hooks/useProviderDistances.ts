import { useMemo } from 'react';
import { CityHealthProvider } from '@/data/providers';

// Haversine formula to calculate distance between two points
const calculateHaversineDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface UseProviderDistancesResult {
  distances: Map<string, number>;
  sortedProviders: CityHealthProvider[];
}

/**
 * Hook to calculate distances from user to providers and sort by proximity
 * Extracts common distance calculation logic used across map children
 */
export const useProviderDistances = (
  providers: CityHealthProvider[],
  userLat: number | null,
  userLng: number | null
): UseProviderDistancesResult => {
  return useMemo(() => {
    const distances = new Map<string, number>();
    
    // If no user location, return unsorted providers with empty distances
    if (userLat === null || userLng === null) {
      return { 
        distances, 
        sortedProviders: providers 
      };
    }
    
    // Calculate distance for each provider
    providers.forEach(provider => {
      const distance = calculateHaversineDistance(
        userLat, 
        userLng, 
        provider.lat, 
        provider.lng
      );
      distances.set(provider.id, distance);
    });
    
    // Sort by distance (closest first)
    const sortedProviders = [...providers].sort((a, b) => {
      const distA = distances.get(a.id) ?? 999;
      const distB = distances.get(b.id) ?? 999;
      return distA - distB;
    });
    
    return { distances, sortedProviders };
  }, [providers, userLat, userLng]);
};

/**
 * Simple utility to get distance from user to a single point
 * Used when you don't need the full hook functionality
 */
export const getDistanceFromUser = (
  userLat: number | null,
  userLng: number | null,
  targetLat: number,
  targetLng: number
): number | null => {
  if (userLat === null || userLng === null) return null;
  return calculateHaversineDistance(userLat, userLng, targetLat, targetLng);
};

export { calculateHaversineDistance };
