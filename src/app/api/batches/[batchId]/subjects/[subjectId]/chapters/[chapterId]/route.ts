import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string; subjectId: string; chapterId: string }> }
) {
  try {
    const { batchId, subjectId, chapterId } = await params;

    console.log(`[GET /api/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}] Starting fetch`);
    console.log('Params received:', { batchId, subjectId, chapterId });

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Allow unauthenticated users to view content (they'll see it as locked)
    let isEnrolled = false;
    let enrollment = null;
    let userType = 'guest';
    
    if (!authError && user) {
      userType = user.user_metadata?.user_type || 'student';
      
      if (userType === 'student') {
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
        
        console.log('Enrollment check:', { 
          hasData: !!enrollmentData, 
          error: enrollmentError?.message,
          status: (enrollmentData as any)?.status,
          paymentStatus: (enrollmentData as any)?.payment_status,
          isEnrolled 
        });
      } else if (userType === 'admin') {
        isEnrolled = true; // Admins have full access
      }
    }
    
    console.log('Access control:', { userType, isEnrolled, hasUser: !!user });

    // Verify batch, subject, and chapter exist
    const { data: chapter, error: chapterError } = await supabaseAdmin
      .from('batch_subject_topics')
      .select(`
        id,
        name,
        description,
        order_index,
        is_completed,
        completion_date,
        created_at,
        updated_at,
        subject_id,
        batch_subjects!inner (
          id,
          batch_id,
          name
        )
      `)
      .eq('id', chapterId)
      .eq('subject_id', subjectId)
      .eq('batch_subjects.batch_id', batchId)
      .single();

    if (chapterError || !chapter) {
      console.error(`[GET] Chapter verification failed:`, chapterError);
      return NextResponse.json({ 
        error: 'Chapter not found', 
        details: chapterError?.message,
        params: { batchId, subjectId, chapterId }
      }, { status: 404 });
    }

    console.log('Chapter found:', { 
      chapterId: (chapter as any).id, 
      name: (chapter as any).name,
      subjectId: (chapter as any).subject_id 
    });

    // Get chapter progress for enrolled students
    let progress = null;
    if (isEnrolled && user) {
      // Add progress tracking logic here if needed
      progress = {
        progress_percentage: (chapter as any).is_completed ? 100 : 0,
        last_accessed: new Date().toISOString(),
        time_spent: 0,
        videos_watched: 0,
        total_videos: 0,
        pdfs_viewed: 0,
        total_pdfs: 0
      };
    }

    // Transform chapter data with access control
    const transformedChapter = {
      id: (chapter as any).id,
      name: (chapter as any).name,
      description: (chapter as any).description,
      status: (chapter as any).is_completed ? 'completed' : 'not_started',
      order_index: (chapter as any).order_index,
      estimated_hours: null, // Add if you have this field
      completion_date: (chapter as any).completion_date,
      created_at: (chapter as any).created_at,
      updated_at: (chapter as any).updated_at,
      subject_id: (chapter as any).subject_id,
      // Access control information
      is_locked: !isEnrolled,
      access_message: isEnrolled ? null : 'Enroll in this batch to access chapter content',
      progress: progress
    };

    console.log(`[GET] Found chapter: ${(chapter as any).name}, isEnrolled: ${isEnrolled}`);
    return NextResponse.json({ 
      chapter: transformedChapter,
      access_info: {
        is_enrolled: isEnrolled,
        enrollment: enrollment
      }
    });
    
  } catch (error) {
    console.error('Error in GET /api/batches/[batchId]/subjects/[subjectId]/chapters/[chapterId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string; subjectId: string; chapterId: string }> }
) {
  try {
    const { batchId, subjectId, chapterId } = await params;
    const body = await request.json();
    const { name, description, estimated_hours, status } = body;

    console.log(`[PUT /api/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}] Updating chapter`);

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Chapter name is required' }, { status: 400 });
    }

    // Verify batch, subject, and chapter exist
    const { data: chapter, error: chapterError } = await supabaseAdmin
      .from('batch_subject_topics')
      .select(`
        id,
        subject_id,
        batch_subjects!inner (
          id,
          batch_id
        )
      `)
      .eq('id', chapterId)
      .eq('subject_id', subjectId)
      .eq('batch_subjects.batch_id', batchId)
      .single();

    if (chapterError || !chapter) {
      console.error(`[PUT] Chapter verification failed:`, chapterError);
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Update the chapter
    const updateData: any = {
      name: name.trim(),
      description: description?.trim() || null,
      is_completed: status === 'completed'
    };

    // Set completion date if status changed to completed
    if (status === 'completed') {
      updateData.completion_date = new Date().toISOString();
    } else if (status === 'not_started' || status === 'in_progress') {
      updateData.completion_date = null;
    }

    const { data: updatedChapter, error: updateError } = await (supabaseAdmin as any)
      .from('batch_subject_topics')
      .update(updateData)
      .eq('id', chapterId)
      .select()
      .single();

    if (updateError) {
      console.error(`[PUT] Chapter update error:`, updateError);
      return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
    }

    // Transform response
    const transformedChapter = {
      id: (updatedChapter as any).id,
      name: (updatedChapter as any).name,
      description: (updatedChapter as any).description,
      status: (updatedChapter as any).is_completed ? 'completed' : 'not_started',
      order_index: (updatedChapter as any).order_index,
      completion_date: (updatedChapter as any).completion_date,
      created_at: (updatedChapter as any).created_at,
      updated_at: (updatedChapter as any).updated_at
    };

    console.log(`[PUT] Chapter updated successfully`);
    return NextResponse.json({ chapter: transformedChapter });
  } catch (error) {
    console.error('Error in PUT /api/batches/[batchId]/subjects/[subjectId]/chapters/[chapterId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string; subjectId: string; chapterId: string }> }
) {
  try {
    const { batchId, subjectId, chapterId } = await params;

    console.log(`[DELETE /api/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}] Deleting chapter`);

    // Verify batch, subject, and chapter exist
    const { data: chapter, error: chapterError } = await supabaseAdmin
      .from('batch_subject_topics')
      .select(`
        id,
        subject_id,
        batch_subjects!inner (
          id,
          batch_id
        )
      `)
      .eq('id', chapterId)
      .eq('subject_id', subjectId)
      .eq('batch_subjects.batch_id', batchId)
      .single();

    if (chapterError || !chapter) {
      console.error(`[DELETE] Chapter verification failed:`, chapterError);
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Delete the chapter
    const { error: deleteError } = await (supabaseAdmin as any)
      .from('batch_subject_topics')
      .delete()
      .eq('id', chapterId);

    if (deleteError) {
      console.error(`[DELETE] Chapter deletion error:`, deleteError);
      return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
    }

    console.log(`[DELETE] Chapter deleted successfully`);
    return NextResponse.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/batches/[batchId]/subjects/[subjectId]/chapters/[chapterId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}