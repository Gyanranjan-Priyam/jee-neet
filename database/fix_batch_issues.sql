-- Fix for batch creation issues
-- This script will:
-- 1. Make created_by nullable
-- 2. Update RLS policies to work with admin client
-- 3. Create a proper admin user entry

-- Step 1: Make created_by nullable (if it's not already)
ALTER TABLE batches ALTER COLUMN created_by DROP NOT NULL;

-- Step 2: Drop existing RLS policies that might be too restrictive
DROP POLICY IF EXISTS "Admins can view all batches" ON batches;
DROP POLICY IF EXISTS "Admins can insert batches" ON batches;
DROP POLICY IF EXISTS "Admins can update batches" ON batches;
DROP POLICY IF EXISTS "Admins can delete batches" ON batches;

-- Step 3: Create more permissive policies for admin operations
-- Allow admin service role to bypass RLS completely
CREATE POLICY "Service role can do everything" ON batches
    FOR ALL USING (true) WITH CHECK (true);

-- Step 4: Create a default admin user if it doesn't exist
-- First, let's insert into the auth.users table (this might need to be done via Supabase dashboard)
-- For now, we'll create the admin_users entry that references the authenticated user

-- Insert admin user entry for the current authenticated user
INSERT INTO admin_users (user_id, email, is_active, role, created_at)
SELECT 
    auth.uid(),
    'web.gyanranjan@gmail.com',
    true,
    'super_admin',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
);

-- Step 5: Alternative - create policies that work with the current setup
DROP POLICY IF EXISTS "Service role can do everything" ON batches;

-- More specific policies that handle both admin users and service role
CREATE POLICY "Allow admin operations" ON batches
    FOR ALL USING (
        -- Allow if using service role (admin client)
        current_setting('role') = 'service_role' 
        OR
        -- Allow if user is in admin_users table
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    ) WITH CHECK (
        -- Same conditions for write operations
        current_setting('role') = 'service_role' 
        OR
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Step 6: For immediate testing, temporarily disable RLS (can re-enable later)
-- ALTER TABLE batches DISABLE ROW LEVEL SECURITY;