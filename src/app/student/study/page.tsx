'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen,
  Calendar,
  Brain,
  GraduationCap,
  User,
  Play,
  FileText,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SidebarProvider, MinimalSidebar, studentNavItems } from '@/components/minimal-sidebar';
import { PageLoadingIndicator } from '@/components/professional-loading-indicator';
import { useAuth } from '@/lib/auth-provider';
import { toast } from 'sonner';
import Link from 'next/link';

interface EnrolledBatch {
  id: string;
  name: string;
  title: string;
  description: string;
  fees: number;
  class_type: string;
  category: string;
  image_url?: string;
  thumbnail?: string;
  status: string;
  start_date: string;
  end_date: string;
  enrollment_id: string;
  enrolled_at: string;
  payment_amount: number;
  progress_percentage: number;
}

export default function StudyPage() {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [enrolledBatches, setEnrolledBatches] = useState<EnrolledBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/student/login');
      return;
    }

    if (user && user.user_metadata?.user_type !== 'student') {
      toast.error('Access denied. Student access required.');
      router.push('/student/login');
      return;
    }

    if (user) {
      setProfileData({
        firstName: user.user_metadata?.first_name || user.email?.split('@')[0] || 'Student',
        lastName: user.user_metadata?.last_name || '',
        email: user.email,
        classType: user.user_metadata?.class_type || '12th',
        examPreference: user.user_metadata?.exam_preference || 'JEE',
      });
      
      // Fetch enrolled batches
      fetchEnrolledBatches();
    }
  }, [user, loading, router]);

  const fetchEnrolledBatches = async () => {
    try {
      const response = await fetch('/api/student/enrolled-batches', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEnrolledBatches(data.batches || []);
      } else {
        toast.error('Failed to load enrolled batches');
      }
    } catch (error) {
      console.error('Error fetching enrolled batches:', error);
      toast.error('Error loading enrolled batches');
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/student/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  if (loading) {
    return <PageLoadingIndicator text="Loading study materials..." />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <MinimalSidebar
          user={{
            name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student",
            email: user?.email || "student@example.com",
            avatar: user?.user_metadata?.avatar_url
          }}
          navItems={studentNavItems}
          onLogout={handleSignOut}
          type="student"
        />
        
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">My Study Dashboard</h1>
              <p className="text-gray-600">Continue your learning journey</p>
            </div>

            <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{enrolledBatches.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {enrolledBatches.length > 0 
                        ? Math.round(enrolledBatches.reduce((acc, batch) => acc + batch.progress_percentage, 0) / enrolledBatches.length)
                        : 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Invested</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{enrolledBatches.reduce((acc, batch) => acc + batch.payment_amount, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrolled Batches */}
          {loadingBatches ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : enrolledBatches.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Enrolled Courses</h3>
                <p className="text-gray-500 mb-4">
                  You haven't enrolled in any courses yet.
                  <br />
                  Browse and enroll in courses to start your learning journey.
                </p>
                <Button onClick={() => router.push('/student/batches')}>
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Your Enrolled Courses</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {enrolledBatches.map((batch) => (
                  <Card key={batch.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                            {batch.title || batch.name}
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${getStatusColor(batch.status)}`}>
                              {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                            </span>
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600">
                            {batch.category} • {batch.class_type}
                          </CardDescription>
                        </div>
                        {batch.image_url && (
                          <img 
                            src={batch.image_url} 
                            alt={batch.title}
                            className="w-16 h-16 rounded-lg object-cover ml-4"
                          />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{batch.progress_percentage}%</span>
                        </div>
                        <Progress 
                          value={batch.progress_percentage} 
                          className="h-2"
                        />
                      </div>

                      {/* Course Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Enrolled</p>
                          <p className="font-medium">
                            {new Date(batch.enrolled_at).toDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Paid Amount</p>
                          <p className="font-medium">₹{batch.payment_amount}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/student/batches/${batch.id}`} className="flex-1">
                          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                            <Play className="w-4 h-4 mr-2" />
                            Continue Learning
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => toast.info('Course materials accessible from subject pages')}>
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}