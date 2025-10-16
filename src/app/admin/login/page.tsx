'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user, loading, signIn, isConnected } = useAuth()

  useEffect(() => {
    // Redirect if already logged in
    if (!loading && user) {
      console.log('User already logged in, redirecting...')
      router.push('/admin/dashboard')
    }
  }, [user, loading, router])

  const checkUserType = async (email: string) => {
    try {
      const response = await fetch('/api/auth/check-user-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking user type:', error);
      return { success: false, userType: null };
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setError('')

    try {
      console.log('Attempting admin login with:', email)
      
      // First check if user is an admin
      const userTypeCheck = await checkUserType(email);
      
      if (!userTypeCheck.success || userTypeCheck.userType !== 'admin') {
        setError('Access denied. This login is for the superadmin only. Please use the student login if you have a student account.');
        setLoginLoading(false);
        return;
      }
      
      const { success, error } = await signIn(email, password)

      if (!success && error) {
        console.error('Admin login error:', error)
        if (error.includes('Invalid login credentials')) {
          setError('Invalid admin credentials. Please check your email and password.');
        } else {
          setError(error || 'Admin login failed');
        }
      } else if (success) {
        console.log('Admin login successful, waiting for redirect...')
        // The redirect will happen automatically via useEffect when user state updates
      }
    } catch (err) {
      console.error('Admin login exception:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoginLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Superadmin Login</CardTitle>
          <CardDescription className="text-center">
            Access the JEE-NEET preparation admin dashboard
          </CardDescription>
          <div className="mt-4">
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loginLoading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginLoading || !isConnected}
            >
              {loginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loginLoading ? 'Signing in...' : !isConnected ? 'Connection Lost' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}