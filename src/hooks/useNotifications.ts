import { useState, useEffect, useCallback } from 'react';
import type { Notification, NotificationPreferences } from '@/types/notifications';

const STORAGE_KEY = 'cityhealth_notifications';
const PREFS_KEY = 'cityhealth_notification_prefs';

const defaultPreferences: NotificationPreferences = {
  appointments: true,
  messages: true,
  profileUpdates: true,
  verificationStatus: true,
  emailNotifications: true,
  pushNotifications: true,
  bloodEmergencies: true,
};

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Load notifications from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setNotifications(JSON.parse(stored));
    }

    // Load preferences
    const storedPrefs = localStorage.getItem(PREFS_KEY);
    if (storedPrefs) {
      setPreferences(JSON.parse(storedPrefs));
    }

    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  const sendNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    // Check if this notification type is enabled in preferences
    const typePreferenceMap: Record<string, boolean> = {
      appointment: preferences.appointments,
      message: preferences.messages,
      profile_update: preferences.profileUpdates,
      verification_status: preferences.verificationStatus,
      blood_emergency: preferences.bloodEmergencies,
    };

    const isTypeEnabled = typePreferenceMap[notification.type] ?? true;
    if (!isTypeEnabled) {
      return null;
    }

    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // Show browser notification if enabled
    if (preferences.pushNotifications && permission === 'granted') {
      new window.Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.ico',
        tag: newNotification.id,
      });
    }

    return newNotification;
  }, [preferences, permission]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    preferences,
    permission,
    unreadCount,
    requestPermission,
    sendNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
  };
};
