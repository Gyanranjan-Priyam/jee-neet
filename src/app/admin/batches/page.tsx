"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { createClient } from "@/lib/supabase";
import { SidebarProvider, MinimalSidebar, adminNavItems } from "@/components/minimal-sidebar";
import { useAdminPreferences } from "@/hooks/use-admin-preferences";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar,
  BookOpen,
  GraduationCap,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface BatchType {
  id: string;
  title: string; // API returns title (transformed from name)
  description?: string;
  exam_focus: string; // API returns exam_focus (transformed from category)
  batch_type: string; // API returns batch_type
  image_url?: string; // API returns image_url (transformed from thumbnail)
  capacity?: number;
  students_count: number; // API returns students_count
  instructor: string; // API returns instructor (transformed from teacher_name)
  status: string; // API returns status
  subjects: string[]; // API returns subjects array
  start_date?: string;
  end_date?: string;
  
  // Keep original fields for backward compatibility if needed
  name?: string;
  category?: "JEE" | "NEET";
  class_type?: "11th" | "12th" | "Dropper";
  thumbnail?: string;
  current_students?: number;
  fees?: number;
  schedule_days?: string[];
  start_time?: string;
  end_time?: string;
  teacher_name?: string;
  teacher_subject?: string;
  teacher_experience?: string;
  teacher_qualification?: string;
  teacher_bio?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export default function AllBatchesPage() {
  const { category: activeCategory, classType: activeClass, updateCategory, updateClassType } = useAdminPreferences();
  const [batches, setBatches] = useState<BatchType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingBatch, setDeletingBatch] = useState<BatchType | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchBatches();
    }
  }, [user, activeCategory, activeClass]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      
      // For now, using mock data since we don't have the batches table yet
      // In real implementation, this would be:
      // const { data, error } = await supabase
      //   .from("batches")
      //   .select("*")
      //   .eq("category", activeCategory)
      //   .eq("class_type", activeClass)
      //   .order("created_at", { ascending: false });

      // Fetch batches from API
      const params = new URLSearchParams();
      params.append('category', activeCategory.toUpperCase());
      params.append('class_type', activeClass);
      
      const response = await fetch(`/api/batches?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch batches');
      }
      
      const data = await response.json();
      const fetchedBatches: BatchType[] = data.batches || [];
      
      setBatches(fetchedBatches);
      setError("");
    } catch (err) {
      console.error("Exception fetching batches:", err);
      setError("Failed to fetch batches");
      toast.error("Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  const handleDeleteBatch = async () => {
    if (!deletingBatch) return;

    try {
      const response = await fetch(`/api/batches/${deletingBatch.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete batch');
      }

      // Remove from local state
      setBatches(prev => prev.filter(batch => batch.id !== deletingBatch.id));
      
      setShowDeleteDialog(false);
      setDeletingBatch(null);
      toast.success(`Batch "${deletingBatch.title || deletingBatch.name}" deleted successfully!`);
    } catch (err: any) {
      console.error("Error deleting batch:", err);
      toast.error(err.message || "Failed to delete batch");
    }
  };

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) {
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
    
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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
                Batch Management
              </h1>
            </div>
          </header>
        
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">All Batches</h1>
              <p className="text-muted-foreground">
                Manage your {activeCategory.toUpperCase()} batches for {activeClass} students
              </p>
            </div>
            <Link href="/admin/batches/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Batch
              </Button>
            </Link>
          </div>

          {error && (
            <div className="mb-6">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-800">{error}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <Card key={batch.id} className="hover:shadow-lg transition-all duration-200 overflow-hidden group">
                {/* Thumbnail */}
                <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 relative">
                  {batch.image_url ? (
                    <>
                      <img
                        src={batch.image_url}
                        alt={batch.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center">
                                <div class="text-center text-gray-500">
                                  <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                  </div>
                                  <p class="text-sm font-medium">${batch.exam_focus || 'No Category'} ${batch.batch_type || 'No Class'}</p>
                                </div>
                              </div>
                            `;
                          }
                        }}
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs font-medium">
                          {batch.exam_focus || 'No Category'}
                        </Badge>
                        <Badge className={getStatusColor(batch.status) + " text-xs"}>
                          {batch.status ? batch.status.charAt(0).toUpperCase() + batch.status.slice(1) : 'Unknown'}
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium">{batch.exam_focus || 'No Category'} {batch.batch_type || 'No Class'}</p>
                      </div>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{batch.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {batch.description}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={`/admin/batches/view/${batch.id}`} className="flex items-center w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/admin/batches/edit/${batch.id}`} className="flex items-center w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Batch
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setDeletingBatch(batch);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Batch
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status ? batch.status.charAt(0).toUpperCase() + batch.status.slice(1) : 'Unknown'}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        {batch.students_count || 0}
                        {(batch.capacity || batch.current_students) && `/${batch.capacity || 'Unlimited'}`}
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {batch.start_date ? formatDate(batch.start_date) : 'No start date'}
                      {batch.end_date && ` - ${formatDate(batch.end_date)}`}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {batch.exam_focus?.toUpperCase() || 'NO CATEGORY'}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        {batch.batch_type || 'No class type'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {batches.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No batches found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Get started by creating your first batch for {activeCategory.toUpperCase()} {activeClass} students.
              </p>
              <Link href="/admin/batches/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Batch
                </Button>
              </Link>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Delete Batch Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the batch
              "{deletingBatch?.name}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBatch}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}