import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Try to access batches table
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Batches table exists and is accessible',
      data
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      type: 'catch_error'
    }, { status: 500 })
  }
}