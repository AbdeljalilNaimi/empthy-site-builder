-- Performance indexes for providers_public API queries

-- B-Tree indexes for filtered queries
CREATE INDEX IF NOT EXISTS idx_providers_public_type ON public.providers_public (type);
CREATE INDEX IF NOT EXISTS idx_providers_public_city ON public.providers_public (city);
CREATE INDEX IF NOT EXISTS idx_providers_public_is_24h ON public.providers_public (is_24h);
CREATE INDEX IF NOT EXISTS idx_providers_public_is_verified ON public.providers_public (is_verified);
CREATE INDEX IF NOT EXISTS idx_providers_public_rating ON public.providers_public (rating DESC);

-- GIN index for full-text search on the ?q= endpoint
CREATE INDEX IF NOT EXISTS idx_providers_public_search 
ON public.providers_public 
USING gin(to_tsvector('french', coalesce(name, '') || ' ' || coalesce(specialty, '') || ' ' || coalesce(address, '') || ' ' || coalesce(city, '')));
