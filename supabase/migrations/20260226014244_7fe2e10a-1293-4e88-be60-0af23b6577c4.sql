
-- =============================================
-- ADS MODULE: Tables, RLS, Triggers
-- =============================================

-- 1. Main ads table
CREATE TABLE public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id text NOT NULL,
  provider_name text NOT NULL,
  provider_avatar text,
  provider_type text,
  provider_city text,
  title text NOT NULL,
  short_description text NOT NULL,
  full_description text NOT NULL,
  image_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  is_featured boolean NOT NULL DEFAULT false,
  is_verified_provider boolean NOT NULL DEFAULT false,
  views_count integer NOT NULL DEFAULT 0,
  likes_count integer NOT NULL DEFAULT 0,
  saves_count integer NOT NULL DEFAULT 0,
  rejection_reason text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Ad likes table
CREATE TABLE public.ad_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ad_id, user_id)
);

-- 3. Ad saves table
CREATE TABLE public.ad_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ad_id, user_id)
);

-- 4. Ad reports table
CREATE TABLE public.ad_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  reporter_id text NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- RLS Policies
-- =============================================

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_reports ENABLE ROW LEVEL SECURITY;

-- ads: public read all (filtering by status done in app)
CREATE POLICY "Public read ads" ON public.ads FOR SELECT USING (true);
CREATE POLICY "Anyone can insert ads" ON public.ads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update ads" ON public.ads FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete ads" ON public.ads FOR DELETE USING (true);

-- ad_likes
CREATE POLICY "Public read ad likes" ON public.ad_likes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert ad likes" ON public.ad_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete ad likes" ON public.ad_likes FOR DELETE USING (true);

-- ad_saves
CREATE POLICY "Public read ad saves" ON public.ad_saves FOR SELECT USING (true);
CREATE POLICY "Anyone can insert ad saves" ON public.ad_saves FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete ad saves" ON public.ad_saves FOR DELETE USING (true);

-- ad_reports
CREATE POLICY "Anyone can insert ad reports" ON public.ad_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read ad reports" ON public.ad_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can update ad reports" ON public.ad_reports FOR UPDATE USING (true);

-- =============================================
-- Triggers for likes/saves count
-- =============================================

CREATE OR REPLACE FUNCTION public.update_ad_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ads SET likes_count = likes_count + 1 WHERE id = NEW.ad_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ads SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.ad_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_ad_likes_count
AFTER INSERT OR DELETE ON public.ad_likes
FOR EACH ROW EXECUTE FUNCTION public.update_ad_likes_count();

CREATE OR REPLACE FUNCTION public.update_ad_saves_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ads SET saves_count = saves_count + 1 WHERE id = NEW.ad_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ads SET saves_count = GREATEST(0, saves_count - 1) WHERE id = OLD.ad_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_ad_saves_count
AFTER INSERT OR DELETE ON public.ad_saves
FOR EACH ROW EXECUTE FUNCTION public.update_ad_saves_count();

-- Updated_at trigger for ads
CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW EXECUTE FUNCTION public.update_community_updated_at();

-- Enable realtime for ads
ALTER PUBLICATION supabase_realtime ADD TABLE public.ads;
