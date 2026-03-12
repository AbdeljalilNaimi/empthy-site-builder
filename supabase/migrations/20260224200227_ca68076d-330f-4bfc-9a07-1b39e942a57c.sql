
-- Create provider_reviews table
CREATE TABLE public.provider_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.provider_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read provider reviews"
  ON public.provider_reviews FOR SELECT USING (true);

CREATE POLICY "Anyone can insert provider reviews"
  ON public.provider_reviews FOR INSERT WITH CHECK (true);

-- Create provider_reports table
CREATE TABLE public.provider_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id TEXT NOT NULL,
  reporter_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.provider_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert provider reports"
  ON public.provider_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read provider reports"
  ON public.provider_reports FOR SELECT USING (true);
