-- 1. Create review_reports table
CREATE TABLE public.review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.provider_reviews(id) ON DELETE CASCADE,
  reporter_id text NOT NULL,
  reporter_type text NOT NULL DEFAULT 'provider',
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read review reports" ON public.review_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can insert review reports" ON public.review_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update review reports" ON public.review_reports FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete review reports" ON public.review_reports FOR DELETE USING (true);

-- 2. Enable DELETE and UPDATE on provider_reviews
CREATE POLICY "Anyone can delete provider reviews" ON public.provider_reviews FOR DELETE USING (true);
CREATE POLICY "Anyone can update provider reviews" ON public.provider_reviews FOR UPDATE USING (true);