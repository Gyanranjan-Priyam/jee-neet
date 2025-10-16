-- Create admin_users table for admin management
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for admin_users
CREATE INDEX IF NOT EXISTS admin_users_user_id_idx ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users(email);
CREATE INDEX IF NOT EXISTS admin_users_role_idx ON admin_users(role);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users (only admins can access)
CREATE POLICY "Admins can view admin profiles" ON admin_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can update own profile" ON admin_users
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_admin_users_updated_at();

-- Insert default admin user (you should change these credentials)
-- Note: This assumes you'll create the auth user separately
INSERT INTO admin_users (email, first_name, last_name, role, permissions) VALUES 
  ('admin@example.com', 'Admin', 'User', 'super_admin', '["users", "content", "analytics", "settings"]')
ON CONFLICT (email) DO NOTHING;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = $1 AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user type
CREATE OR REPLACE FUNCTION get_user_type(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  -- Check if user is admin
  IF EXISTS (SELECT 1 FROM admin_users WHERE user_id = $1 AND is_active = true) THEN
    RETURN 'admin';
  END IF;
  
  -- Check if user is student
  IF EXISTS (SELECT 1 FROM student_profiles WHERE user_id = $1) THEN
    RETURN 'student';
  END IF;
  
  -- Default to unknown
  RETURN 'unknown';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;