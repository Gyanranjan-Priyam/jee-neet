import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface CreateAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  permissions?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAdminRequest = await request.json();
    const { email, password, firstName, lastName } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if any admin already exists (only allow one superadmin)
    try {
      const { data: existingAdmins, error: checkError } = await (supabaseAdmin as any)
        .from('admin_users')
        .select('id')
        .limit(1);

      if (checkError) {
        // Table might not exist, try to create it first
        console.log('Admin table might not exist:', checkError.message);
      } else if (existingAdmins && existingAdmins.length > 0) {
        return NextResponse.json(
          { error: 'Superadmin already exists. Only one admin account is allowed.' },
          { status: 409 }
        );
      }
    } catch (tableError) {
      console.log('Error checking admin table:', tableError);
    }

    // Check if user already exists in auth
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = authUsers.users?.find(user => user.email === email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Create the superadmin user account using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Mark email as confirmed
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        user_type: 'admin',
        role: 'superadmin',
        permissions: ['all'],
      },
    });

    if (authError) {
      console.error('Admin creation error:', authError);
      
      if (authError.message.includes('User already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: authError.message || 'Failed to create admin account' },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create admin account' },
        { status: 500 }
      );
    }

    // Create superadmin profile (try to create, but don't fail if table doesn't exist)
    try {
      const { error: profileError } = await (supabaseAdmin as any)
        .from('admin_users')
        .insert({
          user_id: authData.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          role: 'superadmin',
          permissions: ['all'],
          is_active: true,
        });
      
      if (profileError) {
        console.warn('Could not create admin profile (table may not exist):', profileError.message);
        // Don't fail the entire process - the user is created in auth with proper metadata
      }
    } catch (profileError) {
      console.warn('Admin profile creation skipped:', profileError);
    }

    // Log successful superadmin creation
    console.log('Superadmin created successfully:', {
      email: email,
      userId: authData.user.id,
      role: 'superadmin',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Superadmin account created successfully',
      admin: {
        id: authData.user.id,
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: 'superadmin',
        permissions: ['all'],
      }
    });

  } catch (error: any) {
    console.error('Create admin API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get admin users (for super admin only)
export async function GET(request: NextRequest) {
  try {
    // This would need proper authentication check in real implementation
    const { data: admins, error } = await supabaseAdmin
      .from('admin_users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        permissions,
        is_active,
        last_login_at,
        created_at
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admins:', error);
      return NextResponse.json(
        { error: 'Failed to fetch admin users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      admins: admins || []
    });

  } catch (error: any) {
    console.error('Get admins API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}