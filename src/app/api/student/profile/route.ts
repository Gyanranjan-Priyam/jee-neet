import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a student
    if (user.user_metadata?.user_type !== 'student') {
      return NextResponse.json({ error: 'Access denied. Student access required.' }, { status: 403 });
    }

    // Fetch student profile
    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching student profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Map database fields to frontend expected format
    const mappedProfile = {
      user_id: profile.user_id,
      class_level: profile.class_type, // Map class_type to class_level
      stream: profile.exam_preference, // Map exam_preference to stream
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone: profile.phone,
      school_name: profile.school_name,
      city: profile.city,
      state: profile.state,
      profile_picture: profile.profile_picture,
      is_active: profile.is_active
    };

    return NextResponse.json({ 
      success: true, 
      profile: mappedProfile 
    });

  } catch (error) {
    console.error('Error in student profile API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a student
    if (user.user_metadata?.user_type !== 'student') {
      return NextResponse.json({ error: 'Access denied. Student access required.' }, { status: 403 });
    }

    const body = await request.json();
    
    // Map frontend fields back to database fields
    const updateData = {
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone,
      class_type: body.class_level, // Map class_level back to class_type
      exam_preference: body.stream, // Map stream back to exam_preference
      school_name: body.school_name,
      city: body.city,
      state: body.state,
      profile_picture: body.profile_picture,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const { data: updatedProfile, error } = await supabase
      .from('student_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating student profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Map back to frontend format
    const mappedProfile = {
      user_id: updatedProfile.user_id,
      class_level: updatedProfile.class_type,
      stream: updatedProfile.exam_preference,
      first_name: updatedProfile.first_name,
      last_name: updatedProfile.last_name,
      email: updatedProfile.email,
      phone: updatedProfile.phone,
      school_name: updatedProfile.school_name,
      city: updatedProfile.city,
      state: updatedProfile.state,
      profile_picture: updatedProfile.profile_picture,
      is_active: updatedProfile.is_active
    };

    return NextResponse.json({ 
      success: true, 
      profile: mappedProfile 
    });

  } catch (error) {
    console.error('Error updating student profile:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}