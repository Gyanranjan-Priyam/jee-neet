-- Complete Database Setup Script
-- Run this script to set up all necessary tables for the JEE-NEET app

-- First, create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Create batches table (if not exists)
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

-- Enable RLS for batches
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy for batches
DROP POLICY IF EXISTS "Admin can manage all batches" ON batches;
CREATE POLICY "Admin can manage all batches" ON batches
    FOR ALL USING (
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.raw_user_meta_data->>'user_type' = 'admin'
        )
        OR created_by = auth.uid()
    );

-- 2. Run batch_enrollments schema
\i database/batch_enrollments_schema.sql

-- 3. Run batch_subjects schema
\i database/batch_subjects_schema.sql

-- Insert sample batch if none exists
DO $$
DECLARE
    admin_user_id UUID;
    sample_batch_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE raw_user_meta_data->>'user_type' = 'admin' 
    LIMIT 1;
    
    -- Create sample batch if none exists and we have an admin
    IF admin_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM batches) THEN
        INSERT INTO batches (
            name, 
            description, 
            category, 
            class_type, 
            capacity, 
            fees, 
            schedule_days, 
            start_time, 
            end_time, 
            status,
            created_by
        ) VALUES (
            'JEE Main 2025 - Comprehensive Batch',
            'Complete preparation for JEE Main 2025 covering Physics, Chemistry, and Mathematics',
            'JEE',
            '12th',
            50,
            25000.00,
            ARRAY['Monday', 'Wednesday', 'Friday'],
            '14:00'::TIME,
            '18:00'::TIME,
            'active',
            admin_user_id
        ) RETURNING id INTO sample_batch_id;
        
        RAISE NOTICE 'Sample batch created with ID: %', sample_batch_id;
    END IF;
END $$;