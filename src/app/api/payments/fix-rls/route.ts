import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Fix RLS policies for batch_enrollments
    const fixRLSSQL = `
      -- Drop existing problematic policies
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
      CREATE POLICY "Batch creators can manage enrollment in their batches" ON batch_enrollments
          FOR ALL USING (
              EXISTS (
                  SELECT 1 FROM batches b 
                  WHERE b.id = batch_enrollments.batch_id 
                  AND b.created_by = auth.uid()
              )
          );
    `;

    // Note: In a real application, you'd use a proper migration system
    // For now, we'll try to execute via a function or return instructions
    
    // Test if we can access the batch_enrollments table
    const { data: testAccess, error: accessError } = await supabase
      .from('batch_enrollments')
      .select('id')
      .limit(1);

    if (accessError) {
      console.error('Access test error:', accessError);
    }

    return NextResponse.json({
      success: true,
      message: 'RLS policies need to be updated manually',
      instructions: {
        step1: 'Go to your Supabase dashboard',
        step2: 'Navigate to SQL Editor',
        step3: 'Copy and paste the contents of database/fix_batch_enrollments_rls.sql',
        step4: 'Execute the SQL to fix RLS policies',
        issue: 'The current RLS policies are trying to access auth.users table which causes permission errors',
        solution: 'Simplified policies that only use auth.uid() and service_role checks'
      },
      sqlToExecute: fixRLSSQL,
      testAccess: {
        canAccessTable: !accessError,
        error: accessError?.message
      }
    });

  } catch (error) {
    console.error('Error in RLS fix API:', error);
    return NextResponse.json({
      error: 'Failed to check RLS policies',
      details: error instanceof Error ? error.message : 'Unknown error',
      instructions: 'Please run the SQL from database/fix_batch_enrollments_rls.sql in your Supabase SQL Editor'
    }, { status: 500 });
  }
}