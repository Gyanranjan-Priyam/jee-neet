-- Setup Payment History Table for JEE-NEET Prep Platform
-- Run this SQL in your Supabase SQL Editor

-- Create payment_history table
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  
  -- Payment Details
  payment_method VARCHAR(50) NOT NULL DEFAULT 'card',
  payment_provider VARCHAR(50) DEFAULT 'razorpay',
  payment_id VARCHAR(255),
  order_id VARCHAR(255),
  
  -- Transaction Details
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  
  -- Payment Gateway Response
  gateway_payment_id VARCHAR(255),
  gateway_order_id VARCHAR(255),
  gateway_signature VARCHAR(255),
  gateway_response JSONB,
  
  -- Payment Method Specific
  upi_id VARCHAR(255),
  card_last_four VARCHAR(4),
  card_type VARCHAR(20),
  card_network VARCHAR(20),
  
  -- Billing Information
  billing_name VARCHAR(255),
  billing_email VARCHAR(255),
  billing_phone VARCHAR(20),
  billing_address TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional Info
  description TEXT,
  receipt_number VARCHAR(100) UNIQUE,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0
);

-- Add foreign key constraints if batches table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'batches') THEN
    ALTER TABLE payment_history 
    ADD CONSTRAINT fk_payment_batch 
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Constraint already exists
END $$;

-- Add foreign key constraint for users
DO $$
BEGIN
  ALTER TABLE payment_history 
  ADD CONSTRAINT fk_payment_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Constraint already exists
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_batch_id ON payment_history (batch_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history (status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history (created_at);
CREATE INDEX IF NOT EXISTS idx_payment_history_gateway_payment_id ON payment_history (gateway_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_receipt_number ON payment_history (receipt_number);

-- Enable RLS (Row Level Security)
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own payment history" ON payment_history;
DROP POLICY IF EXISTS "Users can insert own payment history" ON payment_history;
DROP POLICY IF EXISTS "System can update payment status" ON payment_history;

-- Policy: Users can only see their own payment history
CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own payment history
CREATE POLICY "Users can insert own payment history" ON payment_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: System can update payment status (for webhooks and verification)
CREATE POLICY "System can update payment status" ON payment_history
  FOR UPDATE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS payment_history_updated_at ON payment_history;
CREATE TRIGGER payment_history_updated_at
  BEFORE UPDATE ON payment_history
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_history_updated_at();

-- Create sequence for receipt numbers (if not exists)
CREATE SEQUENCE IF NOT EXISTS receipt_sequence START 1;

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  receipt_num TEXT;
BEGIN
  SELECT 'RCP' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(nextval('receipt_sequence')::TEXT, 6, '0')
  INTO receipt_num;
  RETURN receipt_num;
END;
$$ LANGUAGE plpgsql;

-- Insert sample payment history (for testing - remove in production)
-- This is just for demonstration, remove in actual deployment
INSERT INTO payment_history (
  user_id, 
  batch_id, 
  amount, 
  status, 
  payment_method,
  billing_name,
  billing_email,
  receipt_number
) VALUES 
(
  (SELECT id FROM auth.users LIMIT 1), -- Get first user
  (SELECT id FROM batches LIMIT 1), -- Get first batch  
  1599.00,
  'success',
  'card',
  'Sample User',
  'user@example.com',
  generate_receipt_number()
) ON CONFLICT (receipt_number) DO NOTHING;

-- Success message
SELECT 'Payment history table setup completed successfully!' as message;