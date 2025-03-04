-- Add featured_image_path column to articles table
ALTER TABLE public.articles
ADD COLUMN featured_image_path TEXT;

-- Create a storage bucket for article images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for article images
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images');

-- Allow anyone to view images
CREATE POLICY "Allow anyone to view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'article-images');

-- Allow users to update their own images
CREATE POLICY "Allow users to update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'article-images' AND auth.uid() = owner);

-- Allow users to delete their own images
CREATE POLICY "Allow users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'article-images' AND auth.uid() = owner); 