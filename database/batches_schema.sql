-- Batches table for storing batch information
CREATE TABLE batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('JEE', 'NEET')),
    class_type VARCHAR(50) NOT NULL CHECK (class_type IN ('11th', '12th', 'Dropper')),
    thumbnail VARCHAR(500), -- Cloudinary URL
    capacity INTEGER DEFAULT 0,
    current_students INTEGER DEFAULT 0,
    fees DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'full')),
    
    -- Schedule information
    schedule_days TEXT[], -- Array of days like ['Monday', 'Tuesday']
    start_time TIME,
    end_time TIME,
    start_date DATE,
    end_date DATE,
    
    -- Teacher information
    teacher_name VARCHAR(255),
    teacher_subject VARCHAR(255),
    teacher_experience VARCHAR(100),
    teacher_qualification VARCHAR(255),
    teacher_bio TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_batches_category ON batches(category);
CREATE INDEX idx_batches_class_type ON batches(class_type);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_batches_created_by ON batches(created_by);

-- RLS (Row Level Security) policies
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

-- Policy for admins and batch creators to see all batches
CREATE POLICY "Admins can view all batches" ON batches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Policy for admins to insert batches
CREATE POLICY "Admins can insert batches" ON batches
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Policy for admins to update batches
CREATE POLICY "Admins can update batches" ON batches
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Policy for admins to delete batches
CREATE POLICY "Admins can delete batches" ON batches
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE
    ON batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
-- Note: Make sure you have admin_users table created first
INSERT INTO batches (
    name, description, category, class_type, capacity, fees,
    schedule_days, start_time, end_time,
    teacher_name, teacher_subject, teacher_experience,
    teacher_qualification, teacher_bio, created_by
) VALUES 
(
    'JEE Main 2025 - Physics Intensive',
    'Comprehensive physics preparation for JEE Main with focus on mechanics and thermodynamics',
    'JEE', '12th', 50, 8000,
    ARRAY['Monday', 'Wednesday', 'Friday'], '14:00', '16:00',
    'Dr. Rajesh Kumar', 'Physics', '12 years',
    'Ph.D in Physics, IIT Delhi', 'Expert in JEE Physics with proven track record of 95% success rate',
    (SELECT user_id FROM admin_users WHERE email = 'admin@example.com' LIMIT 1)
),
(
    'NEET Biology Mastery',
    'Complete biology coverage for NEET with emphasis on human physiology and genetics',
    'NEET', '12th', 40, 7500,
    ARRAY['Tuesday', 'Thursday', 'Saturday'], '10:00', '12:00',
    'Dr. Priya Singh', 'Biology', '10 years',
    'M.D, AIIMS Delhi', 'Specialized in NEET Biology preparation with 90% success rate',
    (SELECT user_id FROM admin_users WHERE email = 'admin@example.com' LIMIT 1)
),
(
    'JEE Advanced Mathematics',
    'Advanced mathematics for JEE preparation focusing on calculus and coordinate geometry',
    'JEE', 'Dropper', 30, 9000,
    ARRAY['Monday', 'Tuesday', 'Thursday'], '16:00', '18:00',
    'Prof. Amit Sharma', 'Mathematics', '15 years',
    'Ph.D Mathematics, IIT Bombay', 'Former IIT professor with expertise in JEE Advanced mathematics',
    (SELECT user_id FROM admin_users WHERE email = 'admin@example.com' LIMIT 1)
);