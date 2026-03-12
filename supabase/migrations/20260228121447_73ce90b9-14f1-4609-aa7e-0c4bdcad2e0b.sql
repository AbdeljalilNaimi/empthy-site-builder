
DROP POLICY IF EXISTS "Providers can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Providers can update images" ON storage.objects;
DROP POLICY IF EXISTS "Providers can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload provider images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update provider images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete provider images" ON storage.objects;

CREATE POLICY "Anyone can upload provider images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'provider-images');

CREATE POLICY "Anyone can update provider images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'provider-images');

CREATE POLICY "Anyone can delete provider images"
ON storage.objects FOR DELETE
USING (bucket_id = 'provider-images');
