'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  GraduationCap, 
  User, 
  Users,
  Clock,
  BookOpen,
  Filter,
  Search
} from 'lucide-react';

import { SidebarProvider, MinimalSidebar, studentNavItems } from '@/components/minimal-sidebar';
import { PageLoadingIndicator, InlineLoadingIndicator } from '@/components/professional-loading-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-provider';
import { toast } from 'sonner';
import Link from 'next/link';

interface Batch {
  id: string;
  title: string;
  description: string;
  instructor: string;
  students_count: number;
  start_date: string;
  end_date: string;
  status: string;
  subjects: string[];
  batch_type: string;
  exam_focus: string;
  image_url?: string;
  capacity?: number;
  fees?: number;
  isEnrolled?: boolean;
  enrollmentId?: string;
  class_level?: string;
  stream?: string;
  duration?: string;
  // Database fields
  class_type?: string;
  category?: string;
  name?: string;
  teacher_name?: string;
  thumbnail?: string;
}

interface StudentProfile {
  class_level: string;
  stream: string;
  user_id: string;
}

export default function AllBatchesPage() {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'enrolled' | 'available' | 'my-class'>('my-class');
  const [selectedExamFocus, setSelectedExamFocus] = useState<string>('all');
  const [enrolledBatchIds, setEnrolledBatchIds] = useState<Set<string>>(new Set());

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
      fetchStudentProfile();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (studentProfile) {
      fetchBatches();
    }
  }, [studentProfile]);

  useEffect(() => {
    applyFilters();
  }, [batches, searchTerm, selectedFilter, selectedExamFocus, enrolledBatchIds]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/student/login');
  };

  const fetchStudentProfile = async () => {
    try {
      const response = await fetch('/api/student/profile');
      if (response.ok) {
        const data = await response.json();
        setStudentProfile(data.profile);
      } else {
        toast.error('Failed to load student profile');
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      toast.error('Failed to fetch student profile');
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches');
      if (!response.ok) {
        toast.error('Failed to load batches');
        return;
      }
      
      const data = await response.json();
      const allBatches = data.batches || [];
      
      // Fetch enrollment status
      if (allBatches.length > 0) {
        const batchIds = allBatches.map((batch: Batch) => batch.id);
        try {
          const enrollmentResponse = await fetch('/api/student/enrollment-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ batchIds }),
          });
          
          if (enrollmentResponse.ok) {
            const enrollmentData = await enrollmentResponse.json();
            const enrollmentStatus = enrollmentData.enrollmentStatus || {};
            const enrolledBatchIds = Object.keys(enrollmentStatus).filter(
              batchId => enrollmentStatus[batchId]?.isEnrolled
            );
            const enrolledSet = new Set<string>(enrolledBatchIds);
            setEnrolledBatchIds(enrolledSet);
            
            const batchesWithEnrollment = allBatches.map((batch: Batch) => ({
              ...batch,
              isEnrolled: enrolledSet.has(batch.id),
            }));
            
            setBatches(batchesWithEnrollment);
          } else {
            setBatches(allBatches);
          }
        } catch (enrollmentError) {
          console.error('Error fetching enrollment status:', enrollmentError);
          setBatches(allBatches);
        }
      } else {
        setBatches(allBatches);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to fetch batches');
    } finally {
      setLoadingBatches(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...batches];

    // Filter by student's class and stream first
    if (selectedFilter === 'my-class' && studentProfile) {
      filtered = filtered.filter(batch => {
        // Map database fields to match student profile
        const classMatch = !batch.class_type || batch.class_type === studentProfile.class_level;
        const streamMatch = !batch.category || batch.category === studentProfile.stream;
        return classMatch && streamMatch;
      });
    }

    // Filter by enrollment status
    if (selectedFilter === 'enrolled') {
      filtered = filtered.filter(batch => batch.isEnrolled);
    } else if (selectedFilter === 'available') {
      filtered = filtered.filter(batch => !batch.isEnrolled);
    }

    // Filter by exam focus
    if (selectedExamFocus !== 'all') {
      filtered = filtered.filter(batch => 
        batch.exam_focus === selectedExamFocus || batch.category === selectedExamFocus
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(batch =>
        batch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredBatches(filtered);
  };

  const getUniqueExamFocuses = () => {
    const examFocuses = batches.map(batch => batch.exam_focus || batch.category).filter(Boolean);
    return [...new Set(examFocuses)];
  };

  if (loading) {
    return <PageLoadingIndicator text="Loading your batches..." />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <MinimalSidebar
          user={{
            name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student",
            email: user?.email || "student@example.com",
          }}
          navItems={studentNavItems}
          onLogout={handleSignOut}
          type="student"
        />
        <div className="flex-1 overflow-auto">
        <div className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <h1 className="text-xl font-semibold">All Batches</h1>
          {studentProfile && (
            <Badge variant="secondary" className="ml-auto">
              Class {studentProfile.class_level} • {studentProfile.stream}
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search batches, instructors, subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedFilter} onValueChange={(value: any) => setSelectedFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="my-class">My Class Batches</SelectItem>
                  <SelectItem value="all">All Batches</SelectItem>
                  <SelectItem value="enrolled">My Enrolled</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedExamFocus} onValueChange={setSelectedExamFocus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  {getUniqueExamFocuses().map((examFocus) => (
                    <SelectItem key={examFocus} value={examFocus!}>
                      {examFocus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>
              Showing {filteredBatches.length} of {batches.length} batches
              {selectedFilter === 'my-class' && studentProfile && (
                <span className="ml-2 text-blue-600">
                  (filtered for Class {studentProfile.class_level} {studentProfile.stream})
                </span>
              )}
            </span>
          </div>

          {/* Batches Grid */}
          {loadingBatches ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
              <p className="text-gray-600 max-w-md">
                {searchTerm ? 
                  "Try adjusting your search or filters to find more batches." :
                  "No batches are available for your class and stream at the moment."
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBatches.map((batch) => (
                <Card key={batch.id} className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{batch.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {batch.description}
                        </CardDescription>
                      </div>
                      {batch.isEnrolled && (
                        <Badge variant="default" className="ml-2 bg-green-100 text-green-800">
                          Enrolled
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {batch.image_url && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={batch.image_url} 
                          alt={batch.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Instructor: {batch.instructor}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <GraduationCap className="h-4 w-4" />
                        <span>{batch.exam_focus} • {batch.batch_type}</span>
                      </div>
                      
                      {(batch.class_type || batch.category) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BookOpen className="h-4 w-4" />
                          <span>
                            {batch.class_type && `Class ${batch.class_type}`}
                            {batch.class_type && batch.category && ' • '}
                            {batch.category}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{batch.students_count} students enrolled</span>
                        {batch.capacity && (
                          <span className="text-gray-400">/ {batch.capacity}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Starts: {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : 'TBD'}
                        </span>
                      </div>
                      
                      {batch.duration && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Duration: {batch.duration}</span>
                        </div>
                      )}
                    </div>

                    {/* Subjects */}
                    {batch.subjects && batch.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {batch.subjects.slice(0, 3).map((subject, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {batch.subjects.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{batch.subjects.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/student/batches/${batch.id}`} className="flex-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                        >
                          View Details
                        </Button>
                      </Link>
                      
                      {batch.isEnrolled ? (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => router.push(`/student/study?batch=${batch.id}`)}
                        >
                          Continue Learning
                        </Button>
                      ) : (
                        <Link href={`/student/checkout/${batch.id}`} className="flex-1">
                          <Button 
                            size="sm" 
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {batch.fees ? `Enroll ₹${batch.fees}` : 'Enroll Now'}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </SidebarProvider>
  );
}