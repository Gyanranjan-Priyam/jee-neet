-- Student Profiles Schema
-- This file creates the student_profiles table for managing student information

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    class_type VARCHAR(20) CHECK (class_type IN ('11th', '12th', 'dropper')) NOT NULL,
    exam_preference VARCHAR(20) CHECK (exam_preference IN ('JEE', 'NEET', 'both')) NOT NULL,
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    school_name VARCHAR(255),
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(255),
    emergency_contact VARCHAR(20),
    profile_picture TEXT, -- Cloudinary URL
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for student_profiles
CREATE INDEX IF NOT EXISTS student_profiles_user_id_idx ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS student_profiles_email_idx ON student_profiles(email);
CREATE INDEX IF NOT EXISTS student_profiles_class_type_idx ON student_profiles(class_type);
CREATE INDEX IF NOT EXISTS student_profiles_exam_preference_idx ON student_profiles(exam_preference);
CREATE INDEX IF NOT EXISTS student_profiles_is_active_idx ON student_profiles(is_active);

-- Enable Row Level Security
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for student_profiles
CREATE POLICY "Students can view their own profile" ON student_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can update their own profile" ON student_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all student profiles" ON student_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_student_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_student_profiles_updated_at 
    BEFORE UPDATE ON student_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_student_profiles_updated_at();

-- Create function to get student full name
CREATE OR REPLACE FUNCTION get_student_full_name(student_id UUID)
RETURNS TEXT AS $$
DECLARE
    full_name TEXT;
BEGIN
    SELECT first_name || ' ' || last_name INTO full_name
    FROM student_profiles
    WHERE user_id = student_id;
    
    RETURN COALESCE(full_name, 'Unknown Student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get student by email
CREATE OR REPLACE FUNCTION get_student_by_email(student_email TEXT)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    class_type VARCHAR(20),
    exam_preference VARCHAR(20),
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.id,
        sp.user_id,
        sp.email,
        sp.first_name,
        sp.last_name,
        sp.class_type,
        sp.exam_preference,
        sp.is_active
    FROM student_profiles sp
    WHERE sp.email = student_email
    AND sp.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;