import nodemailer from 'nodemailer';

interface EmailResult {
  success: boolean;
  message: string;
  messageId?: string;
}

// Create nodemailer transporter
const createTransporter = () => {
  // Check if we have SMTP configuration
  const hasSMTPConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  
  if (hasSMTPConfig) {
    console.log('📧 Using SMTP configuration for email service');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Add some additional options for better reliability
      tls: {
        rejectUnauthorized: false // This helps with some email providers
      }
    });
  }
  
  // Fallback to Gmail if EMAIL_USER is provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('📧 Using Gmail configuration for email service');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  console.log('⚠️ No email configuration found - emails will be logged only');
  return null;
};

export async function sendOTPEmail(
  email: string, 
  otp: string, 
  firstName: string, 
  purpose: 'registration' | 'password_reset' = 'registration'
): Promise<EmailResult> {
  try {
    const subject = purpose === 'registration' 
      ? 'JEE-NEET App - Email Verification Code'
      : 'JEE-NEET App - Password Reset Code';
    
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">JEE-NEET Preparation App</h2>
        
        <p>Hello <strong>${firstName}</strong>,</p>
        
        <p>Your verification code is:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2563eb; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 4px;">${otp}</h1>
        </div>
        
        <p><strong>This code will expire in 2 minutes.</strong></p>
        
        <p>Purpose: ${purpose === 'registration' ? 'Account Registration' : 'Password Reset'}</p>
        
        <p>If you didn't request this code, please ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          JEE-NEET Preparation Team
        </p>
      </div>
    `;

    const textMessage = `
Hello ${firstName},

Your verification code is: ${otp}

This code will expire in 2 minutes.

Purpose: ${purpose === 'registration' ? 'Account Registration' : 'Password Reset'}

If you didn't request this code, please ignore this email.

Best regards,
JEE-NEET Preparation Team
    `.trim();

    // Try to send actual email
    const transporter = createTransporter();
    
    if (!transporter) {
      // Fallback to logging if no email configuration
      console.log('📧 EMAIL LOGGED (No SMTP config)');
      console.log('To:', email);
      console.log('Subject:', subject);
      console.log('OTP:', otp);
      console.log('Message:', textMessage);
      console.log('---');

      return {
        success: true,
        message: 'OTP logged successfully (no email config)',
        messageId: `logged-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
    }

    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@jeeneet.com';
    
    const mailOptions = {
      from: {
        name: 'JEE-NEET Preparation',
        address: fromAddress
      },
      to: email,
      subject,
      text: textMessage,
      html: htmlMessage,
    };

    // Test connection before sending
    try {
      await transporter.verify();
      console.log('📧 SMTP connection verified successfully');
    } catch (verifyError: any) {
      console.error('📧 SMTP connection failed:', verifyError.message);
      // Continue anyway - some servers don't support verify
    }
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('📧 Email sent successfully:', {
      to: email,
      messageId: info.messageId,
      response: info.response
    });

    return {
      success: true,
      message: 'OTP sent successfully',
      messageId: info.messageId
    };

  } catch (error: any) {
    console.error('Email sending error:', error);
    return {
      success: false,
      message: `Failed to send OTP: ${error.message || 'Unknown error'}`
    };
  }
}

export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  tempPassword?: string
): Promise<EmailResult> {
  try {
    const subject = 'Welcome to JEE-NEET Preparation App!';
    
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to JEE-NEET Preparation App!</h2>
        
        <p>Hello <strong>${firstName}</strong>,</p>
        
        <p>Welcome to the JEE-NEET Preparation App! Your account has been successfully created.</p>
        
        ${tempPassword ? `
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your login credentials:</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${tempPassword}</p>
          <p style="color: #dc2626; font-size: 14px;"><strong>Please change your password after logging in for the first time.</strong></p>
        </div>
        ` : ''}
        
        <h3>You can now access:</h3>
        <ul>
          <li>📚 Comprehensive study materials</li>
          <li>📝 Practice tests and mock exams</li>
          <li>📊 Progress tracking</li>
          <li>👨‍🏫 Expert guidance</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/student/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          JEE-NEET Preparation Team
        </p>
      </div>
    `;

    const textMessage = `
Hello ${firstName},

Welcome to the JEE-NEET Preparation App! Your account has been successfully created.

${tempPassword ? `Your temporary login credentials:
Email: ${email}
Password: ${tempPassword}

Please change your password after logging in for the first time.` : ''}

You can now access:
- Comprehensive study materials
- Practice tests and mock exams
- Progress tracking
- Expert guidance

Get started: http://localhost:3000/student/login

Best regards,
JEE-NEET Preparation Team
    `.trim();

    // Try to send actual email
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('📧 WELCOME EMAIL LOGGED (No SMTP config)');
      console.log('To:', email);
      console.log('Subject:', subject);
      console.log('Message:', textMessage);
      console.log('---');

      return {
        success: true,
        message: 'Welcome email logged successfully (no email config)',
        messageId: `logged-welcome-${Date.now()}`
      };
    }

    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@jeeneet.com';
    
    const mailOptions = {
      from: {
        name: 'JEE-NEET Preparation',
        address: fromAddress
      },
      to: email,
      subject,
      text: textMessage,
      html: htmlMessage,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: 'Welcome email sent successfully',
      messageId: info.messageId
    };

  } catch (error: any) {
    console.error('Welcome email sending error:', error);
    return {
      success: false,
      message: `Failed to send welcome email: ${error.message || 'Unknown error'}`
    };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetLink: string
): Promise<EmailResult> {
  try {
    const subject = 'JEE-NEET App - Password Reset Request';
    
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        
        <p>Hello <strong>${firstName}</strong>,</p>
        
        <p>You requested a password reset for your JEE-NEET Preparation App account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        
        <p style="color: #dc2626;"><strong>This link will expire in 1 hour.</strong></p>
        
        <p>If you didn't request this reset, please ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          JEE-NEET Preparation Team
        </p>
      </div>
    `;

    const textMessage = `
Hello ${firstName},

You requested a password reset for your JEE-NEET Preparation App account.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request this reset, please ignore this email.

Best regards,
JEE-NEET Preparation Team
    `.trim();

    // Try to send actual email
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('📧 PASSWORD RESET EMAIL LOGGED (No SMTP config)');
      console.log('To:', email);
      console.log('Subject:', subject);
      console.log('Reset Link:', resetLink);
      console.log('---');

      return {
        success: true,
        message: 'Password reset email logged successfully (no email config)',
        messageId: `logged-reset-${Date.now()}`
      };
    }

    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@jeeneet.com';
    
    const mailOptions = {
      from: {
        name: 'JEE-NEET Preparation',
        address: fromAddress
      },
      to: email,
      subject,
      text: textMessage,
      html: htmlMessage,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: 'Password reset email sent successfully',
      messageId: info.messageId
    };

  } catch (error: any) {
    console.error('Password reset email sending error:', error);
    return {
      success: false,
      message: `Failed to send password reset email: ${error.message || 'Unknown error'}`
    };
  }
}