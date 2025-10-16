import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Fetch a single batch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const { batchId } = await params;
    // Use admin client to avoid auth table permission issues
    console.log('Using admin client for single batch fetch');
    const adminSupabase = supabaseAdmin;

    const { data: batch, error } = await (adminSupabase as any)
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (error) {
      console.error('Error fetching batch:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
      }
      
      // Check if it's a table doesn't exist error
      if (error.code === '42P01') {
        return NextResponse.json({ 
          error: 'Database tables not set up yet. Please run database setup first.',
          needsSetup: true
        }, { status: 400 });
      }
      
      // Check if it's a permission error
      if (error.code === '42501') {
        return NextResponse.json({ 
          error: 'Database permission issue. Please check your Supabase configuration.',
          needsSetup: true
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch batch',
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    console.log('Successfully fetched batch:', batch?.id);
    return NextResponse.json({ batch });

  } catch (error) {
    console.error('Error in GET /api/batches/[batchId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a batch
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const { batchId } = await params;
    // Use admin client to avoid auth table permission issues
    console.log('Using admin client for batch update');
    const adminSupabase = supabaseAdmin;

    const body = await request.json();
    
    // Prepare update data
    const updateData = {
      name: body.name,
      description: body.description || null,
      category: body.category,
      class_type: body.classType,
      thumbnail: body.thumbnail || null,
      capacity: body.capacity || 0,
      fees: body.fees || 0,
      schedule_days: body.schedule?.days || [],
      start_time: body.schedule?.startTime || null,
      end_time: body.schedule?.endTime || null,
      start_date: body.startDate || null,
      end_date: body.endDate || null,
      teacher_name: body.teacherInfo?.name || null,
      teacher_subject: body.teacherInfo?.subject || null,
      teacher_experience: body.teacherInfo?.experience || null,
      teacher_qualification: body.teacherInfo?.qualification || null,
      teacher_bio: body.teacherInfo?.bio || null,
    };

    const { data: batch, error } = await (adminSupabase as any)
      .from('batches')
      .update(updateData)
      .eq('id', batchId)
      .select()
      .single();

    if (error) {
      console.error('Error updating batch:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: 'Failed to update batch',
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    console.log('Successfully updated batch:', batch?.id);
    return NextResponse.json({ batch });

  } catch (error) {
    console.error('Error in PUT /api/batches/[batchId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a batch
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const { batchId } = await params;
    // Use admin client to avoid auth table permission issues
    console.log('Using admin client for batch deletion');
    const adminSupabase = supabaseAdmin;

    const { error } = await (adminSupabase as any)
      .from('batches')
      .delete()
      .eq('id', batchId);

    if (error) {
      console.error('Error deleting batch:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: 'Failed to delete batch',
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    console.log('Successfully deleted batch:', batchId);
    return NextResponse.json({ message: 'Batch deleted successfully' });

  } catch (error) {
    console.error('Error in DELETE /api/batches/[batchId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}