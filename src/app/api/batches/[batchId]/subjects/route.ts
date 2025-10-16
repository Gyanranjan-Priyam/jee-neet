import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    console.log('🚀 Starting GET /api/batches/[batchId]/subjects');
    const supabase = await createClient();
    const adminSupabase = supabaseAdmin;
    const { batchId } = await params;
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('👤 User authentication:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      userType: user?.user_metadata?.user_type,
      authError: authError?.message
    });
    
    // Allow unauthenticated users to view subjects (they'll see them as locked)
    let userType = 'guest';
    if (!authError && user) {
      userType = user.user_metadata?.user_type || 'student';
    }

    // Check if user is enrolled in this batch (for access control but allow viewing)
    const { data: enrollment, error: enrollmentError } = await (adminSupabase as any)
      .from('batch_enrollments')
      .select('id, status, payment_status, enrolled_at, progress_percentage')
      .eq('batch_id', batchId)
      .eq('student_id', user?.id || 'anonymous') // Use anonymous for guests
      .single();

    // For students, allow viewing subjects even if not enrolled (show as locked)
    // For admins, always allow access
    const isEnrolled = user && !enrollmentError && !!enrollment && enrollment.status === 'active' && enrollment.payment_status === 'paid';
    const isAdmin = user && user.user_metadata?.user_type === 'admin';
    
    console.log('📚 Access status:', { 
      isEnrolled, 
      isAdmin, 
      enrollment: enrollment || 'none', 
      enrollmentError: enrollmentError?.message || 'none' 
    });

    // Fetch subjects for the batch with topics
    const { data: subjects, error } = await (adminSupabase as any)
      .from('batch_subjects')
      .select(`
        *,
        batch_subject_topics (
          id,
          name,
          description,
          order_index,
          is_completed,
          completion_date
        )
      `)
      .eq('batch_id', batchId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching batch subjects:', error);
      
      // Check if it's a table doesn't exist error
      if (error.code === '42P01') {
        return NextResponse.json({ 
          error: 'Database tables not set up yet. Please run database setup first.',
          needsSetup: true,
          subjects: []
        }, { status: 200 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch subjects',
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    // Get student progress for enrolled students (only for actual enrolled students)
    let studentProgress: Record<string, any> = {};
    if (isEnrolled && subjects?.length > 0 && user) {
      const subjectIds = subjects.map((subject: any) => subject.id);
      const { data: progressData, error: progressError } = await (adminSupabase as any)
        .from('batch_subject_progress')
        .select('subject_id, progress_percentage, last_accessed, time_spent, completed_topics, total_topics')
        .eq('student_id', user.id)
        .in('subject_id', subjectIds);

      if (!progressError && progressData) {
        studentProgress = progressData.reduce((acc: any, progress: any) => {
          acc[progress.subject_id] = progress;
          return acc;
        }, {});
      }
    }

    // Transform subjects data with enrollment status and locking
    const transformedSubjects = subjects?.map((subject: any) => ({
      id: subject.id,
      batch_id: subject.batch_id,
      name: subject.name,
      description: subject.description,
      estimated_hours: subject.estimated_hours,
      difficulty: subject.difficulty,
      status: subject.status,
      order_index: subject.order_index,
      teacher_name: subject.teacher_name,
      created_at: subject.created_at,
      updated_at: subject.updated_at,
      topics: subject.batch_subject_topics || [],
      total_topics: subject.batch_subject_topics?.length || 0,
      // Access control - allow viewing for all users but lock content based on enrollment
      is_locked: !isEnrolled && !isAdmin,
      access_message: isEnrolled || isAdmin ? null : 'Enroll in this batch to access course content',
      progress: (isEnrolled || isAdmin) ? (studentProgress[subject.id] || {
        progress_percentage: 0,
        last_accessed: null,
        time_spent: 0,
        completed_topics: 0,
        total_topics: subject.batch_subject_topics?.length || 0
      }) : null
    })) || [];

    console.log('Successfully fetched batch subjects:', transformedSubjects.length, 'isEnrolled:', isEnrolled, 'isAdmin:', isAdmin);
    
    return NextResponse.json({
      success: true,
      subjects: transformedSubjects,
      enrollment: {
        is_enrolled: isEnrolled,
        enrollment_data: enrollment || null
      },
      batch_id: batchId,
      student_id: user?.id || null
    });
    
  } catch (error) {
    console.error('Error in GET /api/batches/[batchId]/subjects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    // Use admin client to avoid auth table permission issues
    console.log('Using admin client for subject creation');
    const adminSupabase = supabaseAdmin;
    const { batchId } = await params;

    const body = await request.json();
    const { name, teacher_name, status } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });
    }

    // Verify batch exists (simplified check with admin client)
    const { data: batch, error: batchError } = await (adminSupabase as any)
      .from('batches')
      .select('id')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      console.error('Batch verification error:', batchError);
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Get the next order index
    const { data: lastSubject } = await (adminSupabase as any)
      .from('batch_subjects')
      .select('order_index')
      .eq('batch_id', batchId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (lastSubject?.order_index || 0) + 1;

    // Create the subject with simplified fields (handle missing teacher_name column gracefully)
    const insertData: any = {
      batch_id: batchId,
      name: name.trim(),
      status: status || 'not_started',
      order_index: nextOrderIndex
    };
    
    // Add teacher_name only if provided (in case column doesn't exist yet)
    if (teacher_name?.trim()) {
      insertData.teacher_name = teacher_name.trim();
    }
    
    const { data: subject, error: createError } = await (adminSupabase as any)
      .from('batch_subjects')
      .insert(insertData)
      .select()
      .single();

    if (createError) {
      console.error('Error creating subject:', createError);
      console.error('Error details:', JSON.stringify(createError, null, 2));
      return NextResponse.json({ 
        error: 'Failed to create subject',
        details: createError.message,
        code: createError.code 
      }, { status: 500 });
    }

    // Topics creation removed for simplified API

    // Return the simplified subject
    const transformedSubject = {
      id: subject.id,
      batch_id: subject.batch_id,
      name: subject.name,
      teacher_name: subject.teacher_name,
      status: subject.status,
      created_at: subject.created_at,
      updated_at: subject.updated_at
    };

    return NextResponse.json({ subject: transformedSubject }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/batches/[batchId]/subjects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}