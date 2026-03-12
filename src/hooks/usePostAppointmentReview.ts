import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment } from '@/types/appointments';

const LS_KEY = 'dismissed-review-prompts';

function getDismissedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function addDismissedId(id: string) {
  const ids = getDismissedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  }
}

export function usePostAppointmentReview(appointments: Appointment[]) {
  const { user } = useAuth();
  const patientId = user?.uid;

  const completedAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'completed'),
    [appointments]
  );

  const providerIds = useMemo(
    () => [...new Set(completedAppointments.map((a) => a.providerId))],
    [completedAppointments]
  );

  // Check which providers the user already reviewed
  const { data: reviewedProviderIds = [] } = useQuery({
    queryKey: ['reviewed-providers', patientId, providerIds],
    queryFn: async () => {
      if (!patientId || providerIds.length === 0) return [];
      const { data, error } = await supabase
        .from('provider_reviews')
        .select('provider_id')
        .eq('patient_id', patientId)
        .in('provider_id', providerIds);
      if (error) throw error;
      return (data || []).map((r) => r.provider_id);
    },
    enabled: !!patientId && providerIds.length > 0,
    staleTime: 60_000,
  });

  // Find first eligible appointment
  const eligibleAppointment = useMemo(() => {
    const dismissed = getDismissedIds();
    // Sort by date descending to get most recent first
    const sorted = [...completedAppointments].sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );
    return sorted.find(
      (a) =>
        !dismissed.includes(a.id) &&
        !reviewedProviderIds.includes(a.providerId)
    ) || null;
  }, [completedAppointments, reviewedProviderIds]);

  const dismiss = useCallback((appointmentId: string) => {
    addDismissedId(appointmentId);
  }, []);

  return { eligibleAppointment, dismiss, patientId };
}
