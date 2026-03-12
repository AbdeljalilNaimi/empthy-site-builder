
CREATE TABLE public.contact_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read contact settings"
  ON public.contact_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update contact settings"
  ON public.contact_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

INSERT INTO public.contact_settings (key, value) VALUES
  ('phone', '+213 48 XX XX XX'),
  ('phone_hours', 'Disponible 8h-20h'),
  ('email', 'contact@cityhealth-sba.dz'),
  ('email_response', 'Réponse sous 24h'),
  ('address', 'Sidi Bel Abbès, Algérie'),
  ('address_city', 'Wilaya de Sidi Bel Abbès'),
  ('working_hours', 'Dim - Jeu: 8h - 17h'),
  ('saturday_hours', 'Sam: 8h - 12h');
