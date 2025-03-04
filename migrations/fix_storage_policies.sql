-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anyone to view images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own images" ON storage.objects;

-- Make sure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create a policy to allow users to upload files to their own folder
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create a policy to allow users to update files in their own folder
CREATE POLICY "Users can update files in their own folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'article-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create a policy to allow users to delete files in their own folder
CREATE POLICY "Users can delete files in their own folder"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'article-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create a policy to allow anyone to view files
CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'article-images'); 