-- Payment History Schema
-- This table stores all payment transactions for users

CREATE TABLE IF NOT EXISTS payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  
  -- Payment Details
  payment_method VARCHAR(50) NOT NULL, -- 'card', 'upi', 'netbanking', 'wallet'
  payment_provider VARCHAR(50), -- 'razorpay', 'stripe', etc.
  payment_id VARCHAR(255), -- Provider's payment ID
  order_id VARCHAR(255), -- Our order ID
  
  -- Transaction Details
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'refunded'
  
  -- Payment Gateway Response
  gateway_payment_id VARCHAR(255), -- Razorpay payment_id
  gateway_order_id VARCHAR(255), -- Razorpay order_id
  gateway_signature VARCHAR(255), -- Payment signature for verification
  gateway_response JSONB, -- Full gateway response
  
  -- UPI Specific
  upi_id VARCHAR(255), -- UPI ID if payment via UPI
  
  -- Card Specific (Store securely - only last 4 digits)
  card_last_four VARCHAR(4),
  card_type VARCHAR(20), -- 'credit', 'debit'
  card_network VARCHAR(20), -- 'visa', 'mastercard', 'rupay'
  
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
  discount_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Indexes for better performance
  INDEX idx_payment_history_user_id (user_id),
  INDEX idx_payment_history_batch_id (batch_id),
  INDEX idx_payment_history_status (status),
  INDEX idx_payment_history_created_at (created_at),
  INDEX idx_payment_history_payment_id (payment_id),
  INDEX idx_payment_history_gateway_payment_id (gateway_payment_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own payment history
CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own payment history
CREATE POLICY "Users can insert own payment history" ON payment_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: System can update payment status
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
CREATE TRIGGER payment_history_updated_at
  BEFORE UPDATE ON payment_history
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_history_updated_at();

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

-- Create sequence for receipt numbers
CREATE SEQUENCE IF NOT EXISTS receipt_sequence START 1;

-- Function to create payment record
CREATE OR REPLACE FUNCTION create_payment_record(
  p_user_id UUID,
  p_batch_id UUID,
  p_amount DECIMAL,
  p_payment_method VARCHAR,
  p_billing_name VARCHAR,
  p_billing_email VARCHAR,
  p_billing_phone VARCHAR DEFAULT NULL,
  p_billing_address TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  payment_record_id UUID;
  receipt_num TEXT;
BEGIN
  -- Generate receipt number
  receipt_num := generate_receipt_number();
  
  -- Insert payment record
  INSERT INTO payment_history (
    user_id, batch_id, amount, payment_method,
    billing_name, billing_email, billing_phone, billing_address,
    receipt_number, status, order_id
  ) VALUES (
    p_user_id, p_batch_id, p_amount, p_payment_method,
    p_billing_name, p_billing_email, p_billing_phone, p_billing_address,
    receipt_num, 'pending', 'ORD' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || p_user_id
  ) RETURNING id INTO payment_record_id;
  
  RETURN payment_record_id;
END;
$$ LANGUAGE plpgsql;