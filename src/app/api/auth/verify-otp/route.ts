import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface VerifyOTPRequest {
  email: string;
  otp: string;
  purpose?: 'registration' | 'password_reset';
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyOTPRequest = await request.json();
    const { email, otp, purpose = 'registration' } = body;

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be a 6-digit number' },
        { status: 400 }
      );
    }

    // Clean up expired OTPs first
    try {
      await supabaseAdmin.rpc('cleanup_expired_otps');
    } catch (cleanupError) {
      console.warn('Cleanup expired OTPs warning:', cleanupError);
    }

    // Verify OTP manually by querying the table
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from('email_otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('purpose', 'email_verification')
      .is('verified_at', null)
      .gte('expires_at', new Date().toISOString())
      .single() as { data: any; error: any };

    if (fetchError || !otpRecord) {
      // Check if OTP exists but is expired
      const { data: expiredOTP } = await supabaseAdmin
        .from('email_otps')
        .select('id')
        .eq('email', email)
        .eq('otp', otp)
        .eq('purpose', 'email_verification')
        .single() as { data: any; error: any };

      if (expiredOTP) {
        return NextResponse.json(
          { error: 'OTP has expired' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    const { error: updateError } = await (supabaseAdmin as any)
      .from('email_otps')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error('Error marking OTP as verified:', updateError);
      return NextResponse.json(
        { error: 'Verification failed. Please try again.' },
        { status: 500 }
      );
    }

    // OTP verified successfully, now create the user account
    const userData = otpRecord.user_data as any;
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User data not found. Please restart the registration process.' },
        { status: 400 }
      );
    }

    try {
      // Create the user account using admin client
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Mark email as confirmed
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          full_name: `${userData.firstName} ${userData.lastName}`,
          class_type: userData.classType,
          exam_preference: userData.examPreference,
          phone: userData.phone,
          user_type: 'student',
        },
      });

      if (authError) {
        console.error('User creation error:', authError);
        
        // Handle specific Supabase auth errors
        if (authError.message.includes('User already registered')) {
          return NextResponse.json(
            { error: 'An account with this email already exists' },
            { status: 409 }
          );
        }
        
        return NextResponse.json(
          { error: authError.message || 'Failed to create user account' },
          { status: 500 }
        );
      }

      if (!authData.user) {
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      // Create student profile using admin client
      const { error: profileError } = await (supabaseAdmin as any)
        .from('student_profiles')
        .insert({
          user_id: authData.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          class_type: userData.classType,
          exam_preference: userData.examPreference,
          phone: userData.phone,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the entire process if profile creation fails
        // The user is already created in auth, they can complete profile later
      }

      // Clean up the verified OTP
      await (supabaseAdmin as any)
        .from('email_otps')
        .delete()
        .eq('id', otpRecord.id);

      // Log successful verification
      console.log('User verification and creation successful:', {
        email: userData.email,
        userId: authData.user.id,
        timestamp: new Date().toISOString(),
      });

      // Return success response with session info for auto-login
      return NextResponse.json({
        success: true,
        message: 'Email verified and account created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          classType: userData.classType,
          examPreference: userData.examPreference,
        },
        // Include credentials for immediate login
        autoLogin: {
          email: userData.email,
          password: userData.password
        }
      });

    } catch (userCreationError: any) {
      console.error('Error during user creation process:', userCreationError);
      
      // Clean up the verified OTP even if user creation fails
      await (supabaseAdmin as any)
        .from('email_otps')
        .delete()
        .eq('id', otpRecord.id);

      return NextResponse.json(
        { error: 'Account verification succeeded but account creation failed. Please try logging in or contact support.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Verify OTP API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle checking OTP status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if there's a pending OTP for this email
    const { data: otpData, error: otpError } = await (supabaseAdmin as any)
      .from('email_otps')
      .select('id, created_at, expires_at, attempts')
      .eq('email', email)
      .eq('purpose', 'email_verification')
      .is('verified_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError && otpError.code !== 'PGRST116') {
      console.error('OTP status check error:', otpError);
      return NextResponse.json(
        { error: 'Failed to check OTP status' },
        { status: 500 }
      );
    }

    if (!otpData) {
      return NextResponse.json({
        hasPendingOTP: false,
        message: 'No pending verification found'
      });
    }

    const now = new Date();
    const expiresAt = new Date(otpData.expires_at);
    const isExpired = now > expiresAt;

    if (isExpired) {
      // Clean up expired OTP
      await (supabaseAdmin as any)
        .from('email_otps')
        .delete()
        .eq('id', otpData.id);

      return NextResponse.json({
        hasPendingOTP: false,
        message: 'OTP has expired'
      });
    }

    const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

    return NextResponse.json({
      hasPendingOTP: true,
      timeRemaining,
      attempts: otpData.attempts,
      message: 'OTP is valid and pending verification'
    });

  } catch (error: any) {
    console.error('OTP status check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}