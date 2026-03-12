
-- ============================================
-- Health Content Hub: Research & Scientific Publications
-- ============================================

-- 1. Main publications table
CREATE TABLE public.research_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id text NOT NULL,
  provider_name text NOT NULL,
  provider_avatar text,
  provider_type text,
  provider_city text,
  title text NOT NULL,
  abstract text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  doi text,
  pdf_url text,
  status text NOT NULL DEFAULT 'pending',
  is_featured boolean NOT NULL DEFAULT false,
  is_verified_provider boolean NOT NULL DEFAULT false,
  views_count integer NOT NULL DEFAULT 0,
  reactions_count integer NOT NULL DEFAULT 0,
  saves_count integer NOT NULL DEFAULT 0,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Provider-only reactions
CREATE TABLE public.article_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL REFERENCES public.research_articles(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  reaction_type text NOT NULL DEFAULT 'like',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(article_id, user_id)
);

-- 3. Saves (any authenticated user)
CREATE TABLE public.article_saves (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL REFERENCES public.research_articles(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(article_id, user_id)
);

-- 4. Views tracking
CREATE TABLE public.article_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL REFERENCES public.research_articles(id) ON DELETE CASCADE,
  viewer_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE public.research_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

-- research_articles: full open access (app-level enforcement)
CREATE POLICY "Public read research articles" ON public.research_articles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert research articles" ON public.research_articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update research articles" ON public.research_articles FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete research articles" ON public.research_articles FOR DELETE USING (true);

-- article_reactions
CREATE POLICY "Public read article reactions" ON public.article_reactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert article reactions" ON public.article_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete article reactions" ON public.article_reactions FOR DELETE USING (true);

-- article_saves
CREATE POLICY "Public read article saves" ON public.article_saves FOR SELECT USING (true);
CREATE POLICY "Anyone can insert article saves" ON public.article_saves FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete article saves" ON public.article_saves FOR DELETE USING (true);

-- article_views
CREATE POLICY "Public read article views" ON public.article_views FOR SELECT USING (true);
CREATE POLICY "Anyone can insert article views" ON public.article_views FOR INSERT WITH CHECK (true);

-- ============================================
-- Trigger functions for count updates
-- ============================================
CREATE OR REPLACE FUNCTION public.update_article_reactions_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.research_articles SET reactions_count = reactions_count + 1 WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.research_articles SET reactions_count = GREATEST(0, reactions_count - 1) WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_article_saves_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.research_articles SET saves_count = saves_count + 1 WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.research_articles SET saves_count = GREATEST(0, saves_count - 1) WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- ============================================
-- Triggers
-- ============================================
CREATE TRIGGER on_article_reaction_change
  AFTER INSERT OR DELETE ON public.article_reactions
  FOR EACH ROW EXECUTE FUNCTION public.update_article_reactions_count();

CREATE TRIGGER on_article_save_change
  AFTER INSERT OR DELETE ON public.article_saves
  FOR EACH ROW EXECUTE FUNCTION public.update_article_saves_count();
