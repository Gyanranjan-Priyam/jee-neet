-- Email OTPs Schema
-- This file creates the email_otps table for managing email verification

-- Create email_otps table
CREATE TABLE IF NOT EXISTS email_otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) CHECK (purpose IN ('email_verification', 'password_reset', 'registration')) DEFAULT 'email_verification',
    user_data JSONB, -- Store temporary user data during registration
    is_used BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for email_otps
CREATE INDEX IF NOT EXISTS email_otps_email_idx ON email_otps(email);
CREATE INDEX IF NOT EXISTS email_otps_otp_idx ON email_otps(otp);
CREATE INDEX IF NOT EXISTS email_otps_purpose_idx ON email_otps(purpose);
CREATE INDEX IF NOT EXISTS email_otps_expires_at_idx ON email_otps(expires_at);
CREATE INDEX IF NOT EXISTS email_otps_is_used_idx ON email_otps(is_used);

-- Enable Row Level Security (though this table is mainly accessed via server-side code)
ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;

-- Create policies for email_otps (restrictive - mainly for admin access)
CREATE POLICY "Admins can manage all OTPs" ON email_otps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
        OR
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            WHERE u.user_metadata->>'user_type' = 'admin'
        )
    );

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM email_otps 
    WHERE expires_at < NOW() OR (is_used = true AND used_at < NOW() - INTERVAL '1 day');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to verify OTP
CREATE OR REPLACE FUNCTION verify_email_otp(
    input_email TEXT,
    input_otp TEXT,
    input_purpose TEXT DEFAULT 'email_verification'
)
RETURNS TABLE(
    is_valid BOOLEAN,
    user_data JSONB,
    message TEXT,
    otp_id UUID
) AS $$
DECLARE
    otp_record RECORD;
    result_is_valid BOOLEAN := FALSE;
    result_message TEXT := 'Invalid or expired OTP';
    result_user_data JSONB := NULL;
    result_otp_id UUID := NULL;
BEGIN
    -- Find the most recent valid OTP for this email and purpose
    SELECT * INTO otp_record
    FROM email_otps
    WHERE email = input_email
    AND otp = input_otp
    AND purpose = input_purpose
    AND is_used = FALSE
    AND expires_at > NOW()
    AND attempts < max_attempts
    ORDER BY created_at DESC
    LIMIT 1;

    IF otp_record.id IS NOT NULL THEN
        -- Valid OTP found
        result_is_valid := TRUE;
        result_message := 'OTP verified successfully';
        result_user_data := otp_record.user_data;
        result_otp_id := otp_record.id;
        
        -- Mark OTP as used
        UPDATE email_otps
        SET is_used = TRUE, used_at = NOW()
        WHERE id = otp_record.id;
    ELSE
        -- Check if OTP exists but is invalid (for better error messages)
        SELECT * INTO otp_record
        FROM email_otps
        WHERE email = input_email
        AND otp = input_otp
        AND purpose = input_purpose
        ORDER BY created_at DESC
        LIMIT 1;
        
        IF otp_record.id IS NOT NULL THEN
            IF otp_record.is_used = TRUE THEN
                result_message := 'OTP has already been used';
            ELSIF otp_record.expires_at <= NOW() THEN
                result_message := 'OTP has expired';
            ELSIF otp_record.attempts >= otp_record.max_attempts THEN
                result_message := 'Too many verification attempts';
            END IF;
            
            -- Increment attempts
            UPDATE email_otps
            SET attempts = attempts + 1
            WHERE id = otp_record.id;
        END IF;
    END IF;

    RETURN QUERY SELECT result_is_valid, result_user_data, result_message, result_otp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate and store OTP
CREATE OR REPLACE FUNCTION create_email_otp(
    input_email TEXT,
    input_otp TEXT,
    input_purpose TEXT DEFAULT 'email_verification',
    input_user_data JSONB DEFAULT NULL,
    expiry_minutes INTEGER DEFAULT 2
)
RETURNS UUID AS $$
DECLARE
    new_otp_id UUID;
BEGIN
    -- Delete any existing unused OTPs for this email and purpose
    DELETE FROM email_otps
    WHERE email = input_email
    AND purpose = input_purpose
    AND is_used = FALSE;
    
    -- Insert new OTP
    INSERT INTO email_otps (email, otp, purpose, user_data, expires_at)
    VALUES (
        input_email,
        input_otp,
        input_purpose,
        input_user_data,
        NOW() + INTERVAL '1 minute' * expiry_minutes
    )
    RETURNING id INTO new_otp_id;
    
    RETURN new_otp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up expired OTPs (if pg_cron is available)
-- This would need to be run manually or via a cron job if pg_cron is not available
-- SELECT cron.schedule('cleanup-expired-otps', '0 */6 * * *', 'SELECT cleanup_expired_otps();');

-- Insert some test data (for development only - remove in production)
-- INSERT INTO email_otps (email, otp, purpose, expires_at)
-- VALUES ('test@example.com', '123456', 'email_verification', NOW() + INTERVAL '2 minutes');