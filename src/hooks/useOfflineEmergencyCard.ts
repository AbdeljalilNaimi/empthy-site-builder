import { useEffect } from 'react';
import { EmergencyHealthCard } from '@/services/emergencyCardService';

const STORAGE_KEY = 'emergency_card_offline';

export function cacheEmergencyCard(card: EmergencyHealthCard) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...card, _cachedAt: Date.now() }));
  } catch (e) {
    console.warn('Failed to cache emergency card offline', e);
  }
}

export function getCachedEmergencyCard(): EmergencyHealthCard | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _cachedAt, ...card } = parsed;
    return card as EmergencyHealthCard;
  } catch {
    return null;
  }
}

/**
 * Automatically caches the emergency card to localStorage whenever it changes,
 * so the EmergencyCardDisplay can work offline.
 */
export function useOfflineEmergencyCard(card: EmergencyHealthCard | null) {
  useEffect(() => {
    if (card) {
      cacheEmergencyCard(card);
    }
  }, [card]);
}
