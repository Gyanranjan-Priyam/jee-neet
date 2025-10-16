"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { SidebarProvider, MinimalSidebar, studentNavItems } from "@/components/minimal-sidebar";
import { PageLoadingIndicator } from "@/components/professional-loading-indicator";
import { StudentChapterSidebar } from "@/components/student-chapter-sidebar";
import { StudentVideoList } from "@/components/student-video-list";
import { StudentPdfList } from "@/components/student-pdf-list";
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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  BookOpen,
  Clock,
  PlayCircle,
  FileText,
  CheckCircle,
  Target,
  Video,
  Lock,
  User,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ChapterDetails {
  id: string;
  name: string;
  description?: string;
  status: "not_started" | "in_progress" | "completed";
  order_index: number;
  estimated_hours?: number;
  completion_date?: string;
  created_at?: string;
  updated_at?: string;
  subject_id: string;
  is_locked: boolean;
  access_message?: string;
  progress?: ChapterProgress;
}

interface ChapterProgress {
  progress_percentage: number;
  last_accessed?: string;
  time_spent: number;
  videos_watched: number;
  total_videos: number;
  pdfs_viewed: number;
  total_pdfs: number;
}



interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  video_type: "lecture" | "dpp_video";
  video_source: "youtube" | "google_drive" | "direct_link" | "cloudinary";
  thumbnail_url?: string;
  file_size?: number;
  order_index: number;
  created_at: string;
  is_watched?: boolean;
  watch_progress?: number;
}

interface Pdf {
  id: string;
  title: string;
  pdf_url: string;
  pdf_type: "note" | "dpp_pdf";
  pdf_source: "supabase_storage" | "google_drive";
  file_size?: number;
  storage_path?: string;
  order_index: number;
  created_at: string;
  is_viewed?: boolean;
  is_downloaded?: boolean;
  view_count?: number;
}

interface BatchInfo {
  id: string;
  name: string;
  category: string;
  class_type: string;
}

interface SubjectInfo {
  id: string;
  name: string;
  teacher_name?: string;
}

export default function StudentChapterViewPage() {
  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState<ChapterDetails | null>(null);
  const [chapters, setChapters] = useState<ChapterDetails[]>([]);
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [subjectInfo, setSubjectInfo] = useState<SubjectInfo | null>(null);

  const [videos, setVideos] = useState<{ lectures: Video[]; dpp_videos: Video[] }>({
    lectures: [],
    dpp_videos: []
  });
  const [pdfs, setPdfs] = useState<{ notes: Pdf[]; dpp_pdfs: Pdf[] }>({
    notes: [],
    dpp_pdfs: []
  });
  const [activeTab, setActiveTab] = useState("lectures");
  
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/student/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (batchId && subjectId && chapterId && user) {
      Promise.all([
        fetchChapterData(),
        fetchAllChapters(),
        fetchBatchInfo(),
        fetchSubjectInfo(),

        fetchVideos(),
        fetchPdfs()
      ]);
    }
  }, [batchId, subjectId, chapterId, user]);

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

  const fetchSubjectInfo = async () => {
    try {
      const response = await fetch(`/api/batches/${batchId}/subjects`);
      if (response.ok) {
        const data = await response.json();
        const subjects = data.subjects || [];
        const subject = subjects.find((s: SubjectInfo) => s.id === subjectId);
        if (subject) {
          setSubjectInfo(subject);
        }
      }
    } catch (error) {
      console.error('Error fetching subject info:', error);
    }
  };

  const fetchChapterData = async () => {
    try {
      setLoading(true);
      console.log('Fetching chapter data:', { batchId, subjectId, chapterId });
      
      const url = `/api/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}`;
      console.log('Fetch URL:', url);
      
      const response = await fetch(url);
      
      console.log('Response status:', response.status);
      console.log('Response OK:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch error response:', errorText);
        throw new Error(`Failed to fetch chapter data: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Chapter data received:', data);
      setChapter(data.chapter);
      
      // Update access status based on API response
      if (data.access_info) {
        console.log('Chapter access info:', data.access_info);
      }
      
    } catch (error) {
      console.error('Error fetching chapter:', error);
      toast.error('Failed to fetch chapter data');
      router.push(`/student/batches/${batchId}/subjects/${subjectId}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllChapters = async () => {
    try {
      const response = await fetch(`/api/batches/${batchId}/subjects/${subjectId}/chapters`);
      if (response.ok) {
        const data = await response.json();
        setChapters(data.chapters || []);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };



  const fetchVideos = async () => {
    try {
      const response = await fetch(`/api/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/videos`);
      if (response.ok) {
        const data = await response.json();
        setVideos({
          lectures: data.videos?.lectures || [],
          dpp_videos: data.videos?.dpp_videos || []
        });
      } else {
        // Fallback to empty arrays if API fails
        setVideos({ lectures: [], dpp_videos: [] });
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos({ lectures: [], dpp_videos: [] });
    }
  };

  const fetchPdfs = async () => {
    try {
      const response = await fetch(`/api/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/pdfs`);
      if (response.ok) {
        const data = await response.json();
        setPdfs({
          notes: data.pdfs?.notes || [],
          dpp_pdfs: data.pdfs?.dpp_pdfs || []
        });
      } else {
        // Fallback to empty arrays if API fails
        setPdfs({ notes: [], dpp_pdfs: [] });
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      setPdfs({ notes: [], dpp_pdfs: [] });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/student/login");
  };

  const handleVideoWatched = (videoId: string) => {
    // Update local state to mark video as watched
    setVideos(prev => ({
      lectures: prev.lectures.map(v => 
        v.id === videoId ? { ...v, is_watched: true, watch_progress: 100 } : v
      ),
      dpp_videos: prev.dpp_videos.map(v => 
        v.id === videoId ? { ...v, is_watched: true, watch_progress: 100 } : v
      )
    }));
    
    // TODO: Send to API to track progress
    console.log('Video watched:', videoId);
  };

  const handlePdfViewed = (pdfId: string) => {
    // Update local state to mark PDF as viewed
    setPdfs(prev => ({
      notes: prev.notes.map(p => 
        p.id === pdfId ? { ...p, is_viewed: true, view_count: (p.view_count || 0) + 1 } : p
      ),
      dpp_pdfs: prev.dpp_pdfs.map(p => 
        p.id === pdfId ? { ...p, is_viewed: true, view_count: (p.view_count || 0) + 1 } : p
      )
    }));
    
    // TODO: Send to API to track progress
    console.log('PDF viewed:', pdfId);
  };

  const handlePdfDownloaded = (pdfId: string) => {
    // Update local state to mark PDF as downloaded
    setPdfs(prev => ({
      notes: prev.notes.map(p => 
        p.id === pdfId ? { ...p, is_downloaded: true } : p
      ),
      dpp_pdfs: prev.dpp_pdfs.map(p => 
        p.id === pdfId ? { ...p, is_downloaded: true } : p
      )
    }));
    
    // TODO: Send to API to track downloads
    console.log('PDF downloaded:', pdfId);
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

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!chapter) {
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chapter not found</h2>
                <p className="text-gray-600 mb-4">The chapter you're looking for doesn't exist.</p>
                <Link href={`/student/batches/${batchId}/subjects/${subjectId}`}>
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Subject
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
        
        {/* Chapter Sidebar */}
      {chapters.length > 0 && subjectInfo && (
        <StudentChapterSidebar
          chapters={chapters}
          currentChapterId={chapterId}
          batchId={batchId}
          subjectId={subjectId}
          subjectName={subjectInfo.name}
        />
      )}
      
      <div className="flex-1 overflow-auto">
        <div className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <h1 className="text-xl font-semibold">{chapter?.name || 'Loading...'}</h1>
          {subjectInfo && (
            <span className="text-sm text-gray-500">
              • {subjectInfo.name}
            </span>
          )}
        </div>
        
        <div className="flex-1 p-6">
          {/* Chapter Access Check */}
          {chapter?.is_locked && (
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <Lock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Access Restricted:</strong> {chapter.access_message || 'You need to be enrolled to access this chapter content.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Chapter Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                      {chapter?.order_index || 1}
                    </div>
                    {chapter?.name || 'Loading...'}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {chapter?.description || "Study materials and resources for this chapter"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(chapter?.status || 'not_started')}>
                    {(chapter?.status || 'not_started').replace("_", " ").charAt(0).toUpperCase() + (chapter?.status || 'not_started').replace("_", " ").slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subjectInfo?.teacher_name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Teacher:</strong> {subjectInfo.teacher_name}
                    </span>
                  </div>
                )}
                
                {chapter?.estimated_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Duration:</strong> {chapter.estimated_hours}h estimated
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Added:</strong> {chapter?.created_at ? new Date(chapter.created_at).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Progress Section - Only for enrolled students */}
              {!chapter?.is_locked && chapter?.progress && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Your Progress
                    </h4>
                    <span className="text-sm text-gray-600">
                      {chapter.progress.progress_percentage}% complete
                    </span>
                  </div>
                  <Progress value={chapter.progress.progress_percentage} className="h-2 mb-2" />
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                    <span>Videos: {chapter.progress.videos_watched}/{chapter.progress.total_videos}</span>
                    <span>PDFs: {chapter.progress.pdfs_viewed}/{chapter.progress.total_pdfs}</span>
                    {chapter.progress.time_spent > 0 && (
                      <span>Time: {formatTime(chapter.progress.time_spent)}</span>
                    )}
                  </div>
                  {chapter.progress.last_accessed && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last accessed: {new Date(chapter.progress.last_accessed).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chapter Content */}
          {chapter?.is_locked ? (
            <Card>
              <CardContent className="text-center py-12">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chapter Locked</h3>
                <p className="text-gray-600 mb-4">
                  Enroll in this batch to access all study materials, videos, and resources for this chapter.
                </p>
                <Link href={`/student/checkout/${batchId}`}>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Enroll in Batch
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="lectures" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>Lectures ({videos.lectures.length})</span>
                </TabsTrigger>
                <TabsTrigger value="dpp-pdf" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>DPP PDF ({pdfs.dpp_pdfs.length})</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Notes ({pdfs.notes.length})</span>
                </TabsTrigger>
                <TabsTrigger value="dpp-videos" className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4" />
                  <span>DPP Videos ({videos.dpp_videos.length})</span>
                </TabsTrigger>
              </TabsList>

              {/* Lectures Tab */}
              <TabsContent value="lectures" className="space-y-4">
                <StudentVideoList 
                  videos={videos.lectures}
                  videoType="lecture"
                  onVideoWatched={handleVideoWatched}
                />
              </TabsContent>

              {/* DPP PDF Tab */}
              <TabsContent value="dpp-pdf" className="space-y-4">
                <StudentPdfList 
                  pdfs={pdfs.dpp_pdfs}
                  pdfType="dpp_pdf"
                  onPdfViewed={handlePdfViewed}
                  onPdfDownloaded={handlePdfDownloaded}
                />
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4">
                <StudentPdfList 
                  pdfs={pdfs.notes}
                  pdfType="note"
                  onPdfViewed={handlePdfViewed}
                  onPdfDownloaded={handlePdfDownloaded}
                />
              </TabsContent>

              {/* DPP Videos Tab */}
              <TabsContent value="dpp-videos" className="space-y-4">
                <StudentVideoList 
                  videos={videos.dpp_videos}
                  videoType="dpp_video"
                  onVideoWatched={handleVideoWatched}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
        </div>
      </div>
    </SidebarProvider>
  );
}