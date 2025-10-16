import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { batchId } = body;

    console.log('Test API - Request body:', body);

    // Create Supabase client
    const supabase = await createClient();
    console.log('Test API - Supabase client created');

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Test API - Auth check:', { user: user?.id, authError });

    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication failed',
        details: authError?.message,
        authError: true
      }, { status: 401 });
    }

    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    // Check if batch exists
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('id, name, fees, class_type, description')
      .eq('id', batchId)
      .single();

    console.log('Test API - Batch query:', { batch, batchError });

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

    console.log('Test API - Payment table check:', { paymentCheck, paymentCheckError });

    // Test Razorpay environment variables
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    
    console.log('Test API - Environment check:', {
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

      console.log('Test API - Razorpay instance created successfully');

      // Test order creation
      const orderOptions = {
        amount: Math.round(batch.fees * 100), // Convert to paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          batchId: batch.id,
          userId: user.id,
          batchName: batch.name
        }
      };

      console.log('Test API - Order options:', orderOptions);

      const order = await razorpay.orders.create(orderOptions);
      console.log('Test API - Razorpay order created:', order);

      return NextResponse.json({
        success: true,
        message: 'All systems working correctly',
        data: {
          user: { id: user.id, email: user.email },
          batch: batch,
          order: order,
          paymentTableExists: !paymentCheckError,
          environmentsSet: true
        }
      });

    } catch (razorpayError) {
      console.error('Test API - Razorpay error:', razorpayError);
      return NextResponse.json({ 
        error: 'Razorpay initialization or order creation failed',
        details: razorpayError instanceof Error ? razorpayError.message : 'Unknown Razorpay error',
        razorpayError: true
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test API - General error:', error);
    return NextResponse.json({
      error: 'Test API failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}