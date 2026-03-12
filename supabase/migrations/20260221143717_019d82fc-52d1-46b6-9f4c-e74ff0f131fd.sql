
-- Community post categories enum
CREATE TYPE public.community_category AS ENUM ('suggestion', 'feedback', 'experience', 'question');

-- Community report reasons enum
CREATE TYPE public.community_report_reason AS ENUM ('spam', 'abuse', 'false_info', 'other');

-- 1. Community Posts
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_avatar TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category community_category NOT NULL DEFAULT 'suggestion',
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  upvotes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read community posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert community posts" ON public.community_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own posts" ON public.community_posts FOR UPDATE USING (true);
CREATE POLICY "Users can delete own posts" ON public.community_posts FOR DELETE USING (true);

-- 2. Community Comments
CREATE TABLE public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_avatar TEXT,
  parent_comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  upvotes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read community comments" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON public.community_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own comments" ON public.community_comments FOR UPDATE USING (true);
CREATE POLICY "Users can delete own comments" ON public.community_comments FOR DELETE USING (true);

-- 3. Community Upvotes
CREATE TABLE public.community_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_post_upvote UNIQUE (user_id, post_id),
  CONSTRAINT unique_comment_upvote UNIQUE (user_id, comment_id),
  CONSTRAINT upvote_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

ALTER TABLE public.community_upvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read upvotes" ON public.community_upvotes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert upvotes" ON public.community_upvotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete upvotes" ON public.community_upvotes FOR DELETE USING (true);

-- 4. Community Reports
CREATE TABLE public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id TEXT NOT NULL,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  reason community_report_reason NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert reports" ON public.community_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read reports" ON public.community_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can update reports" ON public.community_reports FOR UPDATE USING (true);

-- 5. Triggers for counters
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_comment_added
  AFTER INSERT ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

CREATE TRIGGER on_comment_deleted
  AFTER DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

CREATE OR REPLACE FUNCTION public.update_upvotes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE community_posts SET upvotes_count = upvotes_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      UPDATE community_comments SET upvotes_count = upvotes_count + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE community_posts SET upvotes_count = GREATEST(0, upvotes_count - 1) WHERE id = OLD.post_id;
    ELSIF OLD.comment_id IS NOT NULL THEN
      UPDATE community_comments SET upvotes_count = GREATEST(0, upvotes_count - 1) WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_upvote_added
  AFTER INSERT ON public.community_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.update_upvotes_count();

CREATE TRIGGER on_upvote_removed
  AFTER DELETE ON public.community_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.update_upvotes_count();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_community_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_community_updated_at();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_community_updated_at();

-- Indexes
CREATE INDEX idx_community_posts_category ON public.community_posts(category);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_posts_pinned ON public.community_posts(is_pinned DESC, created_at DESC);
CREATE INDEX idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX idx_community_upvotes_post_id ON public.community_upvotes(post_id);
CREATE INDEX idx_community_upvotes_user_id ON public.community_upvotes(user_id);
