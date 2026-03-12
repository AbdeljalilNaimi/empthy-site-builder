import { useState, useEffect, useCallback, useRef } from 'react';
import { Appointment } from '@/types/appointments';
import type { NotificationPreferences } from '@/types/notifications';

export interface AppointmentNotification {
  id: string;
  appointmentId: string;
  providerName: string;
  oldStatus: string;
  newStatus: string;
  dateTime: string;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY = 'cityhealth_apt_notifications';

const loadNotifications = (): AppointmentNotification[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveNotifications = (notifications: AppointmentNotification[]) => {
  // Keep last 50 notifications max
  const trimmed = notifications.slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
};

export const useAppointmentNotifications = (appointments: Appointment[], appointmentsEnabled: boolean = true) => {
  const [notifications, setNotifications] = useState<AppointmentNotification[]>(loadNotifications);
  const prevStatusMap = useRef<Map<string, string>>(new Map());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (appointments.length === 0) return;

    if (!isFirstLoad.current && appointmentsEnabled) {
      const newNotifs: AppointmentNotification[] = [];
      appointments.forEach((apt) => {
        const prev = prevStatusMap.current.get(apt.id);
        if (prev && prev !== apt.status) {
          newNotifs.push({
            id: crypto.randomUUID(),
            appointmentId: apt.id,
            providerName: apt.providerName,
            oldStatus: prev,
            newStatus: apt.status,
            dateTime: apt.dateTime,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      });

      if (newNotifs.length > 0) {
        setNotifications((prev) => {
          const updated = [...newNotifs, ...prev];
          saveNotifications(updated);
          return updated.slice(0, 50);
        });
      }
    }

    // Update map
    const map = new Map<string, string>();
    appointments.forEach((apt) => map.set(apt.id, apt.status));
    prevStatusMap.current = map;
    isFirstLoad.current = false;
  }, [appointments]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markAsRead, markAllAsRead, clearAll };
};
