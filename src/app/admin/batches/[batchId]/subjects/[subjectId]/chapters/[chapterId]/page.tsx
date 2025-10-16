"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { SidebarProvider, MinimalSidebar, adminNavItems } from "@/components/minimal-sidebar";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Edit,
  Video,
  FileText,
  ClipboardList,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ChapterSidebar } from "@/components/chapter-sidebar";
import { VideoUploadDialog } from "@/components/video-upload-dialog";
import { VideoList } from "@/components/video-list";
import { PdfUploadDialog } from "@/components/pdf-upload-dialog";
import { PdfList } from "@/components/pdf-list";

interface Chapter {
  id: string;
  name: string;
  description?: string;
  status: "not_started" | "in_progress" | "completed";
  order_index: number;
  completion_date?: string;
  created_at?: string;
  updated_at?: string;
}

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

export default function ChapterPage() {
  const [activeCategory, setActiveCategory] = useState<"jee" | "neet">("jee");
  const [activeClass, setActiveClass] = useState<"11th" | "12th" | "dropper">(
    "11th"
  );
  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [batch, setBatch] = useState<BatchDetails | null>(null);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [activeTab, setActiveTab] = useState("lectures");
  const [videos, setVideos] = useState<{ lectures: any[]; dpp_videos: any[] }>({
    lectures: [],
    dpp_videos: [],
  });
  const [pdfs, setPdfs] = useState<{ notes: any[]; dpp_pdfs: any[] }>({
    notes: [],
    dpp_pdfs: [],
  });
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoDialogType, setVideoDialogType] = useState<
    "lecture" | "dpp_video"
  >("lecture");
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [pdfDialogType, setPdfDialogType] = useState<
    "note" | "dpp_pdf"
  >("note");

  const router = useRouter();
  const params = useParams();
  const batchId = params.batchId as string;
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (batchId && subjectId && chapterId && user) {
      fetchData();
    }
  }, [batchId, subjectId, chapterId, user]);

  const fetchVideos = async () => {
    try {
      const videosResponse = await fetch(
        `/api/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/videos`
      );
      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        setVideos(videosData.videos || { lectures: [], dpp_videos: [] });
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      // If table doesn't exist, set empty videos to prevent errors
      setVideos({ lectures: [], dpp_videos: [] });
    }
  };

  const fetchPdfs = async () => {
    try {
      const pdfsResponse = await fetch(
        `/api/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/pdfs`
      );
      if (pdfsResponse.ok) {
        const pdfsData = await pdfsResponse.json();
        setPdfs(pdfsData.pdfs || { notes: [], dpp_pdfs: [] });
      }
    } catch (error) {
      console.error("Error fetching PDFs:", error);
      // If table doesn't exist, set empty PDFs to prevent errors
      setPdfs({ notes: [], dpp_pdfs: [] });
    }
  };

  const handleAddVideo = (type: "lecture" | "dpp_video") => {
    setVideoDialogType(type);
    setShowVideoDialog(true);
  };

  const handleVideoAdded = () => {
    fetchVideos();
  };

  const handleAddPdf = (type: "note" | "dpp_pdf") => {
    setPdfDialogType(type);
    setShowPdfDialog(true);
  };

  const handlePdfAdded = () => {
    fetchPdfs();
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch batch data
      const batchResponse = await fetch(`/api/batches/${batchId}`);
      if (!batchResponse.ok) {
        throw new Error("Failed to fetch batch data");
      }
      const batchData = await batchResponse.json();
      setBatch(batchData.batch);

      // Set active filters based on batch data
      if (batchData.batch) {
        setActiveCategory(batchData.batch.category?.toLowerCase() || "jee");
        setActiveClass(batchData.batch.class_type || "11th");
      }

      // Fetch subject data
      const subjectResponse = await fetch(
        `/api/batches/${batchId}/subjects/${subjectId}`
      );
      if (!subjectResponse.ok) {
        throw new Error("Failed to fetch subject data");
      }
      const subjectData = await subjectResponse.json();
      setSubject(subjectData.subject);

      // Fetch all chapters for sidebar navigation
      const chaptersResponse = await fetch(
        `/api/batches/${batchId}/subjects/${subjectId}/chapters`
      );
      if (!chaptersResponse.ok) {
        throw new Error("Failed to fetch chapters");
      }
      const chaptersData = await chaptersResponse.json();
      setAllChapters(chaptersData.chapters || []);

      // Find current chapter
      const currentChapter = (chaptersData.chapters || []).find(
        (ch: Chapter) => ch.id === chapterId
      );
      if (!currentChapter) {
        throw new Error("Chapter not found");
      }
      setChapter(currentChapter);

      // Fetch videos for this chapter
      await fetchVideos();
      
      // Fetch PDFs for this chapter
      await fetchPdfs();
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch chapter data");
      router.push(`/admin/batches/${batchId}/subjects/${subjectId}`);
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
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!chapter || !subject || !batch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Chapter not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The chapter you're looking for doesn't exist.
          </p>
          <Link href={`/admin/batches/${batchId}/subjects/${subjectId}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subject
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
                Chapter Details
              </h1>
            </div>
          </header>

        <div className="flex flex-1">
          {/* Chapter Navigation Sidebar */}
          <ChapterSidebar
            chapters={allChapters}
            currentChapterId={chapterId}
            batchId={batchId}
            subjectId={subjectId}
            subjectName={subject.name}
          />

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              {/* Left side: Icon, title, badge */}
              <div className="flex items-center gap-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                      {chapter.name}
                    </h1>
                    <Badge className={getStatusColor(chapter.status)}>
                      {chapter.status
                        .replace("_", " ")
                        .charAt(0)
                        .toUpperCase() +
                        chapter.status.replace("_", " ").slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Right side: Paragraph */}
              <p className="text-muted-foreground">
                {batch.category} • {batch.class_type} • {subject.name}
              </p>
            </div>

            {/* Content Sections */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid h-12 w-20px mx-auto grid-cols-4">
                <TabsTrigger
                  value="lectures"
                  className="flex items-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  <span className="text-sm">Lectures</span>
                </TabsTrigger>
                <TabsTrigger
                  value="dpp-pdf"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">DPP PDFs</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  <span className="text-sm">Notes</span>
                </TabsTrigger>
                <TabsTrigger
                  value="dpp-videos"
                  className="flex items-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span className="text-sm">DPP Videos</span>
                </TabsTrigger>
              </TabsList>

              {/* Lectures Tab */}
              <TabsContent value="lectures" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Video Lectures</h3>
                  <Button size="sm" onClick={() => handleAddVideo("lecture")}>
                    <Video className="h-4 w-4 mr-2" />
                    Add Lecture
                  </Button>
                </div>

                <VideoList
                  videos={videos.lectures}
                  videoType="lecture"
                  onVideoDeleted={fetchVideos}
                  batchId={batchId}
                  subjectId={subjectId}
                  chapterId={chapterId}
                />
              </TabsContent>

              {/* DPP PDFs Tab */}
              <TabsContent value="dpp-pdf" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Daily Practice Problem PDFs
                  </h3>
                  <Button size="sm" onClick={() => handleAddPdf("dpp_pdf")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Add DPP PDF
                  </Button>
                </div>

                <PdfList
                  pdfs={pdfs.dpp_pdfs}
                  pdfType="dpp_pdf"
                  onPdfDeleted={fetchPdfs}
                  batchId={batchId}
                  subjectId={subjectId}
                  chapterId={chapterId}
                />
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Study Notes</h3>
                  <Button size="sm" onClick={() => handleAddPdf("note")}>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Add Notes
                  </Button>
                </div>

                <PdfList
                  pdfs={pdfs.notes}
                  pdfType="note"
                  onPdfDeleted={fetchPdfs}
                  batchId={batchId}
                  subjectId={subjectId}
                  chapterId={chapterId}
                />
              </TabsContent>

              {/* DPP Videos Tab */}
              <TabsContent value="dpp-videos" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">DPP Solution Videos</h3>
                  <Button size="sm" onClick={() => handleAddVideo("dpp_video")}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Add DPP Video
                  </Button>
                </div>

                <VideoList
                  videos={videos.dpp_videos}
                  videoType="dpp_video"
                  onVideoDeleted={fetchVideos}
                  batchId={batchId}
                  subjectId={subjectId}
                  chapterId={chapterId}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        </div>
      </div>

      {/* Video Upload Dialog */}
      <VideoUploadDialog
        isOpen={showVideoDialog}
        onClose={() => setShowVideoDialog(false)}
        onVideoAdded={handleVideoAdded}
        batchId={batchId}
        subjectId={subjectId}
        chapterId={chapterId}
        videoType={videoDialogType}
        title={videoDialogType === "lecture" ? "Lecture Video" : "DPP Solution Video"} chapters={[]}      />

      {/* PDF Upload Dialog */}
      <PdfUploadDialog
        isOpen={showPdfDialog}
        onClose={() => setShowPdfDialog(false)}
        onPdfAdded={handlePdfAdded}
        batchId={batchId}
        subjectId={subjectId}
        chapterId={chapterId}
        pdfType={pdfDialogType}
        title={
          pdfDialogType === "note" ? "Study Notes" : "DPP PDF"
        }
      />
    </SidebarProvider>
  );
}
