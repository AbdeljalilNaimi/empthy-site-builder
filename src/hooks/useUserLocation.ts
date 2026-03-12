import { useState, useCallback, useEffect } from 'react';

interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface UseUserLocationReturn {
  location: UserLocation | null;
  isLocating: boolean;
  error: string | null;
  requestLocation: () => void;
  clearLocation: () => void;
  calculateDistance: (lat: number, lng: number) => number | null;
}

const STORAGE_KEY = 'user_location';
const LOCATION_EXPIRY = 30 * 60 * 1000; // 30 minutes

export const useUserLocation = (): UseUserLocationReturn => {
  const [location, setLocation] = useState<UserLocation | null>(() => {
    // Try to restore from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { location, timestamp } = JSON.parse(stored);
        // Check if location is still valid (not expired)
        if (Date.now() - timestamp < LOCATION_EXPIRY) {
          return location;
        }
      }
    } catch {
      // Ignore storage errors
    }
    return null;
  });
  
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save location to localStorage when it changes
  useEffect(() => {
    if (location) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          location,
          timestamp: Date.now()
        }));
      } catch {
        // Ignore storage errors
      }
    }
  }, [location]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée par ce navigateur');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocation(newLocation);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permission de géolocalisation refusée');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Position non disponible');
            break;
          case err.TIMEOUT:
            setError('Délai de géolocalisation dépassé');
            break;
          default:
            setError('Erreur de géolocalisation');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Accept cached position up to 1 minute old
      }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Calculate distance using Haversine formula
  const calculateDistance = useCallback((lat: number, lng: number): number | null => {
    if (!location) return null;

    const R = 6371; // Earth's radius in km
    const dLat = (lat - location.lat) * Math.PI / 180;
    const dLon = (lng - location.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(location.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  }, [location]);

  return {
    location,
    isLocating,
    error,
    requestLocation,
    clearLocation,
    calculateDistance
  };
};
