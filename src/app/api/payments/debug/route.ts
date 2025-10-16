import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { batchId } = body;

    console.log('Debug API - Request body:', body);

    // Create Supabase admin client for debugging (bypasses RLS)
    const supabase = createAdminClient();
    console.log('Debug API - Supabase admin client created');

    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    // Check if batch exists (using service role, no auth required)
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('id, name, fees, class_type, description, status')
      .eq('id', batchId)
      .single() as { data: any; error: any };

    console.log('Debug API - Batch query:', { batch, batchError });

    if (batchError) {
      return NextResponse.json({ 
        error: 'Failed to fetch batch',
        details: batchError.message,
        batchError: true
      }, { status: 404 });
    }

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Check payment_history table
    const { data: paymentCheck, error: paymentCheckError } = await supabase
      .from('payment_history')
      .select('id')
      .limit(1);

    console.log('Debug API - Payment table check:', { paymentCheck, paymentCheckError });

    // Test Razorpay environment variables
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    
    console.log('Debug API - Environment check:', {
      razorpayKeyId: razorpayKeyId ? 'Set' : 'Missing',
      razorpayKeySecret: razorpayKeySecret ? 'Set' : 'Missing'
    });

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json({ 
        error: 'Razorpay credentials missing',
        details: 'Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables',
        envError: true
      }, { status: 500 });
    }

    // Test Razorpay instance creation
    try {
      const Razorpay = (await import('razorpay')).default;
      const razorpay = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      });

      console.log('Debug API - Razorpay instance created successfully');

      // Test order creation
      const orderOptions = {
        amount: Math.round(batch.fees * 100), // Convert to paise
        currency: 'INR',
        receipt: `debug_receipt_${Date.now()}`,
        notes: {
          batchId: batch.id,
          debugTest: 'true',
          batchName: batch.name
        }
      };

      console.log('Debug API - Order options:', orderOptions);

      const order = await razorpay.orders.create(orderOptions as any);
      console.log('Debug API - Razorpay order created:', order);

      return NextResponse.json({
        success: true,
        message: 'All systems working correctly (no auth required for debug)',
        data: {
          batch: batch,
          order: order,
          paymentTableExists: !paymentCheckError,
          environmentsSet: true,
          razorpayWorking: true
        }
      });

    } catch (razorpayError) {
      console.error('Debug API - Razorpay error:', razorpayError);
      return NextResponse.json({ 
        error: 'Razorpay initialization or order creation failed',
        details: razorpayError instanceof Error ? razorpayError.message : 'Unknown Razorpay error',
        razorpayError: true
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Debug API - General error:', error);
    return NextResponse.json({
      error: 'Debug API failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}