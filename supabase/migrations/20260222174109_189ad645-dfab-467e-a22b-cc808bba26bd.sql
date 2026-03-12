
-- Table: blood_emergencies
CREATE TABLE public.blood_emergencies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id text NOT NULL,
  provider_name text,
  provider_lat float8,
  provider_lng float8,
  blood_type_needed text NOT NULL,
  urgency_level text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  responders_count integer NOT NULL DEFAULT 0,
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.blood_emergencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read blood emergencies" ON public.blood_emergencies FOR SELECT USING (true);
CREATE POLICY "Anyone can insert blood emergencies" ON public.blood_emergencies FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update blood emergencies" ON public.blood_emergencies FOR UPDATE USING (true);

-- Table: blood_emergency_responses
CREATE TABLE public.blood_emergency_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  emergency_id uuid NOT NULL REFERENCES public.blood_emergencies(id) ON DELETE CASCADE,
  citizen_id text NOT NULL,
  citizen_name text,
  citizen_phone text,
  status text NOT NULL DEFAULT 'on_the_way',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blood_emergency_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read blood emergency responses" ON public.blood_emergency_responses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert blood emergency responses" ON public.blood_emergency_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete blood emergency responses" ON public.blood_emergency_responses FOR DELETE USING (true);
CREATE POLICY "Anyone can update blood emergency responses" ON public.blood_emergency_responses FOR UPDATE USING (true);

-- Table: donation_history
CREATE TABLE public.donation_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_id text NOT NULL,
  provider_id text NOT NULL,
  provider_name text,
  blood_type text NOT NULL,
  donated_at timestamptz NOT NULL DEFAULT now(),
  emergency_id uuid REFERENCES public.blood_emergencies(id) ON DELETE SET NULL,
  notes text
);

ALTER TABLE public.donation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read donation history" ON public.donation_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert donation history" ON public.donation_history FOR INSERT WITH CHECK (true);

-- Trigger to auto-increment/decrement responders_count
CREATE OR REPLACE FUNCTION public.update_responders_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blood_emergencies SET responders_count = responders_count + 1 WHERE id = NEW.emergency_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blood_emergencies SET responders_count = GREATEST(0, responders_count - 1) WHERE id = OLD.emergency_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_blood_emergency_responders
AFTER INSERT OR DELETE ON public.blood_emergency_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_responders_count();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_emergencies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_emergency_responses;
