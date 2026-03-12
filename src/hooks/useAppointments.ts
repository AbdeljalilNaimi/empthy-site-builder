import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { playNotificationSound } from '@/utils/notificationSound';
import { 
  getAppointmentsByPatient, 
  getAppointmentsByProvider, 
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment as cancelAppointmentService,
  confirmAppointment as confirmAppointmentService,
  completeAppointment as completeAppointmentService,
  rescheduleAppointment as rescheduleAppointmentService,
  subscribeToPatientAppointments,
  subscribeToProviderAppointments,
  getUpcomingAppointmentsCount,
  getAvailabilityForDate,
  subscribeToBookedSlots,
  type AvailabilitySlot
} from '@/services/appointmentService';
import { Appointment } from '@/types/appointments';
import { useAuth } from '@/contexts/AuthContext';

// Query keys factory
export const appointmentKeys = {
  all: ['appointments'] as const,
  byPatient: (patientId: string) => [...appointmentKeys.all, 'patient', patientId] as const,
  byProvider: (providerId: string) => [...appointmentKeys.all, 'provider', providerId] as const,
  upcomingCount: (providerId: string) => [...appointmentKeys.all, 'upcoming', providerId] as const,
};

// Hook to fetch appointments for current patient (user) - one-shot
export const usePatientAppointments = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: appointmentKeys.byPatient(user?.uid || ''),
    queryFn: () => getAppointmentsByPatient(user!.uid),
    enabled: !!user?.uid,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to fetch appointments for a provider
export const useProviderAppointments = (providerId: string | undefined) => {
  return useQuery({
    queryKey: appointmentKeys.byProvider(providerId || ''),
    queryFn: () => getAppointmentsByProvider(providerId!),
    enabled: !!providerId,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook to get upcoming appointments count for a provider
export const useUpcomingAppointmentsCount = (providerId: string | undefined) => {
  return useQuery({
    queryKey: appointmentKeys.upcomingCount(providerId || ''),
    queryFn: () => getUpcomingAppointmentsCount(providerId!),
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to create a new appointment
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      providerId: string;
      providerName: string;
      patientName: string;
      patientPhone: string;
      patientEmail?: string;
      dateTime: string;
      notes?: string;
      urgency?: 'urgent' | 'routine';
    }) => {
      return createAppointment({
        ...data,
        patientId: user?.uid || 'anonymous',
        status: 'pending',
      });
    },
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      if (user?.uid) {
        queryClient.invalidateQueries({ queryKey: appointmentKeys.byPatient(user.uid) });
      }
      queryClient.invalidateQueries({ queryKey: appointmentKeys.byProvider(variables.providerId) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcomingCount(variables.providerId) });
    },
  });
};

// Hook to update appointment status
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Appointment['status'] }) => {
      return updateAppointmentStatus(id, status);
    },
    onSuccess: () => {
      // Invalidate all appointment queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

// Hook to cancel an appointment
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cancelAppointmentService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

// Hook to confirm an appointment (provider)
export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: confirmAppointmentService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

// Hook to complete an appointment (provider)
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: completeAppointmentService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

// Hook to reschedule an appointment (provider)
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, newDateTime, rescheduledBy }: { id: string; newDateTime: string; rescheduledBy: string }) => {
      return rescheduleAppointmentService(id, newDateTime, rescheduledBy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

// Hook for real-time patient appointments
export const useRealtimePatientAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const prevStatusMap = useRef<Map<string, string>>(new Map());
  const isFirstLoad = useRef(true);
  
  useEffect(() => {
    if (!user?.uid) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    
    const unsubscribe = subscribeToPatientAppointments(user.uid, (data) => {
      // Detect status changes and show toasts (skip first load)
      if (!isFirstLoad.current) {
        data.forEach((apt) => {
          const prevStatus = prevStatusMap.current.get(apt.id);
          if (prevStatus && prevStatus !== apt.status) {
            playNotificationSound();
            if (apt.status === 'confirmed') {
              toast.success(`RDV confirmé`, {
                description: `Votre rendez-vous avec ${apt.providerName} a été approuvé.`,
                duration: 6000,
              });
            } else if (apt.status === 'cancelled') {
              toast.error(`RDV refusé`, {
                description: `Votre rendez-vous avec ${apt.providerName} a été annulé.`,
                duration: 6000,
              });
            } else if (apt.status === 'completed') {
              toast.info(`RDV terminé`, {
                description: `Votre rendez-vous avec ${apt.providerName} est marqué comme terminé.`,
                duration: 6000,
              });
            }
          }
        });
      }
      
      // Update status map
      const newMap = new Map<string, string>();
      data.forEach((apt) => newMap.set(apt.id, apt.status));
      prevStatusMap.current = newMap;
      isFirstLoad.current = false;
      
      setAppointments(data);
      setLoading(false);
    }, () => {
      setAppointments([]);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user?.uid]);
  
  return { appointments, loading };
};

// Hook for real-time provider appointments with new RDV notifications
export const useRealtimeProviderAppointments = (providerId: string | undefined) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const knownIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);
  
  useEffect(() => {
    if (!providerId) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    
    const unsubscribe = subscribeToProviderAppointments(providerId, (data) => {
      // Detect new appointments (skip first load)
      if (!isFirstLoad.current) {
        data.forEach((apt) => {
          if (!knownIds.current.has(apt.id)) {
            playNotificationSound();
            toast.info(`Nouveau rendez-vous`, {
              description: `${apt.patientName} a demandé un RDV le ${new Date(apt.dateTime).toLocaleDateString('fr-FR')} à ${new Date(apt.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
              duration: 8000,
            });
          }
        });
      }

      // Update known IDs
      knownIds.current = new Set(data.map((apt) => apt.id));
      isFirstLoad.current = false;
      
      setAppointments(data);
      setLoading(false);
    }, () => {
      setAppointments([]);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [providerId]);
  
  return { appointments, loading };
};

// Hook to get availability slots for a specific date
export const useAvailabilitySlots = (
  providerId: string | undefined,
  date: Date | undefined,
  schedule?: Record<string, { open: string; close: string; closed?: boolean } | undefined>
) => {
  return useQuery({
    queryKey: ['availability', providerId, date?.toDateString()],
    queryFn: () => getAvailabilityForDate(providerId!, date!, schedule),
    enabled: !!providerId && !!date,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time feel
  });
};

// Hook for real-time availability with subscriptions
export const useRealtimeAvailability = (
  providerId: string | undefined,
  date: Date | undefined,
  schedule?: Record<string, { open: string; close: string; closed?: boolean } | undefined>
) => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Initial fetch
  useEffect(() => {
    if (!providerId || !date) {
      setSlots([]);
      setLoading(false);
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const availability = await getAvailabilityForDate(providerId, date, schedule);
        setSlots(availability);
      } catch (error) {
        console.error('Error fetching availability:', error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [providerId, date?.toDateString(), schedule]);

  // Real-time subscription for booked slots updates
  useEffect(() => {
    if (!providerId || !date) return;

    const unsubscribe = subscribeToBookedSlots(providerId, date, async () => {
      // When booked slots change, refetch availability
      try {
        const availability = await getAvailabilityForDate(providerId, date, schedule);
        setSlots(availability);
        // Also invalidate the query cache
        queryClient.invalidateQueries({ queryKey: ['availability', providerId, date.toDateString()] });
      } catch (error) {
        console.error('Error updating availability:', error);
      }
    });

    return () => unsubscribe();
  }, [providerId, date?.toDateString(), schedule, queryClient]);

  return { slots, loading };
};

// Export type for use in components
export type { AvailabilitySlot };
