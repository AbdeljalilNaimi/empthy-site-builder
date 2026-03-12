import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export const SIDI_BEL_ABBES_CENTER = {
  lat: 35.1975,
  lng: -0.6300
};

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false
  });

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access was denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false
        }));
      },
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 300000 // 5 minutes
      }
    );
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Get distance from user to a specific point
  const getDistanceFromUser = useCallback((lat: number, lng: number): number | null => {
    if (state.latitude && state.longitude) {
      return calculateDistance(state.latitude, state.longitude, lat, lng);
    }
    // Fallback to distance from city center
    return calculateDistance(SIDI_BEL_ABBES_CENTER.lat, SIDI_BEL_ABBES_CENTER.lng, lat, lng);
  }, [state.latitude, state.longitude, calculateDistance]);

  // Get map center based on user location or default
  const getMapCenter = useCallback((): [number, number] => {
    if (state.latitude && state.longitude) {
      return [state.latitude, state.longitude];
    }
    return [SIDI_BEL_ABBES_CENTER.lat, SIDI_BEL_ABBES_CENTER.lng];
  }, [state.latitude, state.longitude]);

  return {
    ...state,
    getCurrentPosition,
    calculateDistance,
    getDistanceFromUser,
    getMapCenter,
    hasLocation: state.latitude !== null && state.longitude !== null,
    defaultCenter: SIDI_BEL_ABBES_CENTER
  };
}
