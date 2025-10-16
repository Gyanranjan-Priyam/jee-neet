"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Video, 
  PlayCircle, 
  Loader2, 
  Upload, 
  Cloud, 
  Link as LinkIcon, 
  CheckCircle2, 
  X 
} from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface Chapter {
  id: string;
  name: string;
}

interface VideoUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoAdded: () => void;
  batchId: string;
  subjectId: string;
  chapterId?: string;
  chapters: Chapter[];
  videoType: "lecture" | "dpp_video";
  title: string;
}

export function VideoUploadDialog({
  isOpen,
  onClose,
  onVideoAdded,
  batchId,
  subjectId,
  chapterId,
  chapters,
  videoType,
  title
}: VideoUploadDialogProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "link">("upload");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    video_source: "youtube" as "youtube" | "google_drive" | "direct_link" | "cloudinary",
    chapter_id: chapterId || "general",
    order_index: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      video_url: "",
      video_source: "youtube",
      chapter_id: chapterId || "general",
      order_index: 0
    });
    setSelectedFile(null);
    setUploadProgress(0);
    setActiveTab("upload");
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid video file (MP4, AVI, MOV, WMV, FLV, WebM)');
      return;
    }

    // Validate file size (200MB limit for videos)
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 200MB');
      return;
    }

    setSelectedFile(file);
    
    // Auto-fill title from filename if empty
    if (!formData.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setFormData(prev => ({ ...prev, title: nameWithoutExt }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !formData.title.trim()) {
      toast.error('Please select a video file and enter a title');
      return;
    }

    setIsLoading(true);
    try {
      // Upload video to Cloudinary
      const videoUrl = await uploadToCloudinary(selectedFile, setUploadProgress);
      
      // Determine the chapter ID to use
      const targetChapterId = formData.chapter_id === "general" ? chapterId : formData.chapter_id;
      
      // Create video record in database
      const response = await fetch(
        `/api/batches/${batchId}/subjects/${subjectId}/chapters/${targetChapterId || chapterId}/videos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            video_url: videoUrl,
            video_type: videoType,
            video_source: 'cloudinary',
            order_index: formData.order_index,
            file_size: selectedFile.size,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save video');
      }

      toast.success('Video uploaded successfully!');
      onVideoAdded();
      handleClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload video');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.video_url.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.video_url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);

    try {
      // Determine the chapter ID to use
      const targetChapterId = formData.chapter_id === "general" ? chapterId : formData.chapter_id;
      
      const response = await fetch(
        `/api/batches/${batchId}/subjects/${subjectId}/chapters/${targetChapterId || chapterId}/videos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            video_url: formData.video_url,
            video_source: formData.video_source,
            video_type: videoType,
            order_index: formData.order_index
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add video");
      }

      toast.success("Video link added successfully");
      onVideoAdded();
      handleClose();
    } catch (error) {
      console.error("Error adding video:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add video");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const getPlaceholderUrl = () => {
    switch (formData.video_source) {
      case "youtube":
        return "https://www.youtube.com/watch?v=...";
      case "google_drive":
        return "https://drive.google.com/file/d/.../view";
      default:
        return "https://example.com/video.mp4";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {videoType === "lecture" ? (
              <Video className="h-5 w-5" />
            ) : (
              <PlayCircle className="h-5 w-5" />
            )}
            Add {title}
          </DialogTitle>
          <DialogDescription>
            Upload a video file to Cloudinary or add a video link from YouTube, Google Drive, or other platforms
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "upload" | "link")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Upload Video
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Video Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : selectedFile
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {selectedFile ? (
                <div className="space-y-3">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                  <div>
                    <p className="font-medium text-green-800">{selectedFile.name}</p>
                    <p className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium">Drop your video here</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    Supports: MP4, AVI, MOV, WMV, FLV, WebM (Max: 200MB)
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                    id="video-upload"
                    disabled={isLoading}
                  />
                  <label htmlFor="video-upload">
                    <Button variant="outline" disabled={isLoading} asChild>
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </span>
                    </Button>
                  </label>
                </div>
              )}

              {isLoading && uploadProgress > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video_source">Video Source</Label>
                <Select
                  value={formData.video_source}
                  onValueChange={(value: "youtube" | "google_drive" | "direct_link") =>
                    setFormData(prev => ({ ...prev, video_source: value }))
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="google_drive">Google Drive</SelectItem>
                    <SelectItem value="direct_link">Direct Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">Video URL *</Label>
                <Input
                  id="video_url"
                  type="url"
                  placeholder={getPlaceholderUrl()}
                  value={formData.video_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  disabled={isLoading}
                  required
                />
              </div>
            </form>
          </TabsContent>
        </Tabs>

        {/* Common Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-title">Title *</Label>
            <Input
              id="video-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={`Enter ${videoType === "lecture" ? "lecture" : "DPP video"} title`}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-description">Description</Label>
            <Textarea
              id="video-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter video description (optional)"
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video-chapter">Chapter</Label>
              <Select
                value={formData.chapter_id}
                onValueChange={(value) => setFormData({ ...formData, chapter_id: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General (No specific chapter)</SelectItem>
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-order">Order Index</Label>
              <Input
                id="video-order"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                placeholder="0"
                disabled={isLoading}
                min="0"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={activeTab === "upload" ? handleUploadSubmit : handleSubmit}
            disabled={isLoading || (activeTab === "upload" && !selectedFile) || !formData.title.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {activeTab === "upload" ? "Uploading..." : "Saving..."}
              </>
            ) : (
              <>
                {activeTab === "upload" ? "Upload Video" : "Add Video Link"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}