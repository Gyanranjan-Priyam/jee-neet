import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendOTPEmail } from '@/lib/email-service';

interface SendOTPRequest {
  email: string;
  firstName: string;
  lastName: string;
  classType: string;
  examPreference: string;
  phone?: string;
  password: string;
  purpose?: 'registration' | 'password_reset';
}

export async function POST(request: NextRequest) {
  try {
    const body: SendOTPRequest = await request.json();
    const { 
      email, 
      firstName, 
      lastName, 
      classType, 
      examPreference, 
      phone, 
      password,
      purpose = 'registration' 
    } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
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

    // For registration, validate additional fields
    if (purpose === 'registration') {
      if (!classType || !examPreference || !password) {
        return NextResponse.json(
          { error: 'Class type, exam preference, and password are required for registration' },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }

      // Check if user already exists in student profiles
      const { data: profileCheck } = await supabaseAdmin
        .from('student_profiles')
        .select('email')
        .eq('email', email)
        .single();
      
      if (profileCheck) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare user data for storage
    const userData = {
      email,
      firstName,
      lastName,
      classType,
      examPreference,
      phone: phone || null,
      password, // Store temporarily, will be used when creating the actual user
      purpose
    };

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create OTP in database using admin client - Direct insert
    const { data: otpData, error: otpError } = await (supabaseAdmin as any)
      .from('email_otps')
      .insert({
        email: email,
        otp: otp,
        purpose: 'email_verification',
        user_data: userData,
        expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString() // 2 minutes from now
      })
      .select()
      .single();

    if (otpError || !otpData) {
      console.error('Error creating OTP:', otpError);
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      );
    }

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, firstName, purpose);

    if (!emailResult.success) {
      // Clean up the OTP if email failed
      await supabaseAdmin
        .from('email_otps')
        .delete()
        .eq('email', email)
        .eq('purpose', 'email_verification');

      return NextResponse.json(
        { error: emailResult.message },
        { status: 500 }
      );
    }

    // Log successful OTP generation
    console.log('OTP sent successfully:', {
      email,
      purpose,
      messageId: emailResult.messageId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      email,
      expiresIn: 120 // 2 minutes in seconds
    });

  } catch (error: any) {
    console.error('Send OTP API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle resend OTP requests
export async function PUT(request: NextRequest) {
  try {
    const { email, purpose = 'registration' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get existing OTP data using admin client
    const { data: existingOTP, error: fetchError } = await (supabaseAdmin as any)
      .from('email_otps')
      .select('user_data')
      .eq('email', email)
      .eq('purpose', 'email_verification')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !existingOTP?.user_data) {
      return NextResponse.json(
        { error: 'No pending verification found for this email' },
        { status: 404 }
      );
    }

    const userData = existingOTP.user_data as any;
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Create new OTP using admin client - Direct insert instead of RPC
    const { data: otpData, error: otpError } = await (supabaseAdmin as any)
      .from('email_otps')
      .insert({
        email: email,
        otp: newOTP,
        purpose: 'email_verification',
        user_data: userData,
        expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString() // 2 minutes from now
      })
      .select()
      .single();

    if (otpError || !otpData) {
      console.error('Error creating resend OTP:', otpError);
      return NextResponse.json(
        { error: 'Failed to generate new verification code' },
        { status: 500 }
      );
    }

    const otp = otpData.otp;

    // Send new OTP email
    const emailResult = await sendOTPEmail(email, otp, userData.firstName, purpose);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.message },
        { status: 500 }
      );
    }

    console.log('OTP resent successfully:', {
      email,
      purpose,
      messageId: emailResult.messageId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'New verification code sent to your email',
      email,
      expiresIn: 120
    });

  } catch (error: any) {
    console.error('Resend OTP API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}