
CREATE TABLE public.emergency_health_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL UNIQUE,
  blood_group text,
  allergies text[] DEFAULT '{}',
  chronic_conditions text[] DEFAULT '{}',
  current_medications text[] DEFAULT '{}',
  vaccination_history text,
  emergency_contact_name text,
  emergency_contact_phone text,
  is_public_for_emergencies boolean NOT NULL DEFAULT false,
  share_token text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_health_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read emergency cards" ON public.emergency_health_cards FOR SELECT USING (true);
CREATE POLICY "Anyone can insert emergency cards" ON public.emergency_health_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update emergency cards" ON public.emergency_health_cards FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete emergency cards" ON public.emergency_health_cards FOR DELETE USING (true);

CREATE TRIGGER update_emergency_health_cards_updated_at
  BEFORE UPDATE ON public.emergency_health_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_community_updated_at();
