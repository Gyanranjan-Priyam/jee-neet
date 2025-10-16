import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting GET /api/student/enrolled-batches');
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('👤 User authentication:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      userType: user?.user_metadata?.user_type,
      authError: authError?.message
    });
    
    if (authError || !user) {
      console.log('❌ Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get enrolled batches for the current user using admin client
    const { data: enrollments, error: enrollmentError } = await (supabaseAdmin as any)
      .from('batch_enrollments')
      .select(`
        *,
        batches!inner (
          id,
          name,
          description,
          fees,
          class_type,
          category,
          thumbnail,
          status,
          start_date,
          end_date,
          teacher_name,
          teacher_subject,
          created_at
        )
      `)
      .eq('student_id', user.id)
      .eq('status', 'active')
      .eq('payment_status', 'paid');

    if (enrollmentError) {
      console.error('Error fetching enrolled batches:', enrollmentError);
      return NextResponse.json({ 
        error: 'Failed to fetch enrolled batches',
        details: enrollmentError.message 
      }, { status: 500 });
    }

    // Transform the data to match the expected batch format
    const enrolledBatches = enrollments?.map((enrollment: any) => ({
      // Keep original batch data
      ...enrollment.batches,
      // Add title for frontend compatibility (use name as title)
      title: enrollment.batches.name,
      // Add enrollment-specific data
      enrollment_id: enrollment.id,
      enrolled_at: enrollment.enrolled_at,
      payment_amount: enrollment.payment_amount,
      progress_percentage: enrollment.progress_percentage || 0,
      // Add image_url compatibility (map from thumbnail)
      image_url: enrollment.batches.thumbnail
    })) || [];

    return NextResponse.json({
      success: true,
      batches: enrolledBatches,
      count: enrolledBatches.length
    });

  } catch (error) {
    console.error('Error in enrolled batches API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}