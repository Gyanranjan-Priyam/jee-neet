-- SIMPLE RLS POLICY UPDATES FOR STUDENT ACCESS
-- Copy and paste these queries directly into your Supabase SQL Editor
-- Execute them one by one or all at once

-- =============================================================================
-- 1. UPDATE BATCH SUBJECTS POLICY - Allow students to view all subjects
-- =============================================================================

DROP POLICY IF EXISTS "Students can view subjects in their batches" ON batch_subjects;

CREATE POLICY "Students can view all batch subjects" ON batch_subjects
    FOR SELECT USING (
        -- Students can view all subjects
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'student'
        )
        OR
        -- Admins can view all subjects  
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'admin'
        )
        OR
        -- Batch creators can view their subjects
        EXISTS (
            SELECT 1 FROM batches b 
            WHERE b.id = batch_subjects.batch_id 
            AND b.created_by = auth.uid()
        )
    );

-- =============================================================================
-- 2. UPDATE BATCH SUBJECT TOPICS POLICY - Allow students to view all chapters
-- =============================================================================

DROP POLICY IF EXISTS "Students can view topics in their batch subjects" ON batch_subject_topics;

CREATE POLICY "Students can view all batch subject topics" ON batch_subject_topics
    FOR SELECT USING (
        -- Students can view all topics
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'student'
        )
        OR
        -- Admins can view all topics
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'admin'
        )
        OR
        -- Batch creators can view topics in their batches
        EXISTS (
            SELECT 1 FROM batch_subjects bs
            JOIN batches b ON b.id = bs.batch_id
            WHERE bs.id = batch_subject_topics.subject_id
            AND b.created_by = auth.uid()
        )
    );

-- =============================================================================
-- 3. ENABLE RLS AND CREATE POLICIES FOR CHAPTER VIDEOS
-- =============================================================================

-- Enable RLS on chapter_videos table
ALTER TABLE chapter_videos ENABLE ROW LEVEL SECURITY;

-- Admin policy for chapter videos
DROP POLICY IF EXISTS "Admin can manage all chapter videos" ON chapter_videos;
CREATE POLICY "Admin can manage all chapter videos" ON chapter_videos
    FOR ALL USING (
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM batch_subject_topics bst
            JOIN batch_subjects bs ON bs.id = bst.subject_id
            JOIN batches b ON b.id = bs.batch_id
            WHERE bst.id = chapter_videos.topic_id
            AND b.created_by = auth.uid()
        )
    );

-- Student policy for chapter videos
DROP POLICY IF EXISTS "Students can view all chapter videos" ON chapter_videos;
CREATE POLICY "Students can view all chapter videos" ON chapter_videos
    FOR SELECT USING (
        -- Students can view all videos
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'student'
        )
        OR
        -- Admins can view all videos
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'admin'
        )
        OR
        -- Batch creators can view videos in their batches
        EXISTS (
            SELECT 1 FROM batch_subject_topics bst
            JOIN batch_subjects bs ON bs.id = bst.subject_id
            JOIN batches b ON b.id = bs.batch_id
            WHERE bst.id = chapter_videos.topic_id
            AND b.created_by = auth.uid()
        )
    );

-- =============================================================================
-- 4. ENABLE RLS AND CREATE POLICIES FOR CHAPTER PDFS
-- =============================================================================

-- Enable RLS on chapter_pdfs table
ALTER TABLE chapter_pdfs ENABLE ROW LEVEL SECURITY;

-- Admin policy for chapter PDFs
DROP POLICY IF EXISTS "Admin can manage all chapter pdfs" ON chapter_pdfs;
CREATE POLICY "Admin can manage all chapter pdfs" ON chapter_pdfs
    FOR ALL USING (
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM batch_subject_topics bst
            JOIN batch_subjects bs ON bs.id = bst.subject_id
            JOIN batches b ON b.id = bs.batch_id
            WHERE bst.id = chapter_pdfs.topic_id
            AND b.created_by = auth.uid()
        )
    );

-- Student policy for chapter PDFs
DROP POLICY IF EXISTS "Students can view all chapter pdfs" ON chapter_pdfs;
CREATE POLICY "Students can view all chapter pdfs" ON chapter_pdfs
    FOR SELECT USING (
        -- Students can view all PDFs
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'student'
        )
        OR
        -- Admins can view all PDFs
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'admin'
        )
        OR
        -- Batch creators can view PDFs in their batches
        EXISTS (
            SELECT 1 FROM batch_subject_topics bst
            JOIN batch_subjects bs ON bs.id = bst.subject_id
            JOIN batches b ON b.id = bs.batch_id
            WHERE bst.id = chapter_pdfs.topic_id
            AND b.created_by = auth.uid()
        )
    );

-- =============================================================================
-- 5. UPDATE BATCHES POLICY - Allow students to view all active batches
-- =============================================================================

DROP POLICY IF EXISTS "Students can view all batches" ON batches;
CREATE POLICY "Students can view all batches" ON batches
    FOR SELECT USING (
        -- Students can view all active batches
        (status = 'active' AND auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'student'
        ))
        OR
        -- Admins can view all batches
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'admin'
        )
        OR
        -- Batch creators can view their batches
        created_by = auth.uid()
    );

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- This will show in the Supabase logs
SELECT 'RLS policies updated successfully! Students can now access all course materials.' as result;