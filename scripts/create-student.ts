#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function createStudent() {
  console.log('\n🎓 JEE-NEET Student User Setup\n')

  try {
    // Get student details
    const email = await question('📧 Enter student email: ')
    const password = await question('🔑 Enter student password (min 6 chars): ')
    const confirmPassword = await question('🔑 Confirm password: ')

    // Validate inputs
    if (!email || !email.includes('@')) {
      console.error('❌ Please provide a valid email address')
      process.exit(1)
    }

    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters long')
      process.exit(1)
    }

    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match')
      process.exit(1)
    }

    console.log('\n⏳ Creating student user...')

    // Create the student user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        user_type: 'student',
        role: 'student',
        created_by: 'setup-script'
      }
    })

    if (authError) {
      console.error('❌ Error creating student user:', authError.message)
      process.exit(1)
    }

    console.log('✅ Student user created successfully!')
    console.log('📧 Email:', authData.user?.email)
    console.log('🆔 User ID:', authData.user?.id)
    console.log('👤 User Type:', authData.user?.user_metadata?.user_type)
    console.log('🔰 Role:', authData.user?.user_metadata?.role)

    // Try to create student profile entry
    try {
      const { error: profileError } = await supabase
        .from('student_profiles')
        .insert({
          user_id: authData.user?.id,
          email: email,
          name: email.split('@')[0], // Use email prefix as name
          class_type: '11th', // Default class
          stream: 'Science', // Default stream
          phone: null,
          is_active: true,
          created_at: new Date().toISOString()
        })

      if (profileError) {
        console.log('ℹ️  Student profiles table not found or accessible (this is optional)')
        console.log('Error:', profileError.message)
      } else {
        console.log('✅ Student profile created in student_profiles table')
      }
    } catch (error) {
      console.log('ℹ️  Skipped student_profiles table (table may not exist)')
    }

    console.log('\n🎉 Setup complete! You can now login with:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: [the password you entered]`)
    console.log('\n🌐 Navigate to: http://localhost:3000/auth/login')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Run the script
createStudent().catch(console.error)