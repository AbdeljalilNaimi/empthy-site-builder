
-- =============================================
-- CityHealth Public API System - Database Schema
-- =============================================

-- 1. API Keys table
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,
  key_suffix TEXT NOT NULL,
  app_name TEXT,
  app_description TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  rate_limit_per_day INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read api_keys" ON public.api_keys FOR SELECT USING (true);
CREATE POLICY "Public insert api_keys" ON public.api_keys FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update api_keys" ON public.api_keys FOR UPDATE USING (true);
CREATE POLICY "Public delete api_keys" ON public.api_keys FOR DELETE USING (true);

-- 2. API Usage table
CREATE TABLE public.api_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  request_count INTEGER NOT NULL DEFAULT 0,
  endpoint TEXT NOT NULL,
  UNIQUE (api_key_id, date, endpoint)
);

ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read api_usage" ON public.api_usage FOR SELECT USING (true);
CREATE POLICY "Public insert api_usage" ON public.api_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update api_usage" ON public.api_usage FOR UPDATE USING (true);

-- 3. API Logs table
CREATE TABLE public.api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read api_logs" ON public.api_logs FOR SELECT USING (true);
CREATE POLICY "Public insert api_logs" ON public.api_logs FOR INSERT WITH CHECK (true);

-- Index for log cleanup and querying
CREATE INDEX idx_api_logs_created_at ON public.api_logs(created_at);
CREATE INDEX idx_api_logs_api_key_id ON public.api_logs(api_key_id);
CREATE INDEX idx_api_usage_date ON public.api_usage(api_key_id, date);

-- 4. Providers Public table (for API consumption)
CREATE TABLE public.providers_public (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  specialty TEXT,
  address TEXT,
  city TEXT,
  area TEXT,
  phone TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_24h BOOLEAN NOT NULL DEFAULT false,
  is_open BOOLEAN NOT NULL DEFAULT true,
  rating DOUBLE PRECISION DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  description TEXT,
  languages TEXT[],
  image_url TEXT,
  night_duty BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.providers_public ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read providers_public" ON public.providers_public FOR SELECT USING (true);
CREATE POLICY "Public insert providers_public" ON public.providers_public FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update providers_public" ON public.providers_public FOR UPDATE USING (true);
CREATE POLICY "Public delete providers_public" ON public.providers_public FOR DELETE USING (true);

-- Full-text search index on providers_public
CREATE INDEX idx_providers_public_search ON public.providers_public 
  USING gin(to_tsvector('french', coalesce(name, '') || ' ' || coalesce(specialty, '') || ' ' || coalesce(address, '') || ' ' || coalesce(city, '')));

-- NOTE: For api_logs cleanup, set up pg_cron:
-- SELECT cron.schedule('cleanup-api-logs', '0 3 * * *', $$DELETE FROM public.api_logs WHERE created_at < NOW() - INTERVAL '30 days'$$);
