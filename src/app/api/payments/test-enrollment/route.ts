import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, batchId } = await request.json();
    
    if (!userId || !batchId) {
      return NextResponse.json({ error: 'userId and batchId are required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // Test enrollment creation
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('batch_enrollments')
      .insert([
        {
          batch_id: batchId,
          student_id: userId,
          status: 'active',
          payment_status: 'paid',
          enrolled_at: new Date().toISOString(),
          payment_amount: 99.00
        }
      ] as any)
      .select()
      .single();

    if (enrollmentError) {
      console.error('Enrollment test error:', enrollmentError);
      return NextResponse.json({ 
        error: 'Enrollment test failed',
        details: enrollmentError.message,
        code: enrollmentError.code
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Enrollment test successful',
      enrollment: enrollment
    });

  } catch (error) {
    console.error('Test enrollment error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}