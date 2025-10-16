-- Updated RLS Policies for Student Access to Course Materials
-- This file updates RLS policies to allow students to view all course content
-- Run this in your Supabase SQL Editor after creating the base tables

-- =============================================================================
-- BATCH SUBJECTS POLICIES
-- =============================================================================

-- Allow students to view ALL batch subjects (not just enrolled ones)
-- This enables browsing subjects with access control handled at the application level
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
-- BATCH SUBJECT TOPICS (CHAPTERS) POLICIES
-- =============================================================================

-- Allow students to view ALL topics/chapters
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
-- CHAPTER VIDEOS POLICIES
-- =============================================================================

-- Enable RLS on chapter_videos if not already enabled
ALTER TABLE chapter_videos ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all videos
DROP POLICY IF EXISTS "Admin can manage all chapter videos" ON chapter_videos;
CREATE POLICY "Admin can manage all chapter videos" ON chapter_videos
    FOR ALL USING (
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'admin'
        )
        OR
        -- Batch creators can manage videos in their batches
        EXISTS (
            SELECT 1 FROM batch_subject_topics bst
            JOIN batch_subjects bs ON bs.id = bst.subject_id
            JOIN batches b ON b.id = bs.batch_id
            WHERE bst.id = chapter_videos.topic_id
            AND b.created_by = auth.uid()
        )
    );

-- Allow students to view ALL chapter videos
DROP POLICY IF EXISTS "Students can view chapter videos" ON chapter_videos;
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
-- CHAPTER PDFS POLICIES
-- =============================================================================

-- Enable RLS on chapter_pdfs if not already enabled
ALTER TABLE chapter_pdfs ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all PDFs
DROP POLICY IF EXISTS "Admin can manage all chapter pdfs" ON chapter_pdfs;
CREATE POLICY "Admin can manage all chapter pdfs" ON chapter_pdfs
    FOR ALL USING (
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'admin'
        )
        OR
        -- Batch creators can manage PDFs in their batches
        EXISTS (
            SELECT 1 FROM batch_subject_topics bst
            JOIN batch_subjects bs ON bs.id = bst.subject_id
            JOIN batches b ON b.id = bs.batch_id
            WHERE bst.id = chapter_pdfs.topic_id
            AND b.created_by = auth.uid()
        )
    );

-- Allow students to view ALL chapter PDFs
DROP POLICY IF EXISTS "Students can view chapter pdfs" ON chapter_pdfs;
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
-- BATCH SUBJECT PROGRESS POLICIES (Updated)
-- =============================================================================

-- Keep the existing progress policies but make them more permissive
DROP POLICY IF EXISTS "Students can manage their own progress" ON batch_subject_progress;
CREATE POLICY "Students can manage their own progress" ON batch_subject_progress
    FOR ALL USING (
        student_id = auth.uid()
        AND auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'student'
        )
    );

-- =============================================================================
-- BATCHES POLICIES (Updated for better student access)
-- =============================================================================

-- Allow students to view all batches (for browsing)
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
-- BATCH ENROLLMENTS POLICIES (Updated)
-- =============================================================================

-- Students can view and manage their own enrollments
DROP POLICY IF EXISTS "Students can manage their enrollments" ON batch_enrollments;
CREATE POLICY "Students can manage their enrollments" ON batch_enrollments
    FOR ALL USING (
        student_id = auth.uid()
        AND auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'student'
        )
    );

-- Admins can view all enrollments
DROP POLICY IF EXISTS "Admin can view all enrollments" ON batch_enrollments;
CREATE POLICY "Admin can view all enrollments" ON batch_enrollments
    FOR SELECT USING (
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'admin'
        )
        OR
        -- Batch creators can view enrollments in their batches
        EXISTS (
            SELECT 1 FROM batches b
            WHERE b.id = batch_enrollments.batch_id
            AND b.created_by = auth.uid()
        )
    );

-- =============================================================================
-- HELPER FUNCTIONS FOR ACCESS CONTROL
-- =============================================================================

-- Function to check if a student is enrolled in a specific batch
CREATE OR REPLACE FUNCTION is_student_enrolled_in_batch(student_uuid UUID, batch_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM batch_enrollments
        WHERE student_id = student_uuid
        AND batch_id = batch_uuid
        AND status = 'active'
        AND payment_status = 'paid'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a student has access to a topic
CREATE OR REPLACE FUNCTION student_has_topic_access(student_uuid UUID, topic_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM batch_subject_topics bst
        JOIN batch_subjects bs ON bs.id = bst.subject_id
        JOIN batch_enrollments be ON be.batch_id = bs.batch_id
        WHERE bst.id = topic_uuid
        AND be.student_id = student_uuid
        AND be.status = 'active'
        AND be.payment_status = 'paid'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- REFRESH POLICIES
-- =============================================================================

-- Force refresh of all policies
NOTIFY pgrst, 'reload schema';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'RLS policies updated successfully for student access to all course materials';
    RAISE NOTICE 'Students can now view:';
    RAISE NOTICE '- All batch subjects (with application-level access control)';
    RAISE NOTICE '- All chapter topics';
    RAISE NOTICE '- All chapter videos';
    RAISE NOTICE '- All chapter PDFs';
    RAISE NOTICE '- All active batches';
    RAISE NOTICE 'Access control is now handled at the application level for better UX';
END $$;