-- Setup storage bucket for chapter PDFs
-- Run this SQL in your Supabase SQL Editor

-- Create storage bucket for chapter PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('chapter-pdfs', 'chapter-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the chapter-pdfs bucket

-- Allow authenticated users to upload PDFs
DROP POLICY IF EXISTS "Authenticated users can upload PDFs" ON storage.objects;
CREATE POLICY "Authenticated users can upload PDFs"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'chapter-pdfs' AND 
  auth.role() = 'authenticated'
);

-- Allow everyone to view PDFs (public access)
DROP POLICY IF EXISTS "Anyone can view PDFs" ON storage.objects;
CREATE POLICY "Anyone can view PDFs"
ON storage.objects FOR SELECT 
USING (bucket_id = 'chapter-pdfs');

-- Allow authenticated users to delete their uploaded PDFs
DROP POLICY IF EXISTS "Authenticated users can delete PDFs" ON storage.objects;
CREATE POLICY "Authenticated users can delete PDFs"
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'chapter-pdfs' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update PDF metadata
DROP POLICY IF EXISTS "Authenticated users can update PDFs" ON storage.objects;
CREATE POLICY "Authenticated users can update PDFs"
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'chapter-pdfs' AND 
  auth.role() = 'authenticated'
);

SELECT 'PDF storage bucket setup completed successfully!' as message;