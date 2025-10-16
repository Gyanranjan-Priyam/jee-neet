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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Clock, 
  GraduationCap,
  BookOpen,
  FolderOpen,
  Megaphone,
  User,
  TrendingUp,
  Lock,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { StudentBatchSubjects } from "@/components/student-batch-subjects";

interface BatchDetails {
  id: string;
  name: string;
  description?: string;
  category: "JEE" | "NEET";
  class_type: "11th" | "12th" | "Dropper";
  thumbnail?: string;
  capacity: number;
  current_students: number;
  fees: number;
  status: "active" | "inactive" | "full";
  schedule_days: string[];
  start_time?: string;
  end_time?: string;
  start_date?: string;
  end_date?: string;
  teacher_name?: string;
  teacher_subject?: string;
  teacher_experience?: string;
  teacher_qualification?: string;
  teacher_bio?: string;
  created_at: string;
  updated_at: string;
}

interface EnrollmentStatus {
  isEnrolled: boolean;
  status?: string;
  paymentStatus?: string;
  enrolledAt?: string;
  paidAmount?: number;
}

export default function StudentBatchViewPage() {
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<BatchDetails | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>({ isEnrolled: false });
  const [activeTab, setActiveTab] = useState("details");
  
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/student/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (batchId && user) {
      Promise.all([
        fetchBatchData(),
        fetchEnrollmentStatus()
      ]);
    }
  }, [batchId, user]);

  const fetchBatchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/batches/${batchId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch batch data');
      }
      
      const data = await response.json();
      setBatch(data.batch);
      
    } catch (error) {
      console.error('Error fetching batch:', error);
      toast.error('Failed to fetch batch data');
      router.push('/student/batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentStatus = async () => {
    try {
      const response = await fetch('/api/student/enrollment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batchIds: [batchId] }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const status = data.enrollmentStatus?.[batchId];
        if (status) {
          setEnrollmentStatus(status);
        }
      }
    } catch (error) {
      console.error('Error fetching enrollment status:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/student/login");
  };

  const handleEnrollNow = () => {
    if (!batch) return;
    router.push(`/student/checkout/${batch.id}`);
  };

  const handleContinueLearning = () => {
    if (!batch) return;
    router.push(`/student/study?batch=${batch.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "full":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (authLoading || loading) {
    return <PageLoadingIndicator text="Loading batch details..." />;
  }

  if (!batch) {
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Batch not found</h2>
              <p className="text-gray-600 mb-4">The batch you're looking for doesn't exist.</p>
              <Link href="/student/batches">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Batches
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
          <Link href="/student/batches">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Batches
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Batch Details</h1>
        </div>
        
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{batch.name}</h1>
              <p className="text-muted-foreground">
                {batch.category} • {batch.class_type} • {batch.current_students}/{batch.capacity} students
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(batch.status)}>
                {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
              </Badge>
              {enrollmentStatus.isEnrolled ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enrolled
                  </Badge>
                  <Button onClick={handleContinueLearning} className="bg-blue-600 hover:bg-blue-700">
                    Continue Learning
                  </Button>
                </div>
              ) : (
                <Button onClick={handleEnrollNow} className="bg-green-600 hover:bg-green-700">
                  Enroll Now - ₹{batch.fees.toLocaleString()}
                </Button>
              )}
            </div>
          </div>

          {/* Enrollment Status Alert */}
          {!enrollmentStatus.isEnrolled && (
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Not Enrolled:</strong> You need to enroll in this batch to access subjects and learning materials.
                Some sections may be restricted until enrollment is complete.
              </AlertDescription>
            </Alert>
          )}

          {/* Batch Header Card with Thumbnail */}
          <Card className="mb-6 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Thumbnail */}
              <div className="md:w-80 h-48 md:h-auto bg-gradient-to-br from-blue-100 to-purple-100 relative">
                {batch.thumbnail ? (
                  <img
                    src={batch.thumbnail}
                    alt={batch.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <p className="text-lg font-medium">{batch.category}</p>
                      <p className="text-sm">{batch.class_type}</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-gray-800">
                    {batch.category}
                  </Badge>
                </div>
              </div>

              {/* Quick Info */}
              <CardContent className="flex-1 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Capacity:</strong> {batch.current_students}/{batch.capacity} students
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Duration:</strong> 
                        {batch.start_date && ` ${formatDate(batch.start_date)}`}
                        {batch.end_date && ` - ${formatDate(batch.end_date)}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Schedule:</strong> {batch.schedule_days.join(", ")}
                        {batch.start_time && batch.end_time && ` • ${formatTime(batch.start_time)} - ${formatTime(batch.end_time)}`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Fees:</strong> ₹{batch.fees.toLocaleString()}
                      </span>
                    </div>

                    {batch.teacher_name && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          <strong>Teacher:</strong> {batch.teacher_name}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Created:</strong> {formatDate(batch.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Batch Details</span>
              </TabsTrigger>
              <TabsTrigger 
                value="subjects" 
                className="flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Subjects</span>
              </TabsTrigger>
              <TabsTrigger 
                value="resources" 
                className="flex items-center gap-2"
                disabled={!enrollmentStatus.isEnrolled}
              >
                <FolderOpen className="h-4 w-4" />
                <span>Resources</span>
                {!enrollmentStatus.isEnrolled && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span>Announcements</span>
              </TabsTrigger>
            </TabsList>

            {/* Batch Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Core details about this batch
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Batch Name</label>
                      <p className="text-sm font-medium">{batch.name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-sm">{batch.description || "No description provided"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Category</label>
                        <p className="text-sm font-medium">{batch.category}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Class Type</label>
                        <p className="text-sm font-medium">{batch.class_type}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <Badge className={getStatusColor(batch.status) + " text-xs w-fit"}>
                          {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Fees</label>
                        <p className="text-sm font-medium">₹{batch.fees.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Teacher Information */}
                {batch.teacher_name && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Teacher Information
                      </CardTitle>
                      <CardDescription>
                        Details about the batch instructor
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-sm font-medium">{batch.teacher_name}</p>
                      </div>
                      
                      {batch.teacher_subject && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Subject</label>
                          <p className="text-sm">{batch.teacher_subject}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        {batch.teacher_experience && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Experience</label>
                            <p className="text-sm">{batch.teacher_experience}</p>
                          </div>
                        )}
                        {batch.teacher_qualification && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Qualification</label>
                            <p className="text-sm">{batch.teacher_qualification}</p>
                          </div>
                        )}
                      </div>

                      {batch.teacher_bio && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Bio</label>
                          <p className="text-sm">{batch.teacher_bio}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Schedule Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Schedule Information
                    </CardTitle>
                    <CardDescription>
                      Class timing and duration details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Days</label>
                      <div className="flex gap-2 mt-1">
                        {batch.schedule_days.map((day) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {(batch.start_time || batch.end_time) && (
                      <div className="grid grid-cols-2 gap-4">
                        {batch.start_time && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Start Time</label>
                            <p className="text-sm font-medium">{formatTime(batch.start_time)}</p>
                          </div>
                        )}
                        {batch.end_time && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">End Time</label>
                            <p className="text-sm font-medium">{formatTime(batch.end_time)}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {(batch.start_date || batch.end_date) && (
                      <div className="grid grid-cols-2 gap-4">
                        {batch.start_date && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Start Date</label>
                            <p className="text-sm font-medium">{formatDate(batch.start_date)}</p>
                          </div>
                        )}
                        {batch.end_date && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">End Date</label>
                            <p className="text-sm font-medium">{formatDate(batch.end_date)}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Student Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Student Information
                    </CardTitle>
                    <CardDescription>
                      Enrollment and capacity details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Current Students</label>
                        <p className="text-2xl font-bold text-blue-600">{batch.current_students}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Total Capacity</label>
                        <p className="text-2xl font-bold text-gray-900">{batch.capacity}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Enrollment Progress</label>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span>{batch.current_students} enrolled</span>
                          <span>{Math.round((batch.current_students / batch.capacity) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(batch.current_students / batch.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Available Spots</label>
                      <p className="text-lg font-semibold text-green-600">{batch.capacity - batch.current_students}</p>
                    </div>

                    {enrollmentStatus.isEnrolled && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">You are enrolled in this batch</span>
                        </div>
                        {enrollmentStatus.enrolledAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Enrolled on: {new Date(enrollmentStatus.enrolledAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Subjects Tab - Show subjects for all students, with enrollment-based restrictions */}
            <TabsContent value="subjects">
              <StudentBatchSubjects 
                batchId={batchId}
                category={batch.category}
                classType={batch.class_type}
              />
            </TabsContent>

            {/* Resources Tab - Only for enrolled students */}
            <TabsContent value="resources">
              {enrollmentStatus.isEnrolled ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Resources Coming Soon</h3>
                    <p className="text-gray-600">
                      Study materials, notes, and additional resources will be available here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Enrollment Required</h3>
                    <p className="text-gray-600 mb-4">
                      You need to enroll in this batch to access study resources.
                    </p>
                    <Button onClick={handleEnrollNow} className="bg-green-600 hover:bg-green-700">
                      Enroll Now - ₹{batch.fees.toLocaleString()}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Announcements Tab - Available for all students */}
            <TabsContent value="announcements">
              <Card>
                <CardContent className="text-center py-12">
                  <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements Yet</h3>
                  <p className="text-gray-600">
                    Important updates and announcements from your instructor will appear here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </div>
    </SidebarProvider>
  );
}