"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { SidebarProvider, MinimalSidebar, studentNavItems } from "@/components/minimal-sidebar";
import { PageLoadingIndicator } from "@/components/professional-loading-indicator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  BookOpen,
  Clock,
  GraduationCap,
  User,
  CheckCircle,
  PlayCircle,
  FileText,
  Lock,
  Target,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface SubjectDetails {
  id: string;
  batch_id: string;
  name: string;
  description?: string;
  teacher_name?: string;
  status: "not_started" | "in_progress" | "completed";
  estimated_hours?: number;
  difficulty?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  topics?: Topic[];
  total_topics: number;
  is_locked: boolean;
  access_message?: string;
  progress?: SubjectProgress;
}

interface Topic {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  is_completed: boolean;
  completion_date?: string;
  is_locked?: boolean;
  access_message?: string;
}

interface SubjectProgress {
  progress_percentage: number;
  last_accessed?: string;
  time_spent: number;
  completed_topics: number;
  total_topics: number;
}

interface BatchInfo {
  id: string;
  name: string;
  category: string;
  class_type: string;
}

export default function StudentSubjectViewPage() {
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<SubjectDetails | null>(null);
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [chapters, setChapters] = useState<Topic[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;
  const subjectId = params.subjectId as string;
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/student/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (batchId && subjectId && user) {
      Promise.all([
        fetchSubjectData(),
        fetchBatchInfo(),
        fetchChapters()
      ]);
    }
  }, [batchId, subjectId, user]);

  const fetchBatchInfo = async () => {
    try {
      const response = await fetch(`/api/batches/${batchId}`);
      if (response.ok) {
        const data = await response.json();
        setBatchInfo(data.batch);
      }
    } catch (error) {
      console.error('Error fetching batch info:', error);
    }
  };

  const fetchChapters = async () => {
    try {
      setChaptersLoading(true);
      const response = await fetch(`/api/batches/${batchId}/subjects/${subjectId}/chapters`);
      
      if (response.ok) {
        const data = await response.json();
        setChapters(data.chapters || []);
      } else {
        console.error('Failed to fetch chapters:', response.status);
        setChapters([]);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setChapters([]);
    } finally {
      setChaptersLoading(false);
    }
  };

  const fetchSubjectData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/batches/${batchId}/subjects`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subject data');
      }
      
      const data = await response.json();
      const subjects = data.subjects || [];
      const subjectData = subjects.find((s: SubjectDetails) => s.id === subjectId);
      
      if (!subjectData) {
        throw new Error('Subject not found');
      }
      
      setSubject(subjectData);
      
    } catch (error) {
      console.error('Error fetching subject:', error);
      toast.error('Failed to fetch subject data');
      router.push(`/student/batches/${batchId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/student/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "not_started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (authLoading || loading) {
    return <PageLoadingIndicator text="Loading subject details..." />;
  }

  if (!subject) {
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
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Subject not found</h2>
              <p className="text-gray-600 mb-4">The subject you're looking for doesn't exist.</p>
              <Link href={`/student/batches/${batchId}`}>
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Batch
                </Button>
              </Link>
            </div>
          </div>
          </div>
        </div>
      </SidebarProvider>
    );
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
          <Link href={`/student/batches/${batchId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Batch
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">{subject.name}</h1>
          {batchInfo && (
            <span className="text-sm text-gray-500">
              • {batchInfo.name}
            </span>
          )}
        </div>
        
        <div className="flex-1 p-6">
          {/* Subject Access Check */}
          {subject.is_locked && (
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <Lock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Access Restricted:</strong> {subject.access_message || 'You need to enroll in this batch to access this subject.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Subject Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    {subject.name}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {subject.description || "Comprehensive study material and resources for this subject"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(subject.status)}>
                    {subject.status.replace("_", " ").charAt(0).toUpperCase() + subject.status.replace("_", " ").slice(1)}
                  </Badge>
                  {subject.difficulty && (
                    <Badge className={getDifficultyColor(subject.difficulty)}>
                      {subject.difficulty.charAt(0).toUpperCase() + subject.difficulty.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subject.teacher_name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Teacher:</strong> {subject.teacher_name}
                    </span>
                  </div>
                )}
                
                {subject.estimated_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Duration:</strong> {subject.estimated_hours}h estimated
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Topics:</strong> {chapters.length} chapters
                  </span>
                </div>
              </div>

              {/* Progress Section - Only for enrolled students */}
              {!subject.is_locked && subject.progress && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Your Progress
                    </h4>
                    <span className="text-sm text-gray-600">
                      {subject.progress.completed_topics}/{subject.progress.total_topics} topics completed
                    </span>
                  </div>
                  <Progress value={subject.progress.progress_percentage} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{subject.progress.progress_percentage}% complete</span>
                    {subject.progress.time_spent > 0 && (
                      <span>Time spent: {formatTime(subject.progress.time_spent)}</span>
                    )}
                  </div>
                  {subject.progress.last_accessed && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last accessed: {new Date(subject.progress.last_accessed).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subject Content */}
          {subject.is_locked ? (
            <Card>
              <CardContent className="text-center py-12">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Subject Locked</h3>
                <p className="text-gray-600 mb-4">
                  Enroll in this batch to access all study materials, videos, and resources for this subject.
                </p>
                <Link href={`/student/checkout/${batchId}`}>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Enroll in Batch
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Topics/Chapters List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Chapters & Topics
                  </CardTitle>
                  <CardDescription>
                    Study materials organized by chapters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {chaptersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
                      <span>Loading chapters...</span>
                    </div>
                  ) : chapters && chapters.length > 0 ? (
                    <div className="space-y-3">
                      {chapters.map((chapter, index) => (
                        <div 
                          key={chapter.id}
                          className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                            chapter.is_locked 
                              ? 'bg-gray-50 cursor-not-allowed' 
                              : 'hover:bg-gray-50 cursor-pointer'
                          }`}
                          onClick={() => {
                            if (!chapter.is_locked) {
                              router.push(`/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapter.id}`);
                            } else {
                              toast.error(chapter.access_message || 'Please enroll to access this chapter');
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                              chapter.is_locked 
                                ? 'bg-gray-200 text-gray-500' 
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className={`font-medium ${chapter.is_locked ? 'text-gray-500' : 'text-gray-900'}`}>
                                {chapter.name}
                                {chapter.is_locked && <Lock className="inline-block h-4 w-4 ml-2 text-gray-400" />}
                              </h4>
                              {chapter.description && (
                                <p className={`text-sm ${chapter.is_locked ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {chapter.description}
                                </p>
                              )}
                              {chapter.is_locked && chapter.access_message && (
                                <p className="text-xs text-amber-600 mt-1">
                                  {chapter.access_message}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {chapter.is_completed ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">Completed</span>
                              </div>
                            ) : chapter.is_locked ? (
                              <Button size="sm" variant="outline" disabled className="text-gray-400">
                                <Lock className="h-4 w-4 mr-1" />
                                Locked
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline">
                                <PlayCircle className="h-4 w-4 mr-1" />
                                Study
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No chapters available</h3>
                      <p className="text-gray-600">
                        Your instructor hasn't added any chapters to this subject yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Study Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Study Resources
                  </CardTitle>
                  <CardDescription>
                    Additional materials and resources for this subject
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Resources Coming Soon</h3>
                    <p className="text-gray-600">
                      Study guides, practice tests, and additional materials will be available here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}