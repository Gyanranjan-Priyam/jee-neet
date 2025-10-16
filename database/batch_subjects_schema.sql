-- Batch Subjects Schema
-- This file creates tables for managing subjects within batches

-- Create batch_subjects table
CREATE TABLE IF NOT EXISTS batch_subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_hours INTEGER DEFAULT 0,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create batch_subject_topics table
CREATE TABLE IF NOT EXISTS batch_subject_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID NOT NULL REFERENCES batch_subjects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create batch_subject_progress table for tracking student progress
CREATE TABLE IF NOT EXISTS batch_subject_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID NOT NULL REFERENCES batch_subjects(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_accessed TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER DEFAULT 0, -- in minutes
    completed_topics INTEGER DEFAULT 0,
    total_topics INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subject_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_batch_subjects_batch_id ON batch_subjects(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_subjects_status ON batch_subjects(status);
CREATE INDEX IF NOT EXISTS idx_batch_subjects_difficulty ON batch_subjects(difficulty);
CREATE INDEX IF NOT EXISTS idx_batch_subjects_order ON batch_subjects(batch_id, order_index);

CREATE INDEX IF NOT EXISTS idx_batch_subject_topics_subject_id ON batch_subject_topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_batch_subject_topics_order ON batch_subject_topics(subject_id, order_index);
CREATE INDEX IF NOT EXISTS idx_batch_subject_topics_completed ON batch_subject_topics(is_completed);

CREATE INDEX IF NOT EXISTS idx_batch_subject_progress_subject_id ON batch_subject_progress(subject_id);
CREATE INDEX IF NOT EXISTS idx_batch_subject_progress_student_id ON batch_subject_progress(student_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_batch_subjects_updated_at ON batch_subjects;
CREATE TRIGGER update_batch_subjects_updated_at
    BEFORE UPDATE ON batch_subjects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_batch_subject_topics_updated_at ON batch_subject_topics;
CREATE TRIGGER update_batch_subject_topics_updated_at
    BEFORE UPDATE ON batch_subject_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_batch_subject_progress_updated_at ON batch_subject_progress;
CREATE TRIGGER update_batch_subject_progress_updated_at
    BEFORE UPDATE ON batch_subject_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE batch_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_subject_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_subject_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for batch_subjects
DROP POLICY IF EXISTS "Admin can manage all batch subjects" ON batch_subjects;
CREATE POLICY "Admin can manage all batch subjects" ON batch_subjects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM batches b 
            WHERE b.id = batch_subjects.batch_id 
            AND b.created_by = auth.uid()
        )
        OR 
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'admin'
        )
    );

DROP POLICY IF EXISTS "Students can view subjects in their batches" ON batch_subjects;
CREATE POLICY "Students can view subjects in their batches" ON batch_subjects
    FOR SELECT USING (
        -- Check if batch_enrollments table exists and user is enrolled
        (EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'batch_enrollments')
         AND EXISTS (
            SELECT 1 FROM batch_enrollments be
            WHERE be.batch_id = batch_subjects.batch_id
            AND be.student_id = auth.uid()
            AND be.status = 'active'
        ))
        OR
        -- Fallback: allow students to view if batch_enrollments doesn't exist
        (NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'batch_enrollments')
         AND auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'student'
        ))
    );

-- RLS Policies for batch_subject_topics
DROP POLICY IF EXISTS "Admin can manage all batch subject topics" ON batch_subject_topics;
CREATE POLICY "Admin can manage all batch subject topics" ON batch_subject_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM batch_subjects bs
            JOIN batches b ON b.id = bs.batch_id
            WHERE bs.id = batch_subject_topics.subject_id
            AND (
                b.created_by = auth.uid()
                OR auth.uid() IN (
                    SELECT u.id FROM auth.users u
                    WHERE u.raw_user_meta_data->>'user_type' = 'admin'
                )
            )
        )
    );

DROP POLICY IF EXISTS "Students can view topics in their batch subjects" ON batch_subject_topics;
CREATE POLICY "Students can view topics in their batch subjects" ON batch_subject_topics
    FOR SELECT USING (
        -- Check if batch_enrollments table exists and user is enrolled
        (EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'batch_enrollments')
         AND EXISTS (
            SELECT 1 FROM batch_subjects bs
            JOIN batch_enrollments be ON be.batch_id = bs.batch_id
            WHERE bs.id = batch_subject_topics.subject_id
            AND be.student_id = auth.uid()
            AND be.status = 'active'
        ))
        OR
        -- Fallback: allow students to view if batch_enrollments doesn't exist
        (NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'batch_enrollments')
         AND auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'student'
        ))
    );

-- RLS Policies for batch_subject_progress
DROP POLICY IF EXISTS "Admin can view all progress" ON batch_subject_progress;
CREATE POLICY "Admin can view all progress" ON batch_subject_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM batch_subjects bs
            JOIN batches b ON b.id = bs.batch_id
            WHERE bs.id = batch_subject_progress.subject_id
            AND (
                b.created_by = auth.uid()
                OR auth.uid() IN (
                    SELECT u.id FROM auth.users u
                    WHERE u.raw_user_meta_data->>'user_type' = 'admin'
                )
            )
        )
    );

DROP POLICY IF EXISTS "Students can manage their own progress" ON batch_subject_progress;
CREATE POLICY "Students can manage their own progress" ON batch_subject_progress
    FOR ALL USING (
        student_id = auth.uid()
        AND (
            -- Check if batch_enrollments table exists and user is enrolled
            (EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'batch_enrollments')
             AND EXISTS (
                SELECT 1 FROM batch_subjects bs
                JOIN batch_enrollments be ON be.batch_id = bs.batch_id
                WHERE bs.id = batch_subject_progress.subject_id
                AND be.student_id = auth.uid()
                AND be.status = 'active'
            ))
            OR
            -- Fallback: allow students to manage progress if batch_enrollments doesn't exist
            (NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'batch_enrollments')
             AND auth.uid() IN (
                SELECT u.id FROM auth.users u
                WHERE u.raw_user_meta_data->>'user_type' = 'student'
            ))
        )
    );

-- Insert sample data for development (optional)
-- This will be removed in production
DO $$
DECLARE
    sample_batch_id UUID;
    physics_subject_id UUID;
    chemistry_subject_id UUID;
    math_subject_id UUID;
BEGIN
    -- Get a sample batch ID (assuming batches table exists with some data)
    SELECT id INTO sample_batch_id FROM batches LIMIT 1;
    
    IF sample_batch_id IS NOT NULL THEN
        -- Insert sample subjects
        INSERT INTO batch_subjects (batch_id, name, description, difficulty, estimated_hours, order_index)
        VALUES 
            (sample_batch_id, 'Physics', 'Classical mechanics, thermodynamics, and modern physics', 'advanced', 120, 1),
            (sample_batch_id, 'Chemistry', 'Organic, inorganic, and physical chemistry', 'intermediate', 100, 2),
            (sample_batch_id, 'Mathematics', 'Calculus, algebra, coordinate geometry, and trigonometry', 'advanced', 140, 3)
        RETURNING id INTO physics_subject_id;

        -- Get the inserted subject IDs
        SELECT id INTO physics_subject_id FROM batch_subjects WHERE batch_id = sample_batch_id AND name = 'Physics';
        SELECT id INTO chemistry_subject_id FROM batch_subjects WHERE batch_id = sample_batch_id AND name = 'Chemistry';
        SELECT id INTO math_subject_id FROM batch_subjects WHERE batch_id = sample_batch_id AND name = 'Mathematics';

        -- Insert sample topics for Physics
        IF physics_subject_id IS NOT NULL THEN
            INSERT INTO batch_subject_topics (subject_id, name, order_index)
            VALUES 
                (physics_subject_id, 'Mechanics', 1),
                (physics_subject_id, 'Thermodynamics', 2),
                (physics_subject_id, 'Optics', 3),
                (physics_subject_id, 'Modern Physics', 4),
                (physics_subject_id, 'Electricity & Magnetism', 5);
        END IF;

        -- Insert sample topics for Chemistry
        IF chemistry_subject_id IS NOT NULL THEN
            INSERT INTO batch_subject_topics (subject_id, name, order_index)
            VALUES 
                (chemistry_subject_id, 'Organic Chemistry', 1),
                (chemistry_subject_id, 'Inorganic Chemistry', 2),
                (chemistry_subject_id, 'Physical Chemistry', 3),
                (chemistry_subject_id, 'Chemical Bonding', 4);
        END IF;

        -- Insert sample topics for Mathematics
        IF math_subject_id IS NOT NULL THEN
            INSERT INTO batch_subject_topics (subject_id, name, order_index)
            VALUES 
                (math_subject_id, 'Calculus', 1),
                (math_subject_id, 'Algebra', 2),
                (math_subject_id, 'Coordinate Geometry', 3),
                (math_subject_id, 'Trigonometry', 4),
                (math_subject_id, 'Statistics', 5);
        END IF;
    END IF;
END $$;

-- Create a function to calculate subject progress
CREATE OR REPLACE FUNCTION calculate_subject_progress(subject_id_param UUID, student_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    total_topics INTEGER;
    completed_topics INTEGER;
    progress_percentage INTEGER;
BEGIN
    -- Count total topics for the subject
    SELECT COUNT(*) INTO total_topics
    FROM batch_subject_topics
    WHERE subject_id = subject_id_param;
    
    -- Count completed topics
    SELECT COUNT(*) INTO completed_topics
    FROM batch_subject_topics
    WHERE subject_id = subject_id_param AND is_completed = TRUE;
    
    -- Calculate percentage
    IF total_topics > 0 THEN
        progress_percentage := (completed_topics * 100) / total_topics;
    ELSE
        progress_percentage := 0;
    END IF;
    
    -- Update or insert progress record
    INSERT INTO batch_subject_progress (subject_id, student_id, progress_percentage, completed_topics, total_topics)
    VALUES (subject_id_param, student_id_param, progress_percentage, completed_topics, total_topics)
    ON CONFLICT (subject_id, student_id)
    DO UPDATE SET
        progress_percentage = EXCLUDED.progress_percentage,
        completed_topics = EXCLUDED.completed_topics,
        total_topics = EXCLUDED.total_topics,
        updated_at = NOW();
    
    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update progress when topics are completed
CREATE OR REPLACE FUNCTION update_subject_progress_on_topic_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if completion status changed
    IF (OLD.is_completed IS DISTINCT FROM NEW.is_completed) THEN
        -- Check if batch_enrollments table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'batch_enrollments') THEN
            -- Update progress for all students in this batch
            INSERT INTO batch_subject_progress (subject_id, student_id, progress_percentage, completed_topics, total_topics)
            SELECT 
                NEW.subject_id,
                be.student_id,
                COALESCE(
                    (SELECT COUNT(*) * 100 / NULLIF((SELECT COUNT(*) FROM batch_subject_topics WHERE subject_id = NEW.subject_id), 0)
                     FROM batch_subject_topics 
                     WHERE subject_id = NEW.subject_id AND is_completed = TRUE), 0
                ),
                (SELECT COUNT(*) FROM batch_subject_topics WHERE subject_id = NEW.subject_id AND is_completed = TRUE),
                (SELECT COUNT(*) FROM batch_subject_topics WHERE subject_id = NEW.subject_id)
            FROM batch_subjects bs
            JOIN batch_enrollments be ON be.batch_id = bs.batch_id
            WHERE bs.id = NEW.subject_id AND be.status = 'active'
            ON CONFLICT (subject_id, student_id)
            DO UPDATE SET
                progress_percentage = EXCLUDED.progress_percentage,
                completed_topics = EXCLUDED.completed_topics,
                total_topics = EXCLUDED.total_topics,
                updated_at = NOW();
        ELSE
            -- Fallback: Just log the topic completion without student progress tracking
            RAISE NOTICE 'Topic completion recorded but batch_enrollments table not found for full progress tracking';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subject_progress ON batch_subject_topics;
CREATE TRIGGER trigger_update_subject_progress
    AFTER UPDATE ON batch_subject_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_subject_progress_on_topic_completion();