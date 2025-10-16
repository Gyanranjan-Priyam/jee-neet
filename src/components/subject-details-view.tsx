"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  FileText,
  Clock,
  Target,
  Loader2,
  ArrowLeft,
  PlayCircle,
  Download,
  Eye,
  CheckCircle2,
  Circle,
  BookmarkIcon,
  Video,
  Presentation,
  FileQuestion,
  Upload,
  Calendar,
  User,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { VideoUploadDialog } from "@/components/video-upload-dialog";
import { VideoPlaybackDialog } from "@/components/video-playback-dialog";

interface Chapter {
  id: string;
  name: string;
  description?: string;
  status: "not_started" | "in_progress" | "completed";
  order_index: number;
  estimated_hours?: number;
  completion_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface StudyMaterial {
  id: string;
  name: string;
  type: "pdf" | "video" | "presentation" | "quiz" | "assignment" | "notes";
  url?: string;
  file_size?: string;
  description?: string;
  chapter_id?: string;
  upload_date?: string;
  is_downloadable: boolean;
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

interface SubjectDetailsViewProps {
  subject: Subject;
  batchId: string;
  onBack: () => void;
  readOnly?: boolean;
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
}

export function SubjectDetailsView({ subject, batchId, onBack, readOnly = false }: SubjectDetailsViewProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [videos, setVideos] = useState<{ lectures: Video[]; dpp_videos: Video[] }>({
    lectures: [],
    dpp_videos: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chapters");
  
  // Chapter management states
  const [showAddChapterDialog, setShowAddChapterDialog] = useState(false);
  const [showEditChapterDialog, setShowEditChapterDialog] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [chapterFormData, setChapterFormData] = useState({
    name: "",
    description: "",
    estimated_hours: 0,
    status: "not_started" as "not_started" | "in_progress" | "completed"
  });

  // Study material management states
  const [showAddMaterialDialog, setShowAddMaterialDialog] = useState(false);
  const [showEditMaterialDialog, setShowEditMaterialDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [materialFormData, setMaterialFormData] = useState({
    name: "",
    type: "pdf" as StudyMaterial["type"],
    description: "",
    chapter_id: "",
    is_downloadable: true
  });

  // Video management states
  const [showLectureUploadDialog, setShowLectureUploadDialog] = useState(false);
  const [showDppVideoUploadDialog, setShowDppVideoUploadDialog] = useState(false);
  const [showVideoPlayback, setShowVideoPlayback] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  useEffect(() => {
    loadSubjectData();
  }, [subject.id]);

  const loadSubjectData = async () => {
    setLoading(true);
    try {
      await loadChapters();
      await loadMockStudyMaterials(); // Keep mock for now, will implement later
      await loadVideos();
    } catch (error) {
      console.error('Error loading subject data:', error);
      toast.error('Failed to load subject details');
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async () => {
    try {
      // Mock video data for now - will be replaced with real API calls once chapters are loaded
      const mockVideos = {
        lectures: [
          {
            id: '1',
            title: 'Introduction to Physics - Chapter 1',
            description: 'Basic concepts and fundamentals',
            video_url: 'https://www.youtube.com/embed/example1',
            video_type: 'lecture' as const,
            video_source: 'youtube' as const,
            order_index: 1,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Motion and Forces - Chapter 2',
            description: 'Understanding motion and force dynamics',
            video_url: 'https://www.youtube.com/embed/example2',
            video_type: 'lecture' as const,
            video_source: 'youtube' as const,
            order_index: 2,
            created_at: new Date().toISOString()
          }
        ],
        dpp_videos: [
          {
            id: '3',
            title: 'DPP Solutions - Chapter 1',
            description: 'Step by step solutions for daily practice problems',
            video_url: 'https://www.youtube.com/embed/example3',
            video_type: 'dpp_video' as const,
            video_source: 'youtube' as const,
            order_index: 1,
            created_at: new Date().toISOString()
          }
        ]
      };

      setVideos(mockVideos);
    } catch (error) {
      console.error('Error loading videos:', error);
      setVideos({ lectures: [], dpp_videos: [] });
    }
  };

  const handlePlayVideo = (video: Video) => {
    setPlayingVideo(video);
  };

  const loadChapters = async () => {
    try {
      const response = await fetch(`/api/batches/${batchId}/subjects/${subject.id}/chapters`);
      if (!response.ok) {
        throw new Error('Failed to fetch chapters');
      }
      const data = await response.json();
      setChapters(data.chapters || []);
    } catch (error) {
      console.error('Error loading chapters:', error);
      toast.error('Failed to load chapters');
      setChapters([]);
    }
  };

  const loadMockStudyMaterials = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockMaterials: StudyMaterial[] = [
      {
        id: '1',
        name: 'Introduction to Mechanics - Lecture Notes.pdf',
        type: 'pdf',
        description: 'Comprehensive notes covering basic mechanics concepts',
        chapter_id: '1',
        file_size: '2.4 MB',
        upload_date: '2024-01-01T00:00:00Z',
        is_downloadable: true
      },
      {
        id: '2',
        name: 'Mechanics Video Lecture - Part 1',
        type: 'video',
        description: 'Detailed video explanation of motion concepts',
        chapter_id: '1',
        file_size: '145 MB',
        upload_date: '2024-01-02T00:00:00Z',
        is_downloadable: false
      },
      {
        id: '3',
        name: 'Newton\'s Laws Presentation',
        type: 'presentation',
        description: 'PowerPoint slides explaining the three laws of motion',
        chapter_id: '2',
        file_size: '5.8 MB',
        upload_date: '2024-01-05T00:00:00Z',
        is_downloadable: true
      },
      {
        id: '4',
        name: 'Practice Quiz - Laws of Motion',
        type: 'quiz',
        description: 'Interactive quiz to test understanding',
        chapter_id: '2',
        upload_date: '2024-01-07T00:00:00Z',
        is_downloadable: false
      },
      {
        id: '5',
        name: 'Energy Conservation Assignment',
        type: 'assignment',
        description: 'Problem set on work and energy',
        chapter_id: '3',
        file_size: '1.2 MB',
        upload_date: '2024-01-10T00:00:00Z',
        is_downloadable: true
      },
      {
        id: '6',
        name: 'General Physics Reference Notes',
        type: 'notes',
        description: 'Quick reference guide for all chapters',
        file_size: '3.1 MB',
        upload_date: '2024-01-01T00:00:00Z',
        is_downloadable: true
      }
    ];
    
    setStudyMaterials(mockMaterials);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_started":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMaterialIcon = (type: StudyMaterial["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "video":
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case "presentation":
        return <Presentation className="h-4 w-4 text-orange-500" />;
      case "quiz":
        return <Target className="h-4 w-4 text-green-500" />;
      case "assignment":
        return <FileQuestion className="h-4 w-4 text-purple-500" />;
      case "notes":
        return <BookmarkIcon className="h-4 w-4 text-indigo-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const calculateProgress = () => {
    if (chapters.length === 0) return 0;
    const completedChapters = chapters.filter(ch => ch.status === 'completed').length;
    return Math.round((completedChapters / chapters.length) * 100);
  };

  const getChapterName = (chapterId?: string) => {
    if (!chapterId) return "General";
    const chapter = chapters.find(ch => ch.id === chapterId);
    return chapter?.name || `Chapter ${chapterId}`;
  };

  const resetChapterForm = () => {
    setChapterFormData({
      name: "",
      description: "",
      estimated_hours: 0,
      status: "not_started"
    });
    setEditingChapter(null);
  };

  const resetMaterialForm = () => {
    setMaterialFormData({
      name: "",
      type: "pdf",
      description: "",
      chapter_id: "",
      is_downloadable: true
    });
    setEditingMaterial(null);
  };

  const handleEditChapter = async () => {
    if (!editingChapter || !chapterFormData.name.trim()) {
      toast.error('Chapter name is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/batches/${batchId}/subjects/${subject.id}/chapters/${editingChapter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: chapterFormData.name,
          description: chapterFormData.description,
          estimated_hours: chapterFormData.estimated_hours,
          status: chapterFormData.status
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update chapter');
      }

      const data = await response.json();
      setChapters(prev => prev.map(ch => ch.id === editingChapter.id ? data.chapter : ch));
      toast.success('Chapter updated successfully!');
      setShowEditChapterDialog(false);
      resetChapterForm();
    } catch (error) {
      console.error('Error updating chapter:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update chapter');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChapter = async (chapter: Chapter) => {
    try {
      const response = await fetch(`/api/batches/${batchId}/subjects/${subject.id}/chapters/${chapter.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete chapter');
      }

      setChapters(prev => prev.filter(ch => ch.id !== chapter.id));
      toast.success('Chapter deleted successfully!');
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete chapter');
    }
  };

  const openEditChapterDialog = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setChapterFormData({
      name: chapter.name,
      description: chapter.description || '',
      estimated_hours: chapter.estimated_hours || 0,
      status: chapter.status
    });
    setShowEditChapterDialog(true);
  };

  const handleAddChapter = async () => {
    if (!chapterFormData.name.trim()) {
      toast.error('Chapter name is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/batches/${batchId}/subjects/${subject.id}/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: chapterFormData.name,
          description: chapterFormData.description,
          estimated_hours: chapterFormData.estimated_hours,
          status: chapterFormData.status
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create chapter');
      }

      const data = await response.json();
      setChapters(prev => [...prev, data.chapter]);
      toast.success('Chapter added successfully!');
      setShowAddChapterDialog(false);
      resetChapterForm();
    } catch (error) {
      console.error('Error creating chapter:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add chapter');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!materialFormData.name.trim()) {
      toast.error('Material name is required');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMaterial: StudyMaterial = {
        id: Date.now().toString(),
        name: materialFormData.name,
        type: materialFormData.type,
        description: materialFormData.description,
        chapter_id: materialFormData.chapter_id || undefined,
        is_downloadable: materialFormData.is_downloadable,
        upload_date: new Date().toISOString(),
        file_size: "Unknown"
      };
      
      setStudyMaterials(prev => [...prev, newMaterial]);
      toast.success('Study material added successfully!');
      setShowAddMaterialDialog(false);
      resetMaterialForm();
    } catch (error) {
      toast.error('Failed to add study material');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {chapters.filter(ch => ch.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {chapters.filter(ch => ch.status === 'in_progress').length}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {chapters.filter(ch => ch.status === 'not_started').length}
                </div>
                <div className="text-sm text-muted-foreground">Not Started</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid h-auto w-full mt-4 mx-auto grid-cols-4">
          <TabsTrigger value="chapters" className="cursor-pointer">
            <BookOpen className="h-4 w-4 mr-2" />
            <span className="text-sm">Chapters ({chapters.length})</span>
          </TabsTrigger>
          <TabsTrigger value="lectures" className="cursor-pointer">
            <Video className="h-4 w-4 mr-2" />
            <span className="text-sm">Lectures ({videos.lectures.length})</span>
          </TabsTrigger>
          <TabsTrigger value="dpp_videos" className="cursor-pointer">
            <PlayCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">DPP Videos ({videos.dpp_videos.length})</span>
          </TabsTrigger>
          <TabsTrigger value="materials" className="cursor-pointer">
            <FileText className="h-4 w-4 mr-2" />
            <span className="text-sm">Materials ({studyMaterials.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Chapters Tab */}
        <TabsContent value="chapters" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Chapters</h3>
            {!readOnly && (
              <Dialog open={showAddChapterDialog} onOpenChange={setShowAddChapterDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Chapter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Chapter</DialogTitle>
                  <DialogDescription>
                    Create a new chapter for this subject
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chapter-name">Chapter Name</Label>
                    <Input
                      id="chapter-name"
                      value={chapterFormData.name}
                      onChange={(e) => setChapterFormData({ ...chapterFormData, name: e.target.value })}
                      placeholder="e.g., Introduction to Mechanics"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chapter-description">Description</Label>
                    <Textarea
                      id="chapter-description"
                      value={chapterFormData.description}
                      onChange={(e) => setChapterFormData({ ...chapterFormData, description: e.target.value })}
                      placeholder="Brief description of the chapter"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimated-hours">Estimated Hours</Label>
                      <Input
                        id="estimated-hours"
                        type="number"
                        value={chapterFormData.estimated_hours}
                        onChange={(e) => setChapterFormData({ ...chapterFormData, estimated_hours: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chapter-status">Status</Label>
                      <Select
                        value={chapterFormData.status}
                        onValueChange={(value) => setChapterFormData({ ...chapterFormData, status: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">Not Started</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddChapterDialog(false);
                      resetChapterForm();
                    }}
                    disabled={submitting}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddChapter} disabled={submitting} className="cursor-pointer">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Chapter'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            )}

            {/* Edit Chapter Dialog */}
            {!readOnly && (
              <Dialog open={showEditChapterDialog} onOpenChange={setShowEditChapterDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Chapter</DialogTitle>
                    <DialogDescription>
                      Update the chapter information
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-chapter-name">Chapter Name</Label>
                      <Input
                        id="edit-chapter-name"
                        value={chapterFormData.name}
                        onChange={(e) => setChapterFormData({ ...chapterFormData, name: e.target.value })}
                        placeholder="e.g., Introduction to Mechanics"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-chapter-description">Description</Label>
                      <Textarea
                        id="edit-chapter-description"
                        value={chapterFormData.description}
                        onChange={(e) => setChapterFormData({ ...chapterFormData, description: e.target.value })}
                        placeholder="Brief description of the chapter"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-estimated-hours">Estimated Hours</Label>
                        <Input
                          id="edit-estimated-hours"
                          type="number"
                          value={chapterFormData.estimated_hours}
                          onChange={(e) => setChapterFormData({ ...chapterFormData, estimated_hours: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-chapter-status">Status</Label>
                        <Select
                          value={chapterFormData.status}
                          onValueChange={(value) => setChapterFormData({ ...chapterFormData, status: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_started">Not Started</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowEditChapterDialog(false);
                        resetChapterForm();
                      }}
                      disabled={submitting}
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleEditChapter} disabled={submitting} className="cursor-pointer">
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Chapter'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading chapters...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {chapters.map((chapter, index) => (
                <Card key={chapter.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <Link 
                            href={`${readOnly ? '/student' : '/admin'}/batches/${batchId}/subjects/${subject.id}/chapters/${chapter.id}`}
                            className="cursor-pointer hover:text-blue-600 transition-colors"
                          >
                            <CardTitle className="text-lg hover:underline">{chapter.name}</CardTitle>
                          </Link>
                          {chapter.description && (
                            <p className="text-sm text-muted-foreground mt-1">{chapter.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(chapter.status)}>
                          {chapter.status.replace("_", " ")}
                        </Badge>
                          {!readOnly && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="cursor-pointer"
                                onClick={() => openEditChapterDialog(chapter)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="cursor-pointer"
                                onClick={() => handleDeleteChapter(chapter)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        <Link href={`${readOnly ? '/student' : '/admin'}/batches/${batchId}/subjects/${subject.id}/chapters/${chapter.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {chapter.estimated_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{chapter.estimated_hours}h estimated</span>
                        </div>
                      )}
                      {chapter.completion_date && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Completed on {new Date(chapter.completion_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{studyMaterials.filter(m => m.chapter_id === chapter.id).length} materials</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {chapters.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No chapters added yet</h3>
                    <p className="text-gray-600 mb-4">
                      {readOnly ? "Chapters will appear here when your instructor adds them." : "Start organizing your subject by adding chapters."}
                    </p>
                    {!readOnly && (
                      <Button onClick={() => setShowAddChapterDialog(true)} className="cursor-pointer">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Chapter
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Lectures Tab */}
        <TabsContent value="lectures" className="space-y-4">
            <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Lecture Videos</h3>
            {!readOnly && (
              <Button size="sm" className="cursor-pointer" onClick={() => setShowLectureUploadDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lecture
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading lectures...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.lectures.map((video) => (
                <Card key={video.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium leading-tight">
                            {video.title}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(video.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="cursor-pointer h-6 w-6 p-0"
                          onClick={() => handlePlayVideo(video)}
                          title="Play video"
                        >
                          <PlayCircle className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="cursor-pointer h-6 w-6 p-0"
                          onClick={() => window.open(video.video_url, '_blank')}
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {video.description && (
                        <p className="text-xs text-muted-foreground">{video.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{video.video_source}</span>
                        {video.file_size && (
                          <span>{Math.round(video.file_size / (1024 * 1024))}MB</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {videos.lectures.length === 0 && (
                <div className="col-span-full">
                      <Card>
                        <CardContent className="text-center py-12">
                          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No lecture videos yet</h3>
                          <p className="text-gray-600 mb-4">
                            Lecture videos will appear here when your instructor adds them.
                          </p>
                          {!readOnly && (
                            <Button onClick={() => setShowLectureUploadDialog(true)} className="cursor-pointer">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Lecture
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* DPP Videos Tab */}
        <TabsContent value="dpp_videos" className="space-y-4">
            <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">DPP Solution Videos</h3>
            {!readOnly && (
              <Button size="sm" className="cursor-pointer" onClick={() => setShowDppVideoUploadDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add DPP Video
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading DPP videos...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.dpp_videos.map((video) => (
                <Card key={video.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-green-500" />
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium leading-tight">
                            {video.title}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(video.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="cursor-pointer h-6 w-6 p-0"
                          onClick={() => handlePlayVideo(video)}
                          title="Play video"
                        >
                          <PlayCircle className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="cursor-pointer h-6 w-6 p-0"
                          onClick={() => window.open(video.video_url, '_blank')}
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {video.description && (
                        <p className="text-xs text-muted-foreground">{video.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{video.video_source}</span>
                        {video.file_size && (
                          <span>{Math.round(video.file_size / (1024 * 1024))}MB</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {videos.dpp_videos.length === 0 && (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="text-center py-12">
                      <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No DPP solution videos yet</h3>
                      <p className="text-gray-600 mb-4">
                        Upload or add links to DPP solution videos to help students with practice problems.
                      </p>
                      {!readOnly && (
                        <Button onClick={() => setShowDppVideoUploadDialog(true)} className="cursor-pointer">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First DPP Video
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Study Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
            <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Study Materials</h3>
            {!readOnly && (
              <Dialog open={showAddMaterialDialog} onOpenChange={setShowAddMaterialDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Material
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Study Material</DialogTitle>
                  <DialogDescription>
                    Upload or link study materials for this subject
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="material-name">Material Name</Label>
                    <Input
                      id="material-name"
                      value={materialFormData.name}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, name: e.target.value })}
                      placeholder="e.g., Chapter 1 Notes.pdf"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="material-type">Type</Label>
                      <Select
                        value={materialFormData.type}
                        onValueChange={(value) => setMaterialFormData({ ...materialFormData, type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="presentation">Presentation</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="notes">Notes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="material-chapter">Chapter</Label>
                      <Select
                        value={materialFormData.chapter_id}
                        onValueChange={(value) => setMaterialFormData({ ...materialFormData, chapter_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select chapter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">General (No specific chapter)</SelectItem>
                          {chapters.map((chapter) => (
                            <SelectItem key={chapter.id} value={chapter.id}>
                              {chapter.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="material-description">Description</Label>
                    <Textarea
                      id="material-description"
                      value={materialFormData.description}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, description: e.target.value })}
                      placeholder="Brief description of the material"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddMaterialDialog(false);
                      resetMaterialForm();
                    }}
                    disabled={submitting}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddMaterial} disabled={submitting} className="cursor-pointer">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Material'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading study materials...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studyMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getMaterialIcon(material.type)}
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium leading-tight">
                            {material.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getChapterName(material.chapter_id)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="cursor-pointer h-6 w-6 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                        {material.is_downloadable && (
                          <Button variant="ghost" size="sm" className="cursor-pointer h-6 w-6 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {material.description && (
                        <p className="text-xs text-muted-foreground">{material.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {material.file_size && <span>{material.file_size}</span>}
                        {material.upload_date && (
                          <span>{new Date(material.upload_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {studyMaterials.length === 0 && (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No study materials yet</h3>
                      <p className="text-gray-600 mb-4">
                        Add study materials like PDFs, videos, and assignments to help students learn.
                      </p>
                      {!readOnly && (
                        <Button onClick={() => setShowAddMaterialDialog(true)} className="cursor-pointer">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Material
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Video Upload Dialogs */}
      <VideoUploadDialog
        isOpen={showLectureUploadDialog}
        onClose={() => setShowLectureUploadDialog(false)}
        onVideoAdded={() => {
          loadVideos();
          setShowLectureUploadDialog(false);
        }}
        batchId={batchId}
        subjectId={subject.id}
        chapters={chapters}
        videoType="lecture"
        title="Lecture Video"
      />

      <VideoUploadDialog
        isOpen={showDppVideoUploadDialog}
        onClose={() => setShowDppVideoUploadDialog(false)}
        onVideoAdded={() => {
          loadVideos();
          setShowDppVideoUploadDialog(false);
        }}
        batchId={batchId}
        subjectId={subject.id}
        chapters={chapters}
        videoType="dpp_video"
        title="DPP Solution Video"
      />

      {/* Video Playback Dialog */}
      {selectedVideo && (
        <VideoPlaybackDialog
          video={selectedVideo}
          isOpen={showVideoPlayback}
          onClose={() => {
            setShowVideoPlayback(false);
            setSelectedVideo(null);
          }}
        />
      )}
    </div>
  );
}