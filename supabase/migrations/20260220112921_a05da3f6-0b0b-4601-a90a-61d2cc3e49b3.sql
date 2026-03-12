-- Create the pdfs storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to pdfs
CREATE POLICY "Public read access for pdfs" ON storage.objects
FOR SELECT USING (bucket_id = 'pdfs');

-- Allow authenticated uploads to pdfs (we use anon key so allow all inserts for now)
CREATE POLICY "Allow uploads to pdfs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pdfs');

-- Allow updates (upsert) to pdfs
CREATE POLICY "Allow updates to pdfs" ON storage.objects
FOR UPDATE USING (bucket_id = 'pdfs');

-- Allow deletes from pdfs
CREATE POLICY "Allow deletes from pdfs" ON storage.objects
FOR DELETE USING (bucket_id = 'pdfs');