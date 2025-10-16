-- Chapter PDFs Schema
-- This table stores PDF content for chapters (notes and DPP PDFs)

CREATE TABLE IF NOT EXISTS chapter_pdfs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES batch_subject_topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  pdf_url TEXT NOT NULL,
  pdf_type VARCHAR(50) NOT NULL CHECK (pdf_type IN ('note', 'dpp_pdf')),
  pdf_source VARCHAR(50) NOT NULL CHECK (pdf_source IN ('supabase_storage', 'google_drive')),
  file_size BIGINT,
  storage_path TEXT, -- For supabase storage files
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chapter_pdfs_topic_id ON chapter_pdfs(topic_id);
CREATE INDEX IF NOT EXISTS idx_chapter_pdfs_type ON chapter_pdfs(pdf_type);
CREATE INDEX IF NOT EXISTS idx_chapter_pdfs_order ON chapter_pdfs(topic_id, pdf_type, order_index);

-- Create updated_at trigger (reuse the existing function)
CREATE TRIGGER update_chapter_pdfs_updated_at 
    BEFORE UPDATE ON chapter_pdfs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();