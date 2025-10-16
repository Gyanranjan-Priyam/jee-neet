import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const { batchId } = await params;
    
    console.log(`🧪 Testing subjects API without auth for batch: ${batchId}`);

    // Fetch subjects for the batch with topics (without auth)
    const { data: subjects, error } = await (supabaseAdmin as any)
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
      return NextResponse.json({ 
        error: 'Failed to fetch subjects',
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    // Transform subjects data (all subjects shown as locked since no auth)
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
      // Mark all as locked since no auth
      is_locked: true,
      access_message: 'Please log in and enroll to access course content',
      progress: null
    })) || [];

    console.log(`✅ Found ${transformedSubjects.length} subjects for batch ${batchId}`);
    
    return NextResponse.json({
      success: true,
      subjects: transformedSubjects,
      batch_id: batchId,
      note: 'Test endpoint - all subjects marked as locked'
    });
    
  } catch (error) {
    console.error('Error in test subjects API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}