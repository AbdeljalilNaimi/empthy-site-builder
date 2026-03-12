import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  subscribeToNotifications, 
  markAsRead, 
  markAllAsRead,
  type AdminNotification 
} from '@/services/adminNotificationService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RealtimeEvent {
  id: string;
  type: 'new_registration' | 'new_report_provider' | 'new_report_ad' | 'new_report_community' | 'firestore_notification';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  source: 'firestore' | 'supabase';
}

export function useAdminRealtimeNotifications() {
  const [firestoreNotifications, setFirestoreNotifications] = useState<AdminNotification[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const prevCountRef = useRef<Record<string, number>>({});

  // Subscribe to Firestore admin_notifications
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(
      (notifications) => {
        setFirestoreNotifications(notifications);
      },
      30,
      (error) => console.warn('Firestore notification subscription error:', error)
    );
    return unsubscribe;
  }, []);

  // Subscribe to Supabase realtime for reports
  useEffect(() => {
    const channel = supabase
      .channel('admin-reports-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'provider_reports' }, (payload) => {
        const event: RealtimeEvent = {
          id: payload.new.id,
          type: 'new_report_provider',
          title: 'Nouveau signalement de profil',
          message: `Raison: ${payload.new.reason}`,
          timestamp: new Date(),
          isRead: false,
          source: 'supabase',
        };
        setRealtimeEvents(prev => [event, ...prev.slice(0, 49)]);
        toast({ title: '🚩 Nouveau signalement', description: `Signalement de profil: ${payload.new.reason}` });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ad_reports' }, (payload) => {
        const event: RealtimeEvent = {
          id: payload.new.id,
          type: 'new_report_ad',
          title: 'Nouveau signalement d\'annonce',
          message: `Raison: ${payload.new.reason}`,
          timestamp: new Date(),
          isRead: false,
          source: 'supabase',
        };
        setRealtimeEvents(prev => [event, ...prev.slice(0, 49)]);
        toast({ title: '🚩 Signalement d\'annonce', description: `Raison: ${payload.new.reason}` });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_reports' }, (payload) => {
        const event: RealtimeEvent = {
          id: payload.new.id,
          type: 'new_report_community',
          title: 'Nouveau signalement communauté',
          message: `Raison: ${payload.new.reason}`,
          timestamp: new Date(),
          isRead: false,
          source: 'supabase',
        };
        setRealtimeEvents(prev => [event, ...prev.slice(0, 49)]);
        toast({ title: '🚩 Signalement communauté', description: `Raison: ${payload.new.reason}` });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [toast]);

  // Compute merged unread count
  useEffect(() => {
    const firestoreUnread = firestoreNotifications.filter(n => !n.isRead).length;
    const supabaseUnread = realtimeEvents.filter(e => !e.isRead).length;
    setUnreadCount(firestoreUnread + supabaseUnread);
  }, [firestoreNotifications, realtimeEvents]);

  // Show toast for new Firestore notifications
  useEffect(() => {
    if (firestoreNotifications.length > 0) {
      const currentUnread = firestoreNotifications.filter(n => !n.isRead).length;
      const prevUnread = prevCountRef.current.firestore || 0;
      if (currentUnread > prevUnread && prevUnread > 0) {
        const newest = firestoreNotifications[0];
        if (newest && !newest.isRead) {
          toast({ title: `🔔 ${newest.title}`, description: newest.message });
        }
      }
      prevCountRef.current.firestore = currentUnread;
    }
  }, [firestoreNotifications, toast]);

  // Merge all notifications for display
  const allNotifications: RealtimeEvent[] = [
    ...firestoreNotifications.map(n => ({
      id: n.id || '',
      type: 'firestore_notification' as const,
      title: n.title,
      message: n.message,
      timestamp: n.createdAt?.toDate?.() || new Date(),
      isRead: n.isRead,
      source: 'firestore' as const,
    })),
    ...realtimeEvents,
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 50);

  const handleMarkAsRead = useCallback(async (id: string, source: 'firestore' | 'supabase') => {
    if (source === 'firestore') {
      await markAsRead(id);
    } else {
      setRealtimeEvents(prev => prev.map(e => e.id === id ? { ...e, isRead: true } : e));
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
    setRealtimeEvents(prev => prev.map(e => ({ ...e, isRead: true })));
  }, []);

  return {
    notifications: allNotifications,
    unreadCount,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
  };
}
