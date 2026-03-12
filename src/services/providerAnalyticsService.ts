import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Event types for provider analytics
export type ProviderEventType = 
  | 'profile_view'
  | 'contact_click_phone'
  | 'contact_click_email'
  | 'contact_click_whatsapp'
  | 'favorite_add'
  | 'favorite_remove'
  | 'appointment_request'
  | 'ad_view'
  | 'ad_click'
  | 'search_appearance';

export interface ProviderAnalyticsEvent {
  providerId: string;
  eventType: ProviderEventType;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface ProviderStats {
  profileViews: number;
  profileViewsTrend: number;
  phoneClicks: number;
  phoneClicksTrend: number;
  emailClicks: number;
  whatsappClicks: number;
  totalContactClicks: number;
  favoritesCount: number;
  favoritesTrend: number;
  appointmentRequests: number;
  searchAppearances: number;
  adViews: number;
  adClicks: number;
  adCTR: number;
}

export interface DailyStats {
  date: string;
  views: number;
  contacts: number;
  favorites: number;
}

const ANALYTICS_COLLECTION = 'provider_analytics';

// Get or create session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('ch_analytics_session');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('ch_analytics_session', sessionId);
  }
  return sessionId;
}

// Track a provider event
export async function trackProviderEvent(
  providerId: string,
  eventType: ProviderEventType,
  metadata?: Record<string, any>,
  userId?: string,
  providerUserId?: string
): Promise<void> {
  try {
    await addDoc(collection(db, ANALYTICS_COLLECTION), {
      providerId,
      providerUserId: providerUserId || null,
      eventType,
      timestamp: serverTimestamp(),
      metadata: metadata || {},
      userId: userId || null,
      sessionId: getSessionId(),
    });
  } catch (error) {
    // Silently fail analytics - don't break user experience
    console.warn('Analytics tracking failed:', error);
  }
}

// Get provider stats for a date range (providerUserId = auth UID)
export async function getProviderStats(
  providerUserId: string,
  days: number = 30
): Promise<ProviderStats> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startTimestamp = Timestamp.fromDate(startDate);

  // Previous period for trend calculation
  const previousStartDate = new Date();
  previousStartDate.setDate(previousStartDate.getDate() - (days * 2));
  const previousStartTimestamp = Timestamp.fromDate(previousStartDate);

  try {
    // Current period events
    const currentQuery = query(
      collection(db, ANALYTICS_COLLECTION),
      where('providerUserId', '==', providerUserId),
      where('timestamp', '>=', startTimestamp)
    );
    const currentSnapshot = await getDocs(currentQuery);
    
    // Previous period events (for trends)
    const previousQuery = query(
      collection(db, ANALYTICS_COLLECTION),
      where('providerUserId', '==', providerUserId),
      where('timestamp', '>=', previousStartTimestamp),
      where('timestamp', '<', startTimestamp)
    );
    const previousSnapshot = await getDocs(previousQuery);

    // Count events by type
    const countEvents = (snapshot: typeof currentSnapshot, type: ProviderEventType | ProviderEventType[]) => {
      const types = Array.isArray(type) ? type : [type];
      return snapshot.docs.filter(doc => types.includes(doc.data().eventType)).length;
    };

    // Current stats
    const profileViews = countEvents(currentSnapshot, 'profile_view');
    const phoneClicks = countEvents(currentSnapshot, 'contact_click_phone');
    const emailClicks = countEvents(currentSnapshot, 'contact_click_email');
    const whatsappClicks = countEvents(currentSnapshot, 'contact_click_whatsapp');
    const favoritesAdded = countEvents(currentSnapshot, 'favorite_add');
    const favoritesRemoved = countEvents(currentSnapshot, 'favorite_remove');
    const appointmentRequests = countEvents(currentSnapshot, 'appointment_request');
    const searchAppearances = countEvents(currentSnapshot, 'search_appearance');
    const adViews = countEvents(currentSnapshot, 'ad_view');
    const adClicks = countEvents(currentSnapshot, 'ad_click');

    // Previous stats for trends
    const prevProfileViews = countEvents(previousSnapshot, 'profile_view');
    const prevPhoneClicks = countEvents(previousSnapshot, 'contact_click_phone');
    const prevFavorites = countEvents(previousSnapshot, 'favorite_add') - countEvents(previousSnapshot, 'favorite_remove');

    // Calculate trends (percentage change)
    const calculateTrend = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      profileViews,
      profileViewsTrend: calculateTrend(profileViews, prevProfileViews),
      phoneClicks,
      phoneClicksTrend: calculateTrend(phoneClicks, prevPhoneClicks),
      emailClicks,
      whatsappClicks,
      totalContactClicks: phoneClicks + emailClicks + whatsappClicks,
      favoritesCount: favoritesAdded - favoritesRemoved,
      favoritesTrend: calculateTrend(favoritesAdded, prevFavorites),
      appointmentRequests,
      searchAppearances,
      adViews,
      adClicks,
      adCTR: adViews > 0 ? Math.round((adClicks / adViews) * 100) : 0,
    };
  } catch (error) {
    console.error('Failed to get provider stats:', error);
    return {
      profileViews: 0,
      profileViewsTrend: 0,
      phoneClicks: 0,
      phoneClicksTrend: 0,
      emailClicks: 0,
      whatsappClicks: 0,
      totalContactClicks: 0,
      favoritesCount: 0,
      favoritesTrend: 0,
      appointmentRequests: 0,
      searchAppearances: 0,
      adViews: 0,
      adClicks: 0,
      adCTR: 0,
    };
  }
}

// Get daily stats for charts (providerUserId = auth UID)
export async function getDailyStats(
  providerUserId: string,
  days: number = 30
): Promise<DailyStats[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startTimestamp = Timestamp.fromDate(startDate);

  try {
    const q = query(
      collection(db, ANALYTICS_COLLECTION),
      where('providerUserId', '==', providerUserId),
      where('timestamp', '>=', startTimestamp),
      orderBy('timestamp', 'asc')
    );
    const snapshot = await getDocs(q);

    // Group by date
    const dailyMap = new Map<string, { views: number; contacts: number; favorites: number }>();

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, { views: 0, contacts: 0, favorites: 0 });
    }

    // Count events
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = data.timestamp?.toDate?.()?.toISOString?.()?.split('T')[0];
      if (date && dailyMap.has(date)) {
        const stats = dailyMap.get(date)!;
        switch (data.eventType) {
          case 'profile_view':
            stats.views++;
            break;
          case 'contact_click_phone':
          case 'contact_click_email':
          case 'contact_click_whatsapp':
            stats.contacts++;
            break;
          case 'favorite_add':
            stats.favorites++;
            break;
        }
      }
    });

    return Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }));
  } catch (error) {
    console.error('Failed to get daily stats:', error);
    return [];
  }
}

// Convenience methods for common tracking events
export const providerAnalytics = {
  trackProfileView: (providerId: string, userId?: string, providerUserId?: string) =>
    trackProviderEvent(providerId, 'profile_view', {}, userId, providerUserId),

  trackPhoneClick: (providerId: string, userId?: string, providerUserId?: string) =>
    trackProviderEvent(providerId, 'contact_click_phone', {}, userId, providerUserId),

  trackEmailClick: (providerId: string, userId?: string, providerUserId?: string) =>
    trackProviderEvent(providerId, 'contact_click_email', {}, userId, providerUserId),

  trackWhatsappClick: (providerId: string, userId?: string, providerUserId?: string) =>
    trackProviderEvent(providerId, 'contact_click_whatsapp', {}, userId, providerUserId),

  trackFavoriteAdd: (providerId: string, userId?: string, providerUserId?: string) =>
    trackProviderEvent(providerId, 'favorite_add', {}, userId, providerUserId),

  trackFavoriteRemove: (providerId: string, userId?: string, providerUserId?: string) =>
    trackProviderEvent(providerId, 'favorite_remove', {}, userId, providerUserId),

  trackAdView: (providerId: string, adId: string, providerUserId?: string) =>
    trackProviderEvent(providerId, 'ad_view', { adId }, undefined, providerUserId),

  trackAdClick: (providerId: string, adId: string, providerUserId?: string) =>
    trackProviderEvent(providerId, 'ad_click', { adId }, undefined, providerUserId),

  trackSearchAppearance: (providerId: string, searchQuery?: string, providerUserId?: string) =>
    trackProviderEvent(providerId, 'search_appearance', { searchQuery }, undefined, providerUserId),

  trackAppointmentRequest: (providerId: string, userId?: string, providerUserId?: string) =>
    trackProviderEvent(providerId, 'appointment_request', {}, userId, providerUserId),
};
