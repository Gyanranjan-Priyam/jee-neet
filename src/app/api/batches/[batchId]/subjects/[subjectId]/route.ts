import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string; subjectId: string }> }
) {
  try {
    const { batchId, subjectId } = await params;

    console.log(`[GET /api/batches/${batchId}/subjects/${subjectId}] Starting fetch`);

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is enrolled in this batch (for students)
    if (user.user_metadata?.user_type === 'student') {
      const { data: enrollment, error: enrollmentError } = await supabaseAdmin
        .from('batch_enrollments')
        .select('id, status, payment_status')
        .eq('batch_id', batchId)
        .eq('student_id', user.id)
        .eq('status', 'active')
        .eq('payment_status', 'paid')
        .single();

      if (enrollmentError || !enrollment) {
        return NextResponse.json({ error: 'Not enrolled in this batch' }, { status: 403 });
      }
    }

    // Fetch subject with topics using admin client
    const { data: subject, error } = await supabaseAdmin
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
      .eq('id', subjectId)
      .eq('batch_id', batchId)
      .single();

    if (error) {
      console.error(`[GET /api/batches/${batchId}/subjects/${subjectId}] Error:`, error);
      if (error.code === '42P01') {
        return NextResponse.json({ error: 'Database tables not set up. Please run setup first.' }, { status: 503 });
      }
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    console.log(`[GET /api/batches/${batchId}/subjects/${subjectId}] Subject found:`, (subject as any)?.name);

    // Transform data - simplified for the new UI requirements
    const transformedSubject = {
      id: (subject as any).id,
      batch_id: (subject as any).batch_id,
      name: (subject as any).name,
      teacher_name: (subject as any).teacher_name,
      status: (subject as any).status,
      created_at: (subject as any).created_at,
      updated_at: (subject as any).updated_at
    };

    return NextResponse.json({ subject: transformedSubject });
  } catch (error) {
    console.error('Error in GET /api/batches/[batchId]/subjects/[subjectId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string; subjectId: string }> }
) {
  try {
    const { batchId, subjectId } = await params;

    console.log(`[PUT /api/batches/${batchId}/subjects/${subjectId}] Starting update`);

    const body = await request.json();
    const { name, teacher_name, status } = body;

    // Validate required fields - simplified to only the 3 fields needed
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });
    }

    // Verify batch exists using admin client
    const { data: batch, error: batchError } = await supabaseAdmin
      .from('batches')
      .select('id')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      console.error(`[PUT /api/batches/${batchId}/subjects/${subjectId}] Batch not found:`, batchError);
      if (batchError?.code === '42P01') {
        return NextResponse.json({ error: 'Database tables not set up. Please run setup first.' }, { status: 503 });
      }
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Update the subject with simplified fields
    const { data: subject, error: updateError } = await (supabaseAdmin as any)
      .from('batch_subjects')
      .update({
        name: name.trim(),
        teacher_name: teacher_name?.trim() || null,
        status: status || 'not_started'
      })
      .eq('id', subjectId)
      .eq('batch_id', batchId)
      .select()
      .single();

    if (updateError) {
      console.error(`[PUT /api/batches/${batchId}/subjects/${subjectId}] Update error:`, updateError);
      if (updateError.code === '42P01') {
        return NextResponse.json({ error: 'Database tables not set up. Please run setup first.' }, { status: 503 });
      }
      return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
    }

    console.log(`[PUT /api/batches/${batchId}/subjects/${subjectId}] Subject updated successfully`);

    // Return simplified response
    const transformedSubject = {
      id: (subject as any).id,
      batch_id: (subject as any).batch_id,
      name: (subject as any).name,
      teacher_name: (subject as any).teacher_name,
      status: (subject as any).status,
      created_at: (subject as any).created_at,
      updated_at: (subject as any).updated_at
    };

    return NextResponse.json({ subject: transformedSubject });
  } catch (error) {
    console.error('Error in PUT /api/batches/[batchId]/subjects/[subjectId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string; subjectId: string }> }
) {
  try {
    const { batchId, subjectId } = await params;

    console.log(`[DELETE /api/batches/${batchId}/subjects/${subjectId}] Starting delete`);

    // Verify batch exists using admin client
    const { data: batch, error: batchError } = await supabaseAdmin
      .from('batches')
      .select('id')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      console.error(`[DELETE /api/batches/${batchId}/subjects/${subjectId}] Batch not found:`, batchError);
      if (batchError?.code === '42P01') {
        return NextResponse.json({ error: 'Database tables not set up. Please run setup first.' }, { status: 503 });
      }
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Delete the subject using admin client
    const { error: deleteError } = await (supabaseAdmin as any)
      .from('batch_subjects')
      .delete()
      .eq('id', subjectId)
      .eq('batch_id', batchId);

    if (deleteError) {
      console.error(`[DELETE /api/batches/${batchId}/subjects/${subjectId}] Delete error:`, deleteError);
      if (deleteError.code === '42P01') {
        return NextResponse.json({ error: 'Database tables not set up. Please run setup first.' }, { status: 503 });
      }
      return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
    }

    console.log(`[DELETE /api/batches/${batchId}/subjects/${subjectId}] Subject deleted successfully`);
    return NextResponse.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/batches/[batchId]/subjects/[subjectId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}