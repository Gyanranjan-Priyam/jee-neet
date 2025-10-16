import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // First check auth.users metadata for user type (most reliable)
    const { data: allUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (!usersError && allUsers.users) {
      const authUser = allUsers.users.find(user => user.email === email);
      
      if (authUser) {
        const userType = authUser.user_metadata?.user_type;
        
        if (userType === 'admin') {
          return NextResponse.json({
            success: true,
            userType: 'admin',
            role: authUser.user_metadata?.role || 'superadmin',
            email: authUser.email
          });
        }
        
        // If user exists but not admin, check if they're a student
        if (userType === 'student') {
          return NextResponse.json({
            success: true,
            userType: 'student',
            email: authUser.email
          });
        }
      }
    }

    // Fallback: Check admin_users table (if it exists)
    try {
      const { data: adminUser, error: adminError } = await (supabaseAdmin as any)
        .from('admin_users')
        .select('id, email, role, is_active')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (!adminError && adminUser) {
        return NextResponse.json({
          success: true,
          userType: 'admin',
          role: adminUser.role,
          email: adminUser.email
        });
      }
    } catch (error) {
      // Table might not exist, continue with other checks
      console.log('Admin table check skipped:', error);
    }

    // Check if user exists in student_profiles table
    const { data: studentUser, error: studentError } = await (supabaseAdmin as any)
      .from('student_profiles')
      .select('id, email, user_id')
      .eq('email', email)
      .single();

    if (!studentError && studentUser) {
      return NextResponse.json({
        success: true,
        userType: 'student',
        email: studentUser.email
      });
    }



    // User doesn't exist
    return NextResponse.json({
      success: false,
      userType: null,
      message: 'User not found'
    });

  } catch (error: any) {
    console.error('Check user type API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}