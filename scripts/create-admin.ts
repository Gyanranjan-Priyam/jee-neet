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

async function createAdmin() {
  console.log('\n🚀 JEE-NEET Admin User Setup\n')

  try {
    // Get admin details
    const email = await question('📧 Enter admin email: ')
    const password = await question('🔑 Enter admin password (min 6 chars): ')
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

    console.log('\n⏳ Creating admin user...')

    // Create the admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        user_type: 'admin',
        role: 'superadmin',
        created_by: 'setup-script'
      }
    })

    if (authError) {
      console.error('❌ Error creating admin user:', authError.message)
      process.exit(1)
    }

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', authData.user?.email)
    console.log('🆔 User ID:', authData.user?.id)
    console.log('👤 User Type:', authData.user?.user_metadata?.user_type)
    console.log('🔰 Role:', authData.user?.user_metadata?.role)

    // Optionally create admin_users table entry (if table exists)
    try {
      const { error: tableError } = await supabase
        .from('admin_users')
        .insert({
          user_id: authData.user?.id,
          email: email,
          role: 'superadmin',
          is_active: true,
          created_at: new Date().toISOString()
        })

      if (tableError) {
        console.log('ℹ️  Admin users table not found or accessible (this is optional)')
      } else {
        console.log('✅ Admin entry added to admin_users table')
      }
    } catch (error) {
      console.log('ℹ️  Skipped admin_users table (table may not exist)')
    }

    console.log('\n🎉 Setup complete! You can now login with:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: [the password you entered]`)
    console.log('\n🌐 Navigate to: http://localhost:3001/admin/login')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Run the script
createAdmin().catch(console.error)