"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { createClient } from "@/lib/supabase";
import { SidebarProvider, MinimalSidebar, adminNavItems } from "@/components/minimal-sidebar";
import { BatchSubjects } from "@/components/batch-subjects";
import { BatchResources } from "@/components/batch-resources";
import { BatchAnnouncements } from "@/components/batch-announcements";
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
  Edit, 
  Users, 
  Calendar, 
  Clock, 
  GraduationCap,
  BookOpen,
  FolderOpen,
  Megaphone,
  User,
  MapPin,
  Phone,
  Mail,
  Award,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
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
  created_by: string;
}

export default function BatchViewPage() {
  const [activeCategory, setActiveCategory] = useState<"jee" | "neet">("jee");
  const [activeClass, setActiveClass] = useState<"11th" | "12th" | "dropper">("11th");
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<BatchDetails | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;
  const { user, loading: authLoading, signOut } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (batchId && user) {
      fetchBatchData();
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
      
      // Set active filters based on batch data
      if (data.batch) {
        setActiveCategory(data.batch.category?.toLowerCase() || "jee");
        setActiveClass(data.batch.class_type || "11th");
      }
      
    } catch (error) {
      console.error('Error fetching batch:', error);
      toast.error('Failed to fetch batch data');
      router.push('/admin/batches');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Batch not found</h2>
          <p className="text-gray-600 mb-4">The batch you're looking for doesn't exist.</p>
          <Link href="/admin/batches">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Batches
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <MinimalSidebar
          user={{
            name: user?.email?.split('@')[0] || 'Admin',
            email: user?.email || 'admin@example.com'
          }}
          navItems={adminNavItems}
          onLogout={handleLogout}
          type="admin"
        />
        <div className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex h-16 items-center justify-between px-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Batch Details
              </h1>
            </div>
          </header>
        
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/admin/batches">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Batches
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{batch.name}</h1>
                <p className="text-muted-foreground">
                  {batch.category} • {batch.class_type} • {batch.current_students}/{batch.capacity} students
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(batch.status)}>
                {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
              </Badge>
              <Link href={`/admin/batches/edit/${batch.id}`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Batch
                </Button>
              </Link>
            </div>
          </div>

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
            <TabsList className="grid h-auto w-17px mx-auto grid-cols-4">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-xl">Batch Details</span>
              </TabsTrigger>
              <TabsTrigger value="subjects" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="text-xl">Subjects</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span className="text-xl">Resources</span>
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span className="text-xl">Announcements</span>
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
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Subjects Tab */}
            <TabsContent value="subjects">
              <BatchSubjects 
                batchId={batch.id}
                category={batch.category}
                classType={batch.class_type}
              />
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources">
              <BatchResources 
                batchId={batch.id}
                category={batch.category}
                classType={batch.class_type}
              />
            </TabsContent>

            {/* Announcements Tab */}
            <TabsContent value="announcements">
              <BatchAnnouncements 
                batchId={batch.id}
                category={batch.category}
                classType={batch.class_type}
              />
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </div>
    </SidebarProvider>
  );
}