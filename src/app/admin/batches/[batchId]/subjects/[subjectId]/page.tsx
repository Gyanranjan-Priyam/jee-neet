"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { SidebarProvider, MinimalSidebar, adminNavItems } from "@/components/minimal-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, GraduationCap, Edit } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { SubjectDetailsView } from "@/components/subject-details-view";

interface Subject {
  id: string;
  name: string;
  teacher_name?: string;
  status: "not_started" | "in_progress" | "completed";
  created_at?: string;
  updated_at?: string;
  batch_id: string;
}

interface BatchDetails {
  id: string;
  name: string;
  category: "JEE" | "NEET";
  class_type: "11th" | "12th" | "Dropper";
}

export default function SubjectPage() {
  const [activeCategory, setActiveCategory] = useState<"jee" | "neet">("jee");
  const [activeClass, setActiveClass] = useState<"11th" | "12th" | "dropper">("11th");
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [batch, setBatch] = useState<BatchDetails | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const batchId = params.batchId as string;
  const subjectId = params.subjectId as string;
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (batchId && subjectId && user) {
      fetchData();
    }
  }, [batchId, subjectId, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch batch data
      const batchResponse = await fetch(`/api/batches/${batchId}`);
      if (!batchResponse.ok) {
        throw new Error('Failed to fetch batch data');
      }
      const batchData = await batchResponse.json();
      setBatch(batchData.batch);
      
      // Set active filters based on batch data
      if (batchData.batch) {
        setActiveCategory(batchData.batch.category?.toLowerCase() || "jee");
        setActiveClass(batchData.batch.class_type || "11th");
      }
      
      // Fetch subject data
      const subjectResponse = await fetch(`/api/batches/${batchId}/subjects/${subjectId}`);
      if (!subjectResponse.ok) {
        throw new Error('Failed to fetch subject data');
      }
      const subjectData = await subjectResponse.json();
      setSubject(subjectData.subject);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch subject data');
      router.push(`/admin/batches/view/${batchId}`);
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
      case "not_started":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!subject || !batch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subject not found</h2>
          <p className="text-gray-600 mb-4">The subject you're looking for doesn't exist.</p>
          <Link href={`/admin/batches/view/${batchId}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Batch
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
                Subject Details
              </h1>
            </div>
          </header>
        
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href={`/admin/batches/view/${batchId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to {batch.name}
                </Button>
              </Link>
              <div className="ml-50">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
                  <Badge className={getStatusColor(subject.status)}>
                    {subject.status.replace("_", " ").charAt(0).toUpperCase() + subject.status.replace("_", " ").slice(1)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {batch.category} • {batch.class_type} • {batch.name}
                  {subject.teacher_name && ` • Teacher: ${subject.teacher_name}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Subject
              </Button>
            </div>
          </div>

          {/* Subject Overview Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Subject Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Subject Name</label>
                  <p className="text-lg font-semibold">{subject.name}</p>
                </div>
                
                {subject.teacher_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teacher</label>
                    <p className="text-lg font-semibold">{subject.teacher_name}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(subject.status)}>
                      {subject.status.replace("_", " ").charAt(0).toUpperCase() + subject.status.replace("_", " ").slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm">{formatDate(subject.created_at || '')}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm">{formatDate(subject.updated_at || '')}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Batch: </label>
                  <Link 
                    href={`/admin/batches/view/${batchId}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {batch.name}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Details Component */}
          <SubjectDetailsView 
            subject={subject}
            batchId={batchId}
            onBack={() => router.push(`/admin/batches/view/${batchId}`)}
          />
        </div>
        </div>
      </div>
    </SidebarProvider>
  );
}