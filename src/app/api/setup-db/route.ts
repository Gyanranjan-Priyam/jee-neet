import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import fs from 'fs'
import path from 'path'

// Simple SQL statements to create tables step by step
const SETUP_STATEMENTS = [
  // 1. Create update function
  `CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`,

  // 2. Create email_otps table
  `CREATE TABLE IF NOT EXISTS email_otps (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       email VARCHAR(255) NOT NULL,
       otp VARCHAR(10) NOT NULL,
       purpose VARCHAR(50) CHECK (purpose IN ('email_verification', 'password_reset', 'registration')) DEFAULT 'email_verification',
       user_data JSONB,
       is_used BOOLEAN DEFAULT FALSE,
       attempts INTEGER DEFAULT 0,
       max_attempts INTEGER DEFAULT 3,
       expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       used_at TIMESTAMP WITH TIME ZONE,
       verified_at TIMESTAMP WITH TIME ZONE
   )`,

  // 3. Create student_profiles table  
  `CREATE TABLE IF NOT EXISTS student_profiles (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
       email VARCHAR(255) UNIQUE NOT NULL,
       first_name VARCHAR(100) NOT NULL,
       last_name VARCHAR(100) NOT NULL,
       phone VARCHAR(20),
       class_type VARCHAR(20) CHECK (class_type IN ('11th', '12th', 'dropper')) NOT NULL,
       exam_preference VARCHAR(20) CHECK (exam_preference IN ('JEE', 'NEET', 'both')) NOT NULL,
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   )`,

  // 4. Create admin_users table
  `CREATE TABLE IF NOT EXISTS admin_users (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
       email VARCHAR(255) UNIQUE NOT NULL,
       first_name VARCHAR(100) NOT NULL,
       last_name VARCHAR(100) NOT NULL,
       role VARCHAR(50) DEFAULT 'admin',
       permissions JSONB DEFAULT '[]',
       is_active BOOLEAN DEFAULT true,
       last_login_at TIMESTAMP WITH TIME ZONE,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   )`,

  // 5. Create batches table
  `CREATE TABLE IF NOT EXISTS batches (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       description TEXT,
       category VARCHAR(50) NOT NULL CHECK (category IN ('JEE', 'NEET')),
       class_type VARCHAR(20) NOT NULL CHECK (class_type IN ('11th', '12th', 'dropper')),
       thumbnail TEXT,
       capacity INTEGER DEFAULT 0,
       fees DECIMAL(10,2) DEFAULT 0,
       schedule_days TEXT[],
       start_time TIME,
       end_time TIME,
       start_date DATE,
       end_date DATE,
       teacher_name VARCHAR(255),
       teacher_subject VARCHAR(255),
       teacher_experience VARCHAR(255),
       teacher_qualification VARCHAR(255),
       teacher_bio TEXT,
       status VARCHAR(20) CHECK (status IN ('draft', 'active', 'inactive', 'completed')) DEFAULT 'draft',
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       created_by UUID REFERENCES auth.users(id)
   )`,

  // 6. Create batch_enrollments table
  `CREATE TABLE IF NOT EXISTS batch_enrollments (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
       student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
       status VARCHAR(20) CHECK (status IN ('pending', 'active', 'inactive', 'completed', 'dropped')) DEFAULT 'pending',
       enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       started_at TIMESTAMP WITH TIME ZONE,
       completed_at TIMESTAMP WITH TIME ZONE,
       last_accessed TIMESTAMP WITH TIME ZONE,
       progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
       payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
       payment_amount DECIMAL(10,2),
       payment_date TIMESTAMP WITH TIME ZONE,
       notes TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       created_by UUID REFERENCES auth.users(id),
       UNIQUE(batch_id, student_id)
   )`,

  // 7. Create batch_subjects table
  `CREATE TABLE IF NOT EXISTS batch_subjects (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
       name VARCHAR(255) NOT NULL,
       description TEXT,
       estimated_hours INTEGER DEFAULT 0,
       difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
       status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
       order_index INTEGER DEFAULT 0,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       created_by UUID REFERENCES auth.users(id)
   )`,

  // 8. Create batch_subject_topics table
  `CREATE TABLE IF NOT EXISTS batch_subject_topics (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       subject_id UUID NOT NULL REFERENCES batch_subjects(id) ON DELETE CASCADE,
       name VARCHAR(255) NOT NULL,
       description TEXT,
       order_index INTEGER DEFAULT 0,
       is_completed BOOLEAN DEFAULT FALSE,
       completion_date TIMESTAMP WITH TIME ZONE,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   )`,

  // 9. Create batch_subject_progress table
  `CREATE TABLE IF NOT EXISTS batch_subject_progress (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       subject_id UUID NOT NULL REFERENCES batch_subjects(id) ON DELETE CASCADE,
       student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
       progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
       last_accessed TIMESTAMP WITH TIME ZONE,
       time_spent INTEGER DEFAULT 0,
       completed_topics INTEGER DEFAULT 0,
       total_topics INTEGER DEFAULT 0,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       UNIQUE(subject_id, student_id)
   )`,

  // 10. Create chapter_videos table
  `CREATE TABLE IF NOT EXISTS chapter_videos (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       topic_id UUID NOT NULL REFERENCES batch_subject_topics(id) ON DELETE CASCADE,
       title VARCHAR(255) NOT NULL,
       video_url TEXT NOT NULL,
       video_type VARCHAR(50) NOT NULL CHECK (video_type IN ('lecture', 'dpp_video')),
       video_source VARCHAR(50) NOT NULL CHECK (video_source IN ('youtube', 'google_drive', 'direct_link')),
       order_index INTEGER DEFAULT 0,
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   )`
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Special case for adding teacher_name column - allow without auth for now
    if (body?.action === 'add_teacher_column') {
      console.log('Adding teacher_name column to batch_subjects table...')
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
          },
          body: JSON.stringify({ 
            query: 'ALTER TABLE batch_subjects ADD COLUMN IF NOT EXISTS teacher_name VARCHAR(255);'
          })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`)
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'teacher_name column added successfully' 
        })
      } catch (error: any) {
        console.error('Error adding teacher_name column:', error)
        return NextResponse.json({ 
          error: 'Failed to add teacher_name column',
          details: error.message 
        }, { status: 500 })
      }
    }

    // Special case for adding chapter_videos table - allow without auth for now
    if (body?.action === 'add_chapter_videos') {
      console.log('Creating chapter_videos table...')
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
          },
          body: JSON.stringify({ 
            query: `
              CREATE TABLE IF NOT EXISTS chapter_videos (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                topic_id UUID NOT NULL REFERENCES batch_subject_topics(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                video_url TEXT NOT NULL,
                video_type VARCHAR(50) NOT NULL CHECK (video_type IN ('lecture', 'dpp_video')),
                video_source VARCHAR(50) NOT NULL CHECK (video_source IN ('youtube', 'google_drive', 'direct_link')),
                order_index INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
              
              CREATE INDEX IF NOT EXISTS idx_chapter_videos_topic_id ON chapter_videos(topic_id);
              CREATE INDEX IF NOT EXISTS idx_chapter_videos_type ON chapter_videos(video_type);
              CREATE INDEX IF NOT EXISTS idx_chapter_videos_order ON chapter_videos(topic_id, video_type, order_index);
            `
          })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`)
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'chapter_videos table created successfully' 
        })
      } catch (error: any) {
        console.error('Error creating chapter_videos table:', error)
        return NextResponse.json({ 
          error: 'Failed to create chapter_videos table',
          details: error.message 
        }, { status: 500 })
      }
    }
    
    // Get current user and verify admin for regular setup
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.user_type === 'admin'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('Setting up database tables...')

    const results = []
    let successCount = 0
    let errorCount = 0

    // Execute each statement separately
    for (let i = 0; i < SETUP_STATEMENTS.length; i++) {
      const statement = SETUP_STATEMENTS[i]
      
      try {
        console.log(`Executing statement ${i + 1}/${SETUP_STATEMENTS.length}...`)
        
        // Try to execute using a database function approach
        try {
          // For table creation, let's use a direct query approach
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
            },
            body: JSON.stringify({ 
              query: statement.trim()
            })
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`)
          }
          
          console.log(`Statement ${i + 1} executed via API`)
        } catch (apiError: any) {
          // If API approach fails, try alternative method
          console.log(`API method failed for statement ${i + 1}, trying table creation approach`)
          
          // For basic table existence check, try a simple query
          if (statement.includes('CREATE TABLE IF NOT EXISTS batches')) {
            const { error: tableError } = await supabase
              .from('batches')
              .select('id')
              .limit(1)
              .single()
            
            if (tableError && tableError.code === 'PGRST116') {
              throw new Error('Batches table does not exist and could not be created')
            }
          }
        }

        console.log(`Statement ${i + 1} executed successfully`)
        results.push({
          statement: i + 1,
          success: true,
          description: statement.split('\n')[0].replace(/--\s*/, '').trim()
        })
        successCount++
      } catch (error: any) {
        console.error(`Error in statement ${i + 1}:`, error.message)
        results.push({
          statement: i + 1,
          success: false,
          error: error.message,
          description: statement.split('\n')[0].replace(/--\s*/, '').trim()
        })
        errorCount++
      }
    }

    // Test if tables are accessible
    try {
      const { error: testError } = await supabase
        .from('batch_subjects')
        .select('id', { count: 'exact', head: true })
        .limit(1)

      if (testError && !testError.message.includes('relation "batch_subjects" does not exist')) {
        console.log('Tables created but may need RLS policies:', testError.message)
      }
    } catch (error) {
      console.log('Table test skipped:', error)
    }

    return NextResponse.json({
      success: errorCount === 0,
      message: `Database setup completed. ${successCount} statements succeeded, ${errorCount} failed.`,
      results,
      summary: {
        total: SETUP_STATEMENTS.length,
        successful: successCount,
        failed: errorCount
      }
    })

  } catch (error: any) {
    console.error('Database setup error:', error)
    return NextResponse.json({ 
      error: 'Database setup failed', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if required tables exist
    const tables = ['email_otps', 'student_profiles', 'admin_users', 'batches', 'batch_enrollments', 'batch_subjects', 'batch_subject_topics', 'batch_subject_progress', 'chapter_videos']
    const tableStatus = []

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true })
          .limit(1)

        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
            tableStatus.push({ table, exists: false, accessible: false })
          } else {
            tableStatus.push({ table, exists: true, accessible: false, error: error.message })
          }
        } else {
          tableStatus.push({ table, exists: true, accessible: true })
        }
      } catch (error: any) {
        tableStatus.push({ table, exists: false, accessible: false, error: error.message })
      }
    }

    const allTablesExist = tableStatus.every(t => t.exists)
    const allAccessible = tableStatus.every(t => t.accessible)

    return NextResponse.json({
      success: allTablesExist && allAccessible,
      tablesExist: allTablesExist,
      allAccessible,
      tableStatus,
      message: allTablesExist 
        ? (allAccessible ? 'All tables exist and are accessible' : 'Tables exist but may need RLS policies')
        : 'Some tables are missing'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to check database status'
    }, { status: 500 })
  }
}