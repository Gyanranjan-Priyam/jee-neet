import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST() {
  try {
    const supabase = createAdminClient();

    // First, let's check if the table already exists
    const { data: tableExists } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'chapter_videos')
      .single();

    if (tableExists) {
      return NextResponse.json({
        success: true,
        message: "Chapter videos table already exists"
      });
    }

    // Create table using direct SQL execution
    // For now, let's return a manual setup instruction
    return NextResponse.json({
      success: false,
      message: "Please run the database schema manually",
      instructions: "Run: psql -h localhost -U postgres -d jee_neet_dev -f database/chapter_videos_schema.sql",
      sql: `
CREATE TABLE IF NOT EXISTS chapter_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES batch_subject_topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  video_type VARCHAR(50) NOT NULL CHECK (video_type IN ('lecture', 'dpp_video')),
  video_source VARCHAR(50) NOT NULL CHECK (video_source IN ('youtube', 'google_drive', 'direct_link')),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chapter_videos_chapter_id ON chapter_videos(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_videos_type ON chapter_videos(video_type);
CREATE INDEX IF NOT EXISTS idx_chapter_videos_order ON chapter_videos(chapter_id, video_type, order_index);
      `
    });

  } catch (error) {
    console.error("Error setting up chapter videos table:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}