-- Create storage bucket for provider catalogs
INSERT INTO storage.buckets (id, name, public)
VALUES ('provider-catalogs', 'provider-catalogs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload catalogs
CREATE POLICY "Authenticated users can upload catalogs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'provider-catalogs');

-- Anyone can view catalogs (public bucket)
CREATE POLICY "Public can view catalogs"
ON storage.objects FOR SELECT
USING (bucket_id = 'provider-catalogs');

-- Users can update their own catalogs
CREATE POLICY "Users can update own catalogs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'provider-catalogs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own catalogs
CREATE POLICY "Users can delete own catalogs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'provider-catalogs' AND auth.uid()::text = (storage.foldername(name))[1]);