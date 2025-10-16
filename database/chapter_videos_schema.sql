-- Chapter Videos Schema
-- This table stores video content for chapters (lectures and DPP videos)

CREATE TABLE IF NOT EXISTS chapter_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES batch_subject_topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  original_url TEXT, -- For storing original YouTube/Drive URLs
  video_type VARCHAR(50) NOT NULL CHECK (video_type IN ('lecture', 'dpp_video')),
  video_source VARCHAR(50) NOT NULL CHECK (video_source IN ('youtube', 'google_drive', 'direct_link', 'cloudinary')),
  thumbnail_url TEXT,
  file_size BIGINT, -- File size in bytes for uploaded videos
  duration INTEGER, -- Video duration in seconds
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chapter_videos_topic_id ON chapter_videos(topic_id);
CREATE INDEX IF NOT EXISTS idx_chapter_videos_type ON chapter_videos(video_type);
CREATE INDEX IF NOT EXISTS idx_chapter_videos_order ON chapter_videos(topic_id, video_type, order_index);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chapter_videos_updated_at 
    BEFORE UPDATE ON chapter_videos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();