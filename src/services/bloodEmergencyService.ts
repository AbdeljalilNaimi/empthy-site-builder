import { supabase } from '@/integrations/supabase/client';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface BloodEmergency {
  id: string;
  provider_id: string;
  provider_name: string | null;
  provider_lat: number | null;
  provider_lng: number | null;
  blood_type_needed: string;
  urgency_level: string;
  status: string;
  responders_count: number;
  message: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface BloodEmergencyResponse {
  id: string;
  emergency_id: string;
  citizen_id: string;
  citizen_name: string | null;
  citizen_phone: string | null;
  status: string;
  created_at: string;
}

export interface DonationRecord {
  id: string;
  citizen_id: string;
  provider_id: string;
  provider_name: string | null;
  blood_type: string;
  donated_at: string;
  emergency_id: string | null;
  notes: string | null;
}

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

// ---- Emergencies ----

export async function broadcastEmergency(data: {
  provider_id: string;
  provider_name?: string;
  provider_lat?: number;
  provider_lng?: number;
  blood_type_needed: string;
  urgency_level: string;
  message?: string;
}) {
  const { data: result, error } = await supabase
    .from('blood_emergencies' as any)
    .insert(data as any)
    .select()
    .single();
  if (error) throw error;
  return result as unknown as BloodEmergency;
}

export async function resolveEmergency(emergencyId: string) {
  const { error } = await supabase
    .from('blood_emergencies' as any)
    .update({ status: 'resolved', resolved_at: new Date().toISOString() } as any)
    .eq('id', emergencyId);
  if (error) throw error;
}

export async function getActiveEmergencies() {
  const { data, error } = await supabase
    .from('blood_emergencies' as any)
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as BloodEmergency[];
}

export async function getEmergenciesByProvider(providerId: string) {
  const { data, error } = await supabase
    .from('blood_emergencies' as any)
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as BloodEmergency[];
}

// ---- Responses ----

export async function respondToEmergency(emergencyId: string, citizenData: {
  citizen_id: string;
  citizen_name?: string;
  citizen_phone?: string;
}) {
  const { data, error } = await supabase
    .from('blood_emergency_responses' as any)
    .insert({ emergency_id: emergencyId, ...citizenData } as any)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as BloodEmergencyResponse;
}

export async function cancelResponse(responseId: string) {
  const { error } = await supabase
    .from('blood_emergency_responses' as any)
    .delete()
    .eq('id', responseId);
  if (error) throw error;
}

export async function getResponsesForEmergency(emergencyId: string) {
  const { data, error } = await supabase
    .from('blood_emergency_responses' as any)
    .select('*')
    .eq('emergency_id', emergencyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as BloodEmergencyResponse[];
}

// ---- Donation History ----

export async function addDonation(data: {
  citizen_id: string;
  provider_id: string;
  provider_name?: string;
  blood_type: string;
  emergency_id?: string;
  notes?: string;
}) {
  const { data: result, error } = await supabase
    .from('donation_history' as any)
    .insert(data as any)
    .select()
    .single();
  if (error) throw error;
  
  // Sync last_donation_date to citizen profile in Firestore
  try {
    const donatedDate = (result as any).donated_at?.split('T')[0] || new Date().toISOString().split('T')[0];
    await updateDoc(doc(db, 'profiles', data.citizen_id), {
      last_donation_date: donatedDate,
      updated_at: serverTimestamp()
    });
  } catch (syncError) {
    console.warn('Could not sync last_donation_date to profile:', syncError);
  }
  
  return result as unknown as DonationRecord;
}

export async function getDonationHistory(citizenId: string) {
  const { data, error } = await supabase
    .from('donation_history' as any)
    .select('*')
    .eq('citizen_id', citizenId)
    .order('donated_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as DonationRecord[];
}

// ---- Realtime ----

export function subscribeToEmergencies(callback: (emergencies: BloodEmergency[]) => void) {
  // Initial fetch
  getActiveEmergencies().then(callback);

  const channel = supabase
    .channel('blood-emergencies-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'blood_emergencies' },
      () => {
        getActiveEmergencies().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToResponses(emergencyId: string, callback: (responses: BloodEmergencyResponse[]) => void) {
  getResponsesForEmergency(emergencyId).then(callback);

  const channel = supabase
    .channel(`blood-responses-${emergencyId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'blood_emergency_responses', filter: `emergency_id=eq.${emergencyId}` },
      () => {
        getResponsesForEmergency(emergencyId).then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
