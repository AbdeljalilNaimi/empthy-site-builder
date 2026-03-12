import { supabase } from '@/integrations/supabase/client';

export interface EmergencyHealthCard {
  id?: string;
  user_id: string;
  blood_group: string | null;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: string[];
  vaccination_history: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  is_public_for_emergencies: boolean;
  share_token: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function getEmergencyCard(userId: string): Promise<EmergencyHealthCard | null> {
  const { data, error } = await supabase
    .from('emergency_health_cards')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching emergency card:', error);
    return null;
  }
  return data as EmergencyHealthCard | null;
}

export async function getEmergencyCardByToken(token: string): Promise<EmergencyHealthCard | null> {
  const { data, error } = await supabase
    .from('emergency_health_cards')
    .select('*')
    .eq('share_token', token)
    .maybeSingle();

  if (error) {
    console.error('Error fetching emergency card by token:', error);
    return null;
  }
  return data as EmergencyHealthCard | null;
}

function generateShareToken(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8);
}

// --- Consultation History ---

export interface CardConsultationLog {
  id: string;
  card_id: string;
  card_user_id: string;
  provider_uid: string;
  provider_name: string | null;
  provider_type: string | null;
  scanned_at: string;
}

export async function logCardConsultation(
  cardId: string,
  cardUserId: string,
  providerUid: string,
  providerName: string | null,
  providerType: string | null
): Promise<void> {
  const { error } = await supabase
    .from('card_consultation_logs')
    .insert({
      card_id: cardId,
      card_user_id: cardUserId,
      provider_uid: providerUid,
      provider_name: providerName,
      provider_type: providerType,
    });
  if (error) console.error('Error logging consultation:', error);
}

export async function getConsultationHistory(userId: string): Promise<CardConsultationLog[]> {
  const { data, error } = await supabase
    .from('card_consultation_logs')
    .select('*')
    .eq('card_user_id', userId)
    .order('scanned_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching consultation history:', error);
    return [];
  }
  return (data || []) as CardConsultationLog[];
}

export async function upsertEmergencyCard(
  userId: string,
  data: Partial<Omit<EmergencyHealthCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<EmergencyHealthCard | null> {
  const existing = await getEmergencyCard(userId);

  const payload = {
    user_id: userId,
    blood_group: data.blood_group ?? existing?.blood_group ?? null,
    allergies: data.allergies ?? existing?.allergies ?? [],
    chronic_conditions: data.chronic_conditions ?? existing?.chronic_conditions ?? [],
    current_medications: data.current_medications ?? existing?.current_medications ?? [],
    vaccination_history: data.vaccination_history ?? existing?.vaccination_history ?? null,
    emergency_contact_name: data.emergency_contact_name ?? existing?.emergency_contact_name ?? null,
    emergency_contact_phone: data.emergency_contact_phone ?? existing?.emergency_contact_phone ?? null,
    is_public_for_emergencies: data.is_public_for_emergencies ?? existing?.is_public_for_emergencies ?? false,
    share_token: existing?.share_token ?? generateShareToken(),
  };

  if (existing) {
    const { data: updated, error } = await supabase
      .from('emergency_health_cards')
      .update(payload)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating emergency card:', error);
      return null;
    }
    return updated as EmergencyHealthCard;
  } else {
    const { data: inserted, error } = await supabase
      .from('emergency_health_cards')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error inserting emergency card:', error);
      return null;
    }
    return inserted as EmergencyHealthCard;
  }
}
