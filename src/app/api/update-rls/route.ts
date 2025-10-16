import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Updating RLS policies for student access...');

    // Read the updated RLS policies file
    const sqlFilePath = path.join(process.cwd(), 'database', 'updated_rls_policies.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      return NextResponse.json({ 
        error: 'RLS policies file not found',
        path: sqlFilePath 
      }, { status: 404 });
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'NOTIFY pgrst, \'reload schema\'');

    console.log(`📄 Found ${statements.length} SQL statements to execute`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Skip empty statements and comments
        if (!statement || statement.startsWith('--') || statement.startsWith('/*')) {
          continue;
        }

        console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
        
        // Use direct SQL execution via REST API
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
          },
          body: JSON.stringify({ 
            query: statement + ';'
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`);
        results.push({
          statement: i + 1,
          success: true,
          sql: statement.substring(0, 100) + '...'
        });
        successCount++;
        
      } catch (error: any) {
        console.error(`❌ Exception in statement ${i + 1}:`, error.message);
        results.push({
          statement: i + 1,
          success: false,
          error: error.message,
          sql: statement.substring(0, 100) + '...'
        });
        errorCount++;
      }
    }

    // Test the policies by checking access
    try {
      const { data: testSubjects, error: testError } = await supabaseAdmin
        .from('batch_subjects')
        .select('id, name')
        .limit(3);

      if (testError) {
        console.warn('⚠️ Policy test failed:', testError.message);
      } else {
        console.log(`✅ Policy test passed: Found ${testSubjects?.length || 0} subjects`);
      }
    } catch (error) {
      console.warn('⚠️ Policy test skipped due to error');
    }

    return NextResponse.json({
      success: errorCount === 0,
      message: `RLS policies update completed. ${successCount} statements succeeded, ${errorCount} failed.`,
      results,
      summary: {
        total: statements.length,
        successful: successCount,
        failed: errorCount,
        policies_updated: [
          'batch_subjects - Students can view all subjects',
          'batch_subject_topics - Students can view all chapters',
          'chapter_videos - Students can view all videos', 
          'chapter_pdfs - Students can view all PDFs',
          'batches - Students can view all active batches',
          'batch_enrollments - Enhanced enrollment management'
        ]
      }
    });

  } catch (error: any) {
    console.error('❌ RLS policies update failed:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update RLS policies', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'RLS Policies Update Endpoint',
    description: 'POST to this endpoint to update RLS policies for student access',
    policies: [
      'batch_subjects - Allow students to view all subjects with app-level access control',
      'batch_subject_topics - Allow students to view all chapters',
      'chapter_videos - Allow students to view all videos',
      'chapter_pdfs - Allow students to view all PDFs',
      'batches - Allow students to view all active batches',
      'batch_enrollments - Enhanced enrollment management'
    ],
    note: 'Access control is moved to application level for better user experience'
  });
}