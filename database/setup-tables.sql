-- Step-by-step Database Setup
-- Run this file section by section to avoid dependency issues

-- Step 1: Create basic functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Ensure batches table exists
CREATE TABLE IF NOT EXISTS batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('JEE', 'NEET')),
    class_type VARCHAR(20) NOT NULL CHECK (class_type IN ('11th', '12th', 'dropper')),
    thumbnail TEXT,
    capacity INTEGER DEFAULT 0,
    fees DECIMAL(10,2) DEFAULT 0,
    schedule_days TEXT[],
    start_time TIME,
    end_time TIME,
    start_date DATE,
    end_date DATE,
    teacher_name VARCHAR(255),
    teacher_subject VARCHAR(255),
    teacher_experience VARCHAR(255),
    teacher_qualification VARCHAR(255),
    teacher_bio TEXT,
    status VARCHAR(20) CHECK (status IN ('draft', 'active', 'inactive', 'completed')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Step 3: Create batch_enrollments table (if not exists)
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

-- Step 4: Create batch_subjects table
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

-- Step 5: Create batch_subject_topics table
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

-- Step 6: Create batch_subject_progress table
CREATE TABLE IF NOT EXISTS batch_subject_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID NOT NULL REFERENCES batch_subjects(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_accessed TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER DEFAULT 0,
    completed_topics INTEGER DEFAULT 0,
    total_topics INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subject_id, student_id)
);

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_batch_id ON batch_enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_student_id ON batch_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_batch_subjects_batch_id ON batch_subjects(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_subject_topics_subject_id ON batch_subject_topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_batch_subject_progress_subject_id ON batch_subject_progress(subject_id);

-- Step 8: Enable RLS
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_subject_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_subject_progress ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS Policies
-- Batches policies
DROP POLICY IF EXISTS "Admin can manage all batches" ON batches;
CREATE POLICY "Admin can manage all batches" ON batches FOR ALL USING (
    auth.uid() IN (
        SELECT u.id FROM auth.users u
        WHERE u.raw_user_meta_data->>'user_type' = 'admin'
    ) OR created_by = auth.uid()
);

-- Enrollments policies
DROP POLICY IF EXISTS "Admin can manage all enrollments" ON batch_enrollments;
CREATE POLICY "Admin can manage all enrollments" ON batch_enrollments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM batches b 
        WHERE b.id = batch_enrollments.batch_id 
        AND b.created_by = auth.uid()
    ) OR 
    auth.uid() IN (
        SELECT u.id FROM auth.users u
        WHERE u.raw_user_meta_data->>'user_type' = 'admin'
    )
);

-- Subjects policies
DROP POLICY IF EXISTS "Admin can manage all batch subjects" ON batch_subjects;
CREATE POLICY "Admin can manage all batch subjects" ON batch_subjects FOR ALL USING (
    EXISTS (
        SELECT 1 FROM batches b 
        WHERE b.id = batch_subjects.batch_id 
        AND b.created_by = auth.uid()
    ) OR 
    auth.uid() IN (
        SELECT u.id FROM auth.users u
        WHERE u.raw_user_meta_data->>'user_type' = 'admin'
    )
);

-- Topics policies
DROP POLICY IF EXISTS "Admin can manage all batch subject topics" ON batch_subject_topics;
CREATE POLICY "Admin can manage all batch subject topics" ON batch_subject_topics FOR ALL USING (
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

-- Progress policies
DROP POLICY IF EXISTS "Admin can view all progress" ON batch_subject_progress;
CREATE POLICY "Admin can view all progress" ON batch_subject_progress FOR SELECT USING (
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

-- Step 10: Create triggers
DROP TRIGGER IF EXISTS update_batches_updated_at ON batches;
CREATE TRIGGER update_batches_updated_at
    BEFORE UPDATE ON batches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_batch_enrollments_updated_at ON batch_enrollments;
CREATE TRIGGER update_batch_enrollments_updated_at
    BEFORE UPDATE ON batch_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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