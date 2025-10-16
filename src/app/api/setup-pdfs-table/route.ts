import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Create chapter_pdfs table
    const { error: tableError } = await (supabase as any)
      .rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS chapter_pdfs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            topic_id UUID NOT NULL REFERENCES batch_subject_topics(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            pdf_url TEXT NOT NULL,
            pdf_type VARCHAR(50) NOT NULL CHECK (pdf_type IN ('note', 'dpp_pdf')),
            pdf_source VARCHAR(50) NOT NULL CHECK (pdf_source IN ('supabase_storage', 'google_drive')),
            file_size BIGINT,
            storage_path TEXT,
            order_index INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `
      });

    // Create indexes
    await (supabase as any).rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_chapter_pdfs_topic_id ON chapter_pdfs(topic_id);
        CREATE INDEX IF NOT EXISTS idx_chapter_pdfs_type ON chapter_pdfs(pdf_type);
        CREATE INDEX IF NOT EXISTS idx_chapter_pdfs_order ON chapter_pdfs(topic_id, pdf_type, order_index);
      `
    });

    // Create trigger (if the function exists)
    await (supabase as any).rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS update_chapter_pdfs_updated_at ON chapter_pdfs;
        CREATE TRIGGER update_chapter_pdfs_updated_at 
            BEFORE UPDATE ON chapter_pdfs 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
      `
    });

    // Create storage bucket
    const { error: bucketError } = await supabase.storage.createBucket('chapter-pdfs', {
      public: true,
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 52428800 // 50MB
    });

    // Ignore bucket error if it already exists
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error("Bucket creation error:", bucketError);
    }

    return NextResponse.json({
      success: true,
      message: "PDF functionality setup completed successfully!",
      details: {
        table: tableError ? "Failed to create table" : "Table created successfully",
        bucket: bucketError ? "Bucket setup had issues" : "Bucket setup completed"
      }
    });
  } catch (error: any) {
    console.error("Error setting up PDFs:", error);
    return NextResponse.json({
      success: false,
      message: "Please manually run the SQL scripts in Supabase",
      error: error?.message || "Unknown error",
      manual_setup: {
        database_schema: `
-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS chapter_pdfs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES batch_subject_topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  pdf_url TEXT NOT NULL,
  pdf_type VARCHAR(50) NOT NULL CHECK (pdf_type IN ('note', 'dpp_pdf')),
  pdf_source VARCHAR(50) NOT NULL CHECK (pdf_source IN ('supabase_storage', 'google_drive')),
  file_size BIGINT,
  storage_path TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chapter_pdfs_topic_id ON chapter_pdfs(topic_id);
CREATE INDEX IF NOT EXISTS idx_chapter_pdfs_type ON chapter_pdfs(pdf_type);
CREATE INDEX IF NOT EXISTS idx_chapter_pdfs_order ON chapter_pdfs(topic_id, pdf_type, order_index);

DROP TRIGGER IF EXISTS update_chapter_pdfs_updated_at ON chapter_pdfs;
CREATE TRIGGER update_chapter_pdfs_updated_at 
    BEFORE UPDATE ON chapter_pdfs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
        `,
        storage_setup: `
-- Run this in Supabase SQL Editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('chapter-pdfs', 'chapter-pdfs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Allow authenticated uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'chapter-pdfs' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow public access" ON storage.objects 
FOR SELECT USING (bucket_id = 'chapter-pdfs');

CREATE POLICY IF NOT EXISTS "Allow authenticated deletes" ON storage.objects 
FOR DELETE USING (bucket_id = 'chapter-pdfs' AND auth.role() = 'authenticated');
        `
      }
    }, { status: 200 });
  }
}