import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string; subjectId: string }> }
) {
  try {
    const { batchId, subjectId } = await params;
    console.log(`[GET /api/batches/${batchId}/subjects/${subjectId}/chapters] Starting fetch`);
    const supabase = await createClient();
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Allow unauthenticated users to view chapters (they'll see them as locked)
    let isEnrolled = false;
    let enrollment = null;
    let userType = 'guest';
    
    if (!authError && user) {
      userType = user.user_metadata?.user_type || 'student';

      if (userType === 'student' && user) {
        const { data: enrollmentData, error: enrollmentError } = await supabaseAdmin
          .from('batch_enrollments')
          .select('id, status, payment_status, enrolled_at')
          .eq('batch_id', batchId)
          .eq('student_id', user.id)
          .single();

        isEnrolled = !enrollmentError && enrollmentData && 
                     (enrollmentData as any).status === 'active' && 
                     (enrollmentData as any).payment_status === 'paid';
        enrollment = enrollmentData;
      } else if (userType === 'admin') {
        isEnrolled = true; // Admins have full access
      }
    }

    // Verify batch and subject exist using admin client
    const { data: subject, error: subjectError } = await supabaseAdmin
      .from('batch_subjects')
      .select('id, batch_id')
      .eq('id', subjectId)
      .eq('batch_id', batchId)
      .single();

    if (subjectError || !subject) {
      console.error(`[GET] Subject verification failed:`, subjectError);
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Fetch chapters (topics) for the subject
    const { data: chapters, error } = await supabaseAdmin
      .from('batch_subject_topics')
      .select('*')
      .eq('subject_id', subjectId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error(`[GET] Chapters fetch error:`, error);
      return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
    }

    // Transform data to match frontend interface with access control
    const transformedChapters = (chapters || []).map((chapter: any) => ({
      id: chapter.id,
      name: chapter.name,
      description: chapter.description,
      status: chapter.is_completed ? 'completed' : 'not_started',
      order_index: chapter.order_index,
      completion_date: chapter.completion_date,
      created_at: chapter.created_at,
      updated_at: chapter.updated_at,
      subject_id: chapter.subject_id,
      // Access control information
      is_locked: !isEnrolled,
      access_message: isEnrolled ? null : 'Enroll in this batch to access chapter content'
    }));

    console.log(`[GET] Found ${transformedChapters.length} chapters, isEnrolled: ${isEnrolled}`);
    return NextResponse.json({ 
      chapters: transformedChapters,
      access_info: {
        is_enrolled: isEnrolled,
        enrollment: enrollment
      }
    });
    
  } catch (error) {
    console.error('Error in GET /api/batches/[batchId]/subjects/[subjectId]/chapters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}