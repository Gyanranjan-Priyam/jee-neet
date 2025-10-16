import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Try to get batches count
    const { count, error: countError } = await supabaseAdmin
      .from('batches')
      .select('*', { count: 'exact', head: true });

    console.log('Batches count:', count, 'Error:', countError);

    // Try to get actual batches data
    const { data: batches, error: batchesError } = await supabaseAdmin
      .from('batches')
      .select('*')
      .limit(5);

    console.log('Batches data:', batches, 'Error:', batchesError);

    // Check for subjects in these batches
    let subjectsData: any[] | null = null;
    let subjectsError = null;
    if (batches && batches.length > 0) {
      const batchIds = (batches as any[]).map((b: any) => b.id);
      const { data: subjects, error: subjErr } = await supabaseAdmin
        .from('batch_subjects')
        .select('*')
        .in('batch_id', batchIds);
      
      subjectsData = subjects;
      subjectsError = subjErr;
      console.log('Subjects for batches:', subjects, 'Error:', subjErr);
    }

    // Check for topics if subjects exist
    let topicsData: any[] | null = null;
    let topicsError = null;
    if (subjectsData && subjectsData.length > 0) {
      const subjectIds = subjectsData.map((s: any) => s.id);
      const { data: topics, error: topErr } = await supabaseAdmin
        .from('batch_subject_topics')
        .select('*')
        .in('subject_id', subjectIds);
      
      topicsData = topics;
      topicsError = topErr;
      console.log('Topics for subjects:', topics, 'Error:', topErr);
    }

    return NextResponse.json({
      batchesCount: count,
      countError,
      batches,
      batchesError,
      subjects: {
        data: subjectsData,
        error: subjectsError,
        count: subjectsData?.length || 0
      },
      topics: {
        data: topicsData,
        error: topicsError,
        count: topicsData?.length || 0
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}