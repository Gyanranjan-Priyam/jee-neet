import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Fetch all batches for student
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting GET /api/batches request');
    
    const supabase = await createClient();
    
    // Try to get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 User authentication status:', { 
      hasUser: !!user, 
      userId: user?.id,
      userType: user?.user_metadata?.user_type,
      authError: authError?.message 
    });
    
    // Use admin client for database operations
    const adminSupabase = supabaseAdmin;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const classType = searchParams.get('class_type');
    const status = searchParams.get('status');

    console.log('🔍 Query parameters:', { category, classType, status });

    // If user is authenticated and is a student, filter by their profile
    let studentProfile = null;
    if (user && user.user_metadata?.user_type === 'student') {
      studentProfile = {
        exam_preference: user.user_metadata?.exam_preference,
        class_type: user.user_metadata?.class_type
      };
      console.log('🎓 Student profile:', studentProfile);
    }

    console.log('📊 Building query for batches table');
    
    // Build query using admin client
    let query = (adminSupabase as any)
      .from('batches')
      .select(`
        id,
        name,
        description,
        teacher_name,
        capacity,
        fees,
        start_date,
        end_date,
        status,
        class_type,
        category,
        thumbnail,
        created_at
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    console.log('🔧 Query built successfully');

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (classType) {
      query = query.eq('class_type', classType);
    }
    if (status) {
      query = query.eq('status', status);
    }

    console.log('🚀 Executing query...');
    const { data: batches, error } = await query;

    if (error) {
      console.error('❌ Error fetching batches:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Check if it's a table doesn't exist error
      if (error.code === '42P01') {
        console.log('⚠️  Batches table does not exist');
        return NextResponse.json({ 
          error: 'Database tables not set up yet. Please run database setup first.',
          needsSetup: true,
          batches: []
        }, { status: 200 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch batches', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }
    
    console.log('✅ Query executed successfully. Found batches:', batches?.length || 0);

    // Get enrollment counts for each batch
    if (batches && batches.length > 0) {
      console.log('📊 Fetching enrollment counts...');
      const batchIds = batches.map((batch: any) => batch.id);
      
      const { data: enrollmentCounts, error: enrollmentError } = await (adminSupabase as any)
        .from('batch_enrollments')
        .select('batch_id, status')
        .in('batch_id', batchIds)
        .in('status', ['active', 'pending']); // Count active and pending enrollments
      
      if (!enrollmentError && enrollmentCounts) {
        // Create a map of batch_id to enrollment count
        const enrollmentMap = enrollmentCounts.reduce((acc: any, enrollment: any) => {
          acc[enrollment.batch_id] = (acc[enrollment.batch_id] || 0) + 1;
          return acc;
        }, {});
        
        // Add enrollment count to each batch
        batches.forEach((batch: any) => {
          batch.current_students = enrollmentMap[batch.id] || 0;
        });
        
        console.log('✅ Enrollment counts added:', Object.keys(enrollmentMap).length, 'batches have enrollments');
      } else {
        console.log('⚠️ Could not fetch enrollment counts:', enrollmentError?.message);
        // Set default enrollment count to 0 for all batches
        batches.forEach((batch: any) => {
          batch.current_students = 0;
        });
      }
    }

    // Filter batches based on student profile if available
    let filteredBatches: any[] = batches || [];
    console.log('🔄 Starting filtering process...');

    if (studentProfile?.exam_preference) {
      console.log('🎯 Filtering by exam preference:', studentProfile.exam_preference);
      filteredBatches = filteredBatches.filter((batch: any) => {
        if (!batch.category) return true;
        
        const batchCategory = batch.category.toLowerCase();
        const studentPreference = studentProfile.exam_preference.toLowerCase();
        
        return batchCategory.includes(studentPreference) || 
               batchCategory === 'both' || 
               studentPreference === 'both' ||
               batchCategory === 'general';
      });
    }

    if (studentProfile?.class_type) {
      console.log('📚 Filtering by class type:', studentProfile.class_type);
      filteredBatches = filteredBatches.filter((batch: any) => {
        if (!batch.class_type) return true;
        
        const batchClassType = batch.class_type.toLowerCase();
        const studentClass = studentProfile.class_type.toLowerCase();
        
        return batchClassType.includes(studentClass) || 
               batchClassType === 'all';
      });
    }

    console.log('📊 Filtering complete. Batches before:', batches?.length || 0, 'after:', filteredBatches.length);

    // Transform data to match frontend expectations
    const transformedBatches = filteredBatches.map((batch: any) => ({
      id: batch.id,
      title: batch.name || 'Untitled Batch',
      description: batch.description || 'No description available',
      instructor: batch.teacher_name || 'Instructor',
      students_count: batch.current_students || 0, // Use actual enrollment count
      start_date: batch.start_date,
      end_date: batch.end_date,
      status: batch.status === 'active' ? 'ongoing' : (batch.status || 'draft'),
      subjects: [], // Will be populated separately if needed
      batch_type: batch.batch_type || 'Regular',
      exam_focus: batch.category || 'General',
      image_url: batch.thumbnail,
      // Additional fields for admin dashboard
      capacity: batch.capacity,
      fees: batch.fees,
      created_at: batch.created_at,
      // Keep original field names for backward compatibility
      name: batch.name,
      category: batch.category,
      class_type: batch.class_type,
      thumbnail: batch.thumbnail,
      current_students: batch.current_students || 0,
      teacher_name: batch.teacher_name
    }));

    console.log('✅ Successfully processed batches:', {
      total: batches?.length || 0,
      filtered: transformedBatches.length,
      studentProfile,
      sampleBatch: transformedBatches[0] || null
    });
    
    return NextResponse.json({ 
      batches: transformedBatches,
      student_profile: studentProfile
    });

  } catch (error) {
    console.error('Error in GET /api/batches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new batch
export async function POST(request: NextRequest) {
  try {
    // Use admin client to avoid auth table permission issues
    console.log('Using admin client for batch creation');
    const adminSupabase = supabaseAdmin;
    
    // Get authenticated user from regular client first
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      console.log('No authenticated user, will create batch without user reference');
    }
    
    console.log('Authenticated user:', authUser?.id);

    const body = await request.json();
    
    // Validate required fields
    const { name, category, classType } = body;
    if (!name || !category || !classType) {
      return NextResponse.json(
        { error: 'Name, category, and class type are required' },
        { status: 400 }
      );
    }

    // Prepare batch data
    const batchData = {
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
      // Only set created_by if we have an authenticated user
      ...(authUser?.id ? { created_by: authUser.id } : {}),
      status: 'active'
    };

    const { data: batch, error } = await (adminSupabase as any)
      .from('batches')
      .insert(batchData)
      .select()
      .single();

    if (error) {
      console.error('Error creating batch:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Check if it's a table doesn't exist error
      if (error.code === '42P01') {
        return NextResponse.json({ 
          error: 'Database tables not set up yet. Please run database setup first.',
          needsSetup: true 
        }, { status: 400 });
      }
      
      // Check if it's a foreign key constraint error
      if (error.code === '23503') {
        return NextResponse.json({ 
          error: 'User reference error. Please make sure you are properly authenticated.',
          details: 'The user creating this batch must exist in the users table.',
          needsAuth: true
        }, { status: 400 });
      }
      
      // Check if it's an RLS policy error
      if (error.code === '42501') {
        return NextResponse.json({ 
          error: 'Permission denied. Database RLS policies may need setup.',
          details: 'Row Level Security policies are not properly configured.',
          needsSetup: true
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to create batch', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({ batch }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/batches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}// Force reload
