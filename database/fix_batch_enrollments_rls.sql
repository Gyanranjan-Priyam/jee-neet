-- Simplified batch_enrollments RLS policies that work with payment system
-- This fixes the "permission denied for table users" error

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage all enrollments" ON batch_enrollments;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON batch_enrollments;
DROP POLICY IF EXISTS "Students can update their own enrollment status" ON batch_enrollments;

-- Create simplified policies that don't access auth.users table

-- Policy 1: Students can view their own enrollments
CREATE POLICY "Students can view their own enrollments" ON batch_enrollments
    FOR SELECT USING (student_id = auth.uid());

-- Policy 2: Students can insert their own enrollments (for payment completion)
CREATE POLICY "Students can create their own enrollments" ON batch_enrollments
    FOR INSERT WITH CHECK (student_id = auth.uid());

-- Policy 3: Students can update their own enrollments
CREATE POLICY "Students can update their own enrollments" ON batch_enrollments
    FOR UPDATE USING (student_id = auth.uid());

-- Policy 4: Allow service role (admin operations) full access
CREATE POLICY "Service role has full access" ON batch_enrollments
    FOR ALL USING (
        current_setting('role') = 'service_role'
        OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- Policy 5: Batch creators can manage enrollments in their batches
CREATE POLICY "Batch creators can manage enrollments" ON batch_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM batches b 
            WHERE b.id = batch_enrollments.batch_id 
            AND b.created_by = auth.uid()
        )
    );

SELECT 'Batch enrollments RLS policies updated successfully!' as message;