import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // Check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(user => user.email === email);
    
    // Check if user exists in student_profiles
    const { data: profileUser, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('email', email)
      .single() as { data: any; error: any };

    return NextResponse.json({
      success: true,
      authUser: {
        exists: !authError && !!authUser,
        id: authUser?.id,
        email: authUser?.email,
        emailConfirmed: authUser?.email_confirmed_at ? true : false,
        createdAt: authUser?.created_at,
        userType: authUser?.user_metadata?.user_type,
        error: authError?.message
      },
      profileUser: {
        exists: !profileError && !!profileUser,
        id: profileUser?.user_id,
        email: profileUser?.email,
        firstName: profileUser?.first_name,
        lastName: profileUser?.last_name,
        error: profileError?.message
      },
      message: 'User status check completed'
    });

  } catch (error) {
    console.error('Check user API error:', error);
    return NextResponse.json({
      error: 'Failed to check user status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}