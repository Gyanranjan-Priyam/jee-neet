-- Batch Enrollments Schema
-- This file creates the batch_enrollments table for managing student enrollments

-- Create batch_enrollments table
CREATE TABLE IF NOT EXISTS batch_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('pending', 'active', 'inactive', 'completed', 'dropped')) DEFAULT 'pending',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
    payment_amount DECIMAL(10,2),
    payment_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(batch_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_batch_id ON batch_enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_student_id ON batch_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_status ON batch_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_payment_status ON batch_enrollments(payment_status);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_enrolled_at ON batch_enrollments(enrolled_at);

-- Create trigger for updated_at column
DROP TRIGGER IF EXISTS update_batch_enrollments_updated_at ON batch_enrollments;
CREATE TRIGGER update_batch_enrollments_updated_at
    BEFORE UPDATE ON batch_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE batch_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for batch_enrollments
DROP POLICY IF EXISTS "Admin can manage all enrollments" ON batch_enrollments;
CREATE POLICY "Admin can manage all enrollments" ON batch_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM batches b 
            WHERE b.id = batch_enrollments.batch_id 
            AND b.created_by = auth.uid()
        )
        OR 
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'admin'
        )
    );

DROP POLICY IF EXISTS "Students can view their own enrollments" ON batch_enrollments;
CREATE POLICY "Students can view their own enrollments" ON batch_enrollments
    FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update their own enrollment status" ON batch_enrollments;
CREATE POLICY "Students can update their own enrollment status" ON batch_enrollments
    FOR UPDATE USING (
        student_id = auth.uid() 
        AND status IN ('active', 'inactive')
    );

-- Create a function to auto-update enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_subjects INTEGER;
    completed_subjects INTEGER;
    new_progress INTEGER;
BEGIN
    -- Count total subjects in the batch
    SELECT COUNT(*) INTO total_subjects
    FROM batch_subjects
    WHERE batch_id = NEW.batch_id;
    
    -- Count completed subjects for this student
    SELECT COUNT(*) INTO completed_subjects
    FROM batch_subject_progress bsp
    JOIN batch_subjects bs ON bs.id = bsp.subject_id
    WHERE bs.batch_id = NEW.batch_id
    AND bsp.student_id = NEW.student_id
    AND bsp.progress_percentage = 100;
    
    -- Calculate overall progress
    IF total_subjects > 0 THEN
        new_progress := (completed_subjects * 100) / total_subjects;
    ELSE
        new_progress := 0;
    END IF;
    
    -- Update enrollment progress
    UPDATE batch_enrollments
    SET progress_percentage = new_progress,
        updated_at = NOW()
    WHERE batch_id = NEW.batch_id AND student_id = NEW.student_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update enrollment progress when subject progress changes
DROP TRIGGER IF EXISTS trigger_update_enrollment_progress ON batch_subject_progress;
CREATE TRIGGER trigger_update_enrollment_progress
    AFTER INSERT OR UPDATE ON batch_subject_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_enrollment_progress();

-- Insert sample enrollment data (optional - for development)
DO $$
DECLARE
    sample_batch_id UUID;
    sample_student_id UUID;
BEGIN
    -- Get a sample batch and create a test student enrollment
    SELECT id INTO sample_batch_id FROM batches LIMIT 1;
    
    -- Get or create a sample student user
    SELECT id INTO sample_student_id 
    FROM auth.users 
    WHERE raw_user_meta_data->>'user_type' = 'student' 
    LIMIT 1;
    
    -- If we have both batch and student, create enrollment
    IF sample_batch_id IS NOT NULL AND sample_student_id IS NOT NULL THEN
        INSERT INTO batch_enrollments (batch_id, student_id, status, payment_status, enrolled_at, started_at)
        VALUES (sample_batch_id, sample_student_id, 'active', 'paid', NOW(), NOW())
        ON CONFLICT (batch_id, student_id) DO NOTHING;
    END IF;
END $$;