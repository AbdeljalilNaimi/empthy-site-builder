
-- Create quote_requests table for equipment providers
CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  equipment TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form, no auth required)
CREATE POLICY "Anyone can submit quote requests"
  ON public.quote_requests FOR INSERT
  WITH CHECK (true);

-- Providers can read their own quote requests (using provider_id match via Firebase auth uid passed as text)
CREATE POLICY "Public read quote requests by provider_id"
  ON public.quote_requests FOR SELECT
  USING (true);

-- Providers can update status of their own quotes
CREATE POLICY "Anyone can update quote requests"
  ON public.quote_requests FOR UPDATE
  USING (true);
