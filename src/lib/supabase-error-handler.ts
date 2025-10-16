import { AuthRetryableFetchError, AuthError } from '@supabase/supabase-js'
import { toast } from 'sonner'

export interface SupabaseErrorHandler {
  handleAuthError: (error: any) => void
  handleConnectionError: (error: any) => boolean
  isRetryableError: (error: any) => boolean
  getErrorMessage: (error: any) => string
}

export const supabaseErrorHandler: SupabaseErrorHandler = {
  handleAuthError: (error: any) => {
    console.error('Supabase Auth Error:', error)
    
    if (error instanceof AuthRetryableFetchError) {
      toast.error('Connection failed. Please check your internet connection and try again.')
      return
    }
    
    if (error instanceof AuthError) {
      switch (error.message) {
        case 'Invalid login credentials':
          toast.error('Invalid email or password. Please try again.')
          break
        case 'Email not confirmed':
          toast.error('Please check your email and click the confirmation link.')
          break
        case 'Too many requests':
          toast.error('Too many attempts. Please wait a moment before trying again.')
          break
        default:
          toast.error(`Authentication error: ${error.message}`)
      }
      return
    }
    
    // Handle network/connection errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      toast.error('Network connection failed. Please check your internet connection.')
      return
    }
    
    // Generic error handling
    toast.error('An unexpected error occurred. Please try again.')
  },

  handleConnectionError: (error: any): boolean => {
    console.error('Supabase Connection Error:', error)
    
    // Check if it's a retryable error
    if (supabaseErrorHandler.isRetryableError(error)) {
      toast.error('Connection issue detected. Retrying...')
      return true // Indicates the error is retryable
    }
    
    // Non-retryable error
    const message = supabaseErrorHandler.getErrorMessage(error)
    toast.error(message)
    return false // Indicates the error is not retryable
  },

  isRetryableError: (error: any): boolean => {
    if (error instanceof AuthRetryableFetchError) {
      return true
    }
    
    const retryableMessages = [
      'Failed to fetch',
      'NetworkError',
      'timeout',
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
      'Connection failed',
      'Request timeout'
    ]
    
    const errorMessage = error?.message?.toLowerCase() || ''
    return retryableMessages.some(msg => errorMessage.includes(msg.toLowerCase()))
  },

  getErrorMessage: (error: any): string => {
    if (error instanceof AuthRetryableFetchError) {
      return 'Connection failed. Please check your internet connection and try again.'
    }
    
    if (error instanceof AuthError) {
      return `Authentication error: ${error.message}`
    }
    
    if (error?.message) {
      // Network errors
      if (error.message.includes('Failed to fetch')) {
        return 'Unable to connect to the server. Please check your internet connection.'
      }
      
      if (error.message.includes('NetworkError')) {
        return 'Network error occurred. Please try again.'
      }
      
      return error.message
    }
    
    return 'An unexpected error occurred. Please try again.'
  }
}

// Retry utility function
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry if it's not a retryable error
      if (!supabaseErrorHandler.isRetryableError(error)) {
        throw error
      }
      
      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delayMs}ms`)
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
      }
    }
  }
  
  throw lastError
}

// Connection test utility
export const testSupabaseConnection = async () => {
  try {
    const { createClient } = await import('./supabase')
    const supabase = createClient()
    
    // Simple health check
    const { data, error } = await supabase
      .from('student_profiles')
      .select('count')
      .limit(1)
      .single()
    
    if (error && !error.message.includes('JSON object requested')) {
      throw error
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    supabaseErrorHandler.handleConnectionError(error)
    return false
  }
}