import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import crypto from 'crypto';

// Verify Razorpay Payment
export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentRecordId,
      paymentMethod = 'card' // Default to card, can be 'upi', 'netbanking', etc.
    } = await request.json();

    // Verify user authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get payment record
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payment_history')
      .select('*')
      .eq('id', paymentRecordId)
      .eq('user_id', user.id)
      .single();

    if (paymentError || !paymentRecord) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      // Update payment record as failed
      await supabase
        .from('payment_history')
        .update({
          status: 'failed',
          gateway_payment_id: razorpay_payment_id,
          gateway_signature: razorpay_signature,
          updated_at: new Date().toISOString(),
          description: 'Payment signature verification failed'
        })
        .eq('id', paymentRecordId);

      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Payment is verified, update payment record
    const { error: updatePaymentError } = await supabase
      .from('payment_history')
      .update({
        status: 'success',
        payment_method: paymentMethod,
        gateway_payment_id: razorpay_payment_id,
        gateway_signature: razorpay_signature,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentRecordId);

    if (updatePaymentError) {
      console.error('Error updating payment record:', updatePaymentError);
      return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
    }

    // Create or update enrollment using admin client to bypass RLS
    const supabaseAdmin = createAdminClient();
    const { data: existingEnrollment } = await supabaseAdmin
      .from('batch_enrollments')
      .select('*')
      .eq('batch_id', paymentRecord.batch_id)
      .eq('student_id', user.id)
      .single() as { data: any; error: any };

    if (existingEnrollment) {
      // Update existing enrollment
      const updateData = {
        status: 'active',
        payment_status: 'paid',
        payment_amount: paymentRecord.amount,
        updated_at: new Date().toISOString()
      };
      const { error: updateError } = await (supabaseAdmin as any)
        .from('batch_enrollments')
        .update(updateData)
        .eq('id', existingEnrollment.id);

      if (updateError) {
        console.error('Error updating enrollment:', updateError);
        return NextResponse.json({ error: 'Payment successful but enrollment update failed' }, { status: 500 });
      }
    } else {
      // Create new enrollment
      const enrollmentData = {
        batch_id: paymentRecord.batch_id,
        student_id: user.id,
        status: 'active',
        payment_status: 'paid',
        enrolled_at: new Date().toISOString(),
        payment_amount: paymentRecord.amount
      };
      const { error: enrollmentError } = await (supabaseAdmin as any)
        .from('batch_enrollments')
        .insert([enrollmentData]);

      if (enrollmentError) {
        console.error('Error creating enrollment:', enrollmentError);
        return NextResponse.json({ 
          error: 'Payment successful but enrollment failed',
          details: enrollmentError.message,
          code: enrollmentError.code
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and enrollment completed',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      receiptNumber: paymentRecord.receipt_number
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}