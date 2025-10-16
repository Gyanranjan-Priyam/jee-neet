'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isConnected: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  testConnection: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(true)
  
  const supabase = createClient()

  // Test connection function
  const testConnection = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.getSession()
      if (error) throw error
      setIsConnected(true)
      return true
    } catch (error) {
      console.error('Connection test failed:', error)
      setIsConnected(false)
      return false
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        setSession(session)
        setUser(session?.user ?? null)
        setIsConnected(true)
      } catch (error) {
        console.error('Failed to get initial session:', error)
        setIsConnected(false)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        setIsConnected(true) // If we receive auth events, connection is working
      }
    )

    // Test connection periodically
    const connectionInterval = setInterval(() => {
      testConnection()
    }, 30000) // Every 30 seconds

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('Network back online')
      testConnection()
    }
    
    const handleOffline = () => {
      console.log('Network went offline')
      setIsConnected(false)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }

    return () => {
      subscription.unsubscribe()
      clearInterval(connectionInterval)
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      // Test connection first
      const connected = await testConnection()
      if (!connected) {
        return { success: false, error: 'Connection failed. Please check your internet connection.' }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      })
      
      if (error) {
        console.error('Sign in error:', error)
        const errorMessage = error.message || 'Login failed'
        toast.error(`Login failed: ${errorMessage}`)
        return { success: false, error: errorMessage }
      }
      
      if (data.user) {
        const userType = data.user.user_metadata?.user_type || 'unknown'
        console.log('Sign in successful:', data.user.email, 'User type:', userType)
        
        // Show appropriate welcome message based on user type
        if (userType === 'admin') {
          toast.success(`Welcome back, Admin!`)
        } else if (userType === 'student') {
          toast.success(`Welcome back, ${data.user.user_metadata?.first_name || data.user.email}!`)
        } else {
          toast.success(`Welcome back, ${data.user.email}!`)
        }
        
        return { success: true }
      }
      
      return { success: false, error: 'Login failed - no user data received' }
    } catch (error: any) {
      console.error('Sign in exception:', error)
      const errorMessage = error.message || 'An unexpected error occurred'
      return { success: false, error: errorMessage }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
      toast.error(`Logout failed: ${error.message}`)
    } else {
      toast.success('Logged out successfully!')
    }
  }

  const value = {
    user,
    session,
    loading,
    isConnected,
    signIn,
    signOut,
    testConnection
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}