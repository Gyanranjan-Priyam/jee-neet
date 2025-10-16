import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getRazorpayInstance } from '@/lib/razorpay';
import crypto from 'crypto';

// Create Razorpay Order
export async function POST(request: NextRequest) {
  try {
    const { batchId, amount, currency = 'INR', billingInfo } = await request.json();
    
    // Verify user authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ 
        error: 'Unauthorized. Please login to continue.',
        authError: authError?.message 
      }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    // Verify batch exists and get details (use admin client to bypass RLS)
    console.log('Looking for batch with ID:', batchId);
    const supabaseAdmin = createAdminClient();
    const { data: batch, error: batchError } = await supabaseAdmin
      .from('batches')
      .select('id, name, fees, class_type, description, status')
      .eq('id', batchId)
      .single() as { data: any; error: any };

    if (batchError || !batch) {
      console.error('Batch error:', batchError);
      console.error('Batch ID provided:', batchId);
      return NextResponse.json({ 
        error: 'Batch not found',
        batchId: batchId,
        details: batchError?.message || 'Batch does not exist'
      }, { status: 404 });
    }

    console.log('Found batch:', batch.name);

    // Check if user is already enrolled
    const { data: existingEnrollment } = await supabase
      .from('batch_enrollments')
      .select('*')
      .eq('batch_id', batchId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled in this batch' }, { status: 400 });
    }

    // Generate receipt number
    const receiptNumber = `RCP${Date.now()}_${user.id.slice(0, 8)}`;

    // Create payment record in database
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payment_history')
      .insert([
        {
          user_id: user.id,
          batch_id: batchId,
          amount: amount,
          currency: currency,
          payment_method: 'pending', // Will be updated based on actual payment method
          status: 'pending',
          receipt_number: receiptNumber,
          billing_name: billingInfo.firstName + ' ' + billingInfo.lastName,
          billing_email: billingInfo.email,
          billing_phone: billingInfo.phone,
          billing_address: billingInfo.address ? 
            `${billingInfo.address}, ${billingInfo.city}, ${billingInfo.state} ${billingInfo.pincode}` : null,
          order_id: `ORD_${Date.now()}_${user.id.slice(0, 8)}`
        }
      ])
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      console.error('Payment error details:', JSON.stringify(paymentError, null, 2));
      
      // Check if payment_history table doesn't exist
      if (paymentError.code === '42P01') {
        return NextResponse.json({ 
          error: 'Payment system not initialized. Please contact administrator.',
          needsSetup: true,
          details: 'payment_history table does not exist'
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to create payment record',
        details: paymentError.message,
        code: paymentError.code
      }, { status: 500 });
    }

    // Create Razorpay order
    const razorpayInstance = getRazorpayInstance();
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: receiptNumber,
      notes: {
        batch_id: batchId,
        batch_name: batch.name,
        user_id: user.id,
        user_email: user.email || '',
        payment_record_id: paymentRecord.id
      }
    });

    // Update payment record with Razorpay order ID
    await supabase
      .from('payment_history')
      .update({
        gateway_order_id: razorpayOrder.id,
        payment_provider: 'razorpay'
      })
      .eq('id', paymentRecord.id);

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      paymentRecordId: paymentRecord.id,
      batch: {
        id: batch.id,
        name: batch.name,
        class_type: batch.class_type,
        fees: batch.fees,
        description: batch.description
      }
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to create payment order',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}