'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Mail, Lock, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-provider';

interface LoginFormData {
  email: string;
  password: string;
}

export default function StudentLoginPage() {
  const router = useRouter();
  const { signIn, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      const userType = user.user_metadata?.user_type;
      if (userType === 'admin') {
        router.push('/admin/dashboard');
      } else if (userType === 'student') {
        router.push('/student/dashboard');
      }
    }
  }, [user, authLoading, router]);

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

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      // First check if user exists and their type
      const userTypeCheck = await checkUserType(data.email);
      
      if (!userTypeCheck.success) {
        toast.error('Account not found. Please register first.');
        setLoading(false);
        return;
      }

      if (userTypeCheck.userType === 'admin') {
        toast.error('This is a student login page. Please use the admin portal.');
        setLoading(false);
        return;
      }

      if (userTypeCheck.userType !== 'student') {
        toast.error('Account not found. Please register as a student first.');
        setLoading(false);
        return;
      }

      // Attempt to sign in
      const result = await signIn(data.email, data.password);
      
      if (result.success) {
        // Success toast will be shown by the auth provider
        router.push('/student/dashboard');
      } else {
        toast.error(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <LogIn className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your student account to continue your JEE & NEET preparation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
                placeholder="Enter your email address"
                className="h-11"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  placeholder="Enter your password"
                  className="h-11 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/student/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* Register Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => router.push('/student/register')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create New Account
            </Button>

            {/* Admin Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Are you an administrator?{' '}
                <Link
                  href="/admin/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Admin Login
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}