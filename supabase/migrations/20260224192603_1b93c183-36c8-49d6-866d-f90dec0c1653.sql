
-- Create storage bucket for provider images (logos and gallery)
INSERT INTO storage.buckets (id, name, public)
VALUES ('provider-images', 'provider-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view provider images (public bucket)
CREATE POLICY "Public read provider images"
ON storage.objects FOR SELECT
USING (bucket_id = 'provider-images');

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Authenticated users can upload provider images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'provider-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update provider images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'provider-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete provider images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'provider-images'
  AND auth.role() = 'authenticated'
);
