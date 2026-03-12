
CREATE TABLE public.card_consultation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id uuid NOT NULL REFERENCES public.emergency_health_cards(id) ON DELETE CASCADE,
  card_user_id text NOT NULL,
  provider_uid text NOT NULL,
  provider_name text,
  provider_type text,
  scanned_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.card_consultation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert consultation logs"
ON public.card_consultation_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read consultation logs"
ON public.card_consultation_logs FOR SELECT USING (true);

CREATE INDEX idx_consultation_logs_card_user_id ON public.card_consultation_logs(card_user_id);
CREATE INDEX idx_consultation_logs_scanned_at ON public.card_consultation_logs(scanned_at DESC);
