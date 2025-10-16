import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if payment_history table exists
    const { data, error } = await supabase
      .from('payment_history')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      // Table doesn't exist, create it
      const createTableSQL = `
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

        -- Enable RLS (Row Level Security)
        ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history (user_id);
        CREATE INDEX IF NOT EXISTS idx_payment_history_batch_id ON payment_history (batch_id);
        CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history (status);

        -- Policy: Users can only see their own payment history
        DROP POLICY IF EXISTS "Users can view own payment history" ON payment_history;
        CREATE POLICY "Users can view own payment history" ON payment_history
          FOR SELECT USING (auth.uid() = user_id);

        -- Policy: Users can insert their own payment history
        DROP POLICY IF EXISTS "Users can insert own payment history" ON payment_history;
        CREATE POLICY "Users can insert own payment history" ON payment_history
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- Policy: System can update payment status
        DROP POLICY IF EXISTS "System can update payment status" ON payment_history;
        CREATE POLICY "System can update payment status" ON payment_history
          FOR UPDATE USING (true);
      `;

      try {
        // This is a simplified approach - in production you'd use a proper migration system
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: createTableSQL
        });

        if (createError) {
          return NextResponse.json({ 
            error: 'Failed to create payment_history table',
            details: createError.message,
            instructions: 'Please run the SQL from database/setup_payment_history.sql in your Supabase SQL Editor'
          }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Payment history table created successfully'
        });
      } catch (setupError) {
        return NextResponse.json({ 
          error: 'Failed to setup payment table',
          details: 'Please manually run the SQL from database/setup_payment_history.sql in your Supabase SQL Editor',
          setupInstructions: {
            step1: 'Go to your Supabase dashboard',
            step2: 'Navigate to SQL Editor',
            step3: 'Copy and paste the contents of database/setup_payment_history.sql',
            step4: 'Execute the SQL'
          }
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment history table exists and is ready'
    });

  } catch (error) {
    console.error('Error in payment setup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check payment system',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}