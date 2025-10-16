import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { batchIds } = await request.json();
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!batchIds || !Array.isArray(batchIds)) {
      return NextResponse.json({ error: 'Batch IDs array is required' }, { status: 400 });
    }

    // Get enrollment status for the provided batch IDs using admin client
    const { data: enrollments, error: enrollmentError } = await (supabaseAdmin as any)
      .from('batch_enrollments')
      .select('batch_id, status, payment_status, enrolled_at, payment_amount')
      .eq('student_id', user.id)
      .in('batch_id', batchIds);

    if (enrollmentError) {
      console.error('Error checking enrollment status:', enrollmentError);
      return NextResponse.json({ 
        error: 'Failed to check enrollment status',
        details: enrollmentError.message 
      }, { status: 500 });
    }

    // Create a map of batch enrollment status
    const enrollmentStatus: Record<string, any> = {};
    enrollments?.forEach((enrollment: any) => {
      enrollmentStatus[enrollment.batch_id] = {
        isEnrolled: enrollment.status === 'active' && enrollment.payment_status === 'paid',
        status: enrollment.status,
        paymentStatus: enrollment.payment_status,
        enrolledAt: enrollment.enrolled_at,
        paidAmount: enrollment.payment_amount
      };
    });

    // Fill in non-enrolled batches
    batchIds.forEach(batchId => {
      if (!enrollmentStatus[batchId]) {
        enrollmentStatus[batchId] = {
          isEnrolled: false,
          status: null,
          paymentStatus: null,
          enrolledAt: null,
          paidAmount: null
        };
      }
    });

    return NextResponse.json({
      success: true,
      enrollmentStatus
    });

  } catch (error) {
    console.error('Error in enrollment status API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}