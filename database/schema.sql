-- JEE-NEET Preparation App Database Schema
-- Run this in your Supabase SQL Editor

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    category VARCHAR(10) CHECK (category IN ('jee', 'neet')) NOT NULL,
    class_type VARCHAR(10) CHECK (class_type IN ('11th', '12th', 'dropper')) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create files table for uploaded files
CREATE TABLE IF NOT EXISTS files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path TEXT NOT NULL,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    category VARCHAR(10) CHECK (category IN ('jee', 'neet')) NOT NULL,
    class_type VARCHAR(10) CHECK (class_type IN ('11th', '12th', 'dropper')) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    storage_path TEXT NOT NULL,
    is_from_drive BOOLEAN DEFAULT FALSE,
    drive_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create questions table (for future use)
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    solution TEXT,
    difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
    category VARCHAR(10) CHECK (category IN ('jee', 'neet')) NOT NULL,
    class_type VARCHAR(10) CHECK (class_type IN ('11th', '12th', 'dropper')) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    pdf_url TEXT,
    drive_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_folders_category_class ON folders(category, class_type);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_files_category_class ON files(category, class_type);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_created_by ON files(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_category_class ON questions(category, class_type);
CREATE INDEX IF NOT EXISTS idx_questions_folder_id ON questions(folder_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);

-- Enable Row Level Security (RLS)
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all folders" ON folders;
DROP POLICY IF EXISTS "Authenticated users can insert folders" ON folders;
DROP POLICY IF EXISTS "Users can update their own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete their own folders" ON folders;

DROP POLICY IF EXISTS "Users can view all files" ON files;
DROP POLICY IF EXISTS "Authenticated users can insert files" ON files;
DROP POLICY IF EXISTS "Users can update their own files" ON files;
DROP POLICY IF EXISTS "Users can delete their own files" ON files;

DROP POLICY IF EXISTS "Users can view all questions" ON questions;
DROP POLICY IF EXISTS "Authenticated users can insert questions" ON questions;
DROP POLICY IF EXISTS "Users can update their own questions" ON questions;
DROP POLICY IF EXISTS "Users can delete their own questions" ON questions;

-- Create policies for folders table
CREATE POLICY "Users can view all folders" ON folders
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert folders" ON folders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own folders" ON folders
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own folders" ON folders
    FOR DELETE USING (created_by = auth.uid());

-- Create policies for files table
CREATE POLICY "Users can view all files" ON files
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert files" ON files
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own files" ON files
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own files" ON files
    FOR DELETE USING (created_by = auth.uid());

-- Create policies for questions table
CREATE POLICY "Users can view all questions" ON questions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert questions" ON questions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own questions" ON questions
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own questions" ON questions
    FOR DELETE USING (created_by = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
DROP TRIGGER IF EXISTS update_files_updated_at ON files;
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_folders_updated_at 
    BEFORE UPDATE ON folders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at 
    BEFORE UPDATE ON files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at 
    BEFORE UPDATE ON questions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database schema created successfully! You can now use the admin dashboard.' as message;