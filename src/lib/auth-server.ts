import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    const authorization = request.headers.get('authorization')
    let token = authorization?.replace('Bearer ', '')
    
    console.log('Auth header token:', token ? token.substring(0, 10) + '...' : 'none')
    
    // If no token in header, try to get from cookies using Next.js cookies API
    if (!token) {
      const cookieStore = await cookies()
      
      // Try different possible cookie names for Supabase auth
      const possibleCookieNames = [
        'sb-tykekszkohsdkhooqvxj-auth-token',
        'supabase-auth-token',
        'supabase.auth.token'
      ]
      
      for (const cookieName of possibleCookieNames) {
        const cookie = cookieStore.get(cookieName)
        if (cookie?.value) {
          try {
            const parsed = JSON.parse(cookie.value)
            token = parsed.access_token || parsed.token
            if (token) {
              console.log('Found token in cookie:', cookieName)
              break
            }
          } catch (e) {
            // Try raw cookie value
            token = cookie.value
            break
          }
        }
      }
    }
    
    if (!token) {
      console.log('No token found in headers or cookies')
      return { user: null, error: 'No authentication token found' }
    }

    // Verify the token with Supabase
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      console.log('Token verification failed:', error?.message)
      return { user: null, error: error?.message || 'Invalid token' }
    }
    
    console.log('Authentication successful for user:', user.id)
    return { user, error: null }
  } catch (error) {
    console.error('Authentication error:', error)
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    }
  }
}