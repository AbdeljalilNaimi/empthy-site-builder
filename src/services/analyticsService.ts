import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AnalyticsEventData {
  event_type: string;
  event_data?: Record<string, any>;
  user_id?: string;
}

class AnalyticsService {
  private sessionId: string;
  private queue: AnalyticsEventData[] = [];
  private flushIntervalMs: number = 5000; // 5 seconds
  private maxQueueSize: number = 10;
  private flushTimerId: ReturnType<typeof setInterval> | null = null;
  private collectionName = 'analytics_events';

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.startAutoFlush();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('ch_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('ch_session_id', sessionId);
    }
    return sessionId;
  }

  private startAutoFlush() {
    this.stopAutoFlush();
    this.flushTimerId = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushIntervalMs);
  }

  private stopAutoFlush() {
    if (this.flushTimerId) {
      clearInterval(this.flushTimerId);
      this.flushTimerId = null;
    }
  }

  track(event_type: string, event_data?: Record<string, any>, user_id?: string) {
    this.queue.push({ event_type, event_data, user_id });
    
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      // Store analytics events in Firestore
      for (const event of events) {
        await addDoc(collection(db, this.collectionName), {
          ...event,
          session_id: this.sessionId,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          timestamp: serverTimestamp()
        });
      }
    } catch {
      // Silently fail analytics
    }
  }

  // Predefined event types
  pageView(page: string, user_id?: string) {
    this.track('page_view', { page }, user_id);
  }

  search(query: string, filters?: any, user_id?: string) {
    this.track('search', { query, filters }, user_id);
  }

  providerView(providerId: string, providerName: string, user_id?: string) {
    this.track('provider_view', { providerId, providerName }, user_id);
  }

  bookingAttempt(providerId: string, user_id?: string) {
    this.track('booking_attempt', { providerId }, user_id);
  }

  reviewSubmit(providerId: string, rating: number, user_id?: string) {
    this.track('review_submit', { providerId, rating }, user_id);
  }

  chatInteraction(messageCount: number, user_id?: string) {
    this.track('chat_interaction', { messageCount }, user_id);
  }
  destroy() {
    this.stopAutoFlush();
    this.flush(); // final flush of queued events
  }
}

export const analytics = new AnalyticsService();

window.addEventListener('beforeunload', () => {
  analytics.destroy();
});
