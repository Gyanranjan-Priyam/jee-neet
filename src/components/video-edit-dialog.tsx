"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Youtube, HardDrive, Link as LinkIcon } from "lucide-react";

interface VideoEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoUpdated: () => void;
  video: {
    id: string;
    title: string;
    video_url: string;
    video_source: "youtube" | "google_drive" | "direct_link";
  };
  batchId: string;
  subjectId: string;
  chapterId: string;
}

export function VideoEditDialog({
  isOpen,
  onClose,
  onVideoUpdated,
  video,
  batchId,
  subjectId,
  chapterId,
}: VideoEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: video.title,
    video_url: video.video_url,
    video_source: video.video_source,
  });

  // Auto-detect video source based on URL
  const detectVideoSource = (url: string): "youtube" | "google_drive" | "direct_link" => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('drive.google.com')) {
      return 'google_drive';
    }
    return 'direct_link';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.video_url.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/videos/${video.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update video");
      }

      toast.success("Video updated successfully!");
      onVideoUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating video:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update video");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: video.title,
      video_url: video.video_url,
      video_source: video.video_source,
    });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "youtube":
        return <Youtube className="h-4 w-4 text-red-500" />;
      case "google_drive":
        return <HardDrive className="h-4 w-4 text-blue-500" />;
      default:
        return <LinkIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const isFormChanged = 
    formData.title !== video.title ||
    formData.video_url !== video.video_url ||
    formData.video_source !== video.video_source;

  // Reset form when dialog opens with new video
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        title: video.title,
        video_url: video.video_url,
        video_source: video.video_source,
      });
    }
  }, [isOpen, video]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Video Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter video title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="video_url">
              Video URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="video_url"
              type="url"
              placeholder="Enter video URL"
              value={formData.video_url}
              onChange={(e) => {
                const newUrl = e.target.value;
                const detectedSource = detectVideoSource(newUrl);
                setFormData((prev) => ({ 
                  ...prev, 
                  video_url: newUrl,
                  video_source: detectedSource
                }));
              }}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Video Source */}
          <div className="space-y-2">
            <Label htmlFor="video_source">
              Video Source <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.video_source}
              onValueChange={(value: "youtube" | "google_drive" | "direct_link") =>
                setFormData((prev) => ({ ...prev, video_source: value }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select video source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">
                  <div className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-500" />
                    YouTube
                  </div>
                </SelectItem>
                <SelectItem value="google_drive">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-blue-500" />
                    Google Drive
                  </div>
                </SelectItem>
                <SelectItem value="direct_link">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-gray-500" />
                    Direct Link
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Source Display */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getSourceIcon(formData.video_source)}
              <span>
                {formData.video_source !== video.video_source ? (
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    Auto-detected: {formData.video_source.replace('_', ' ')}
                  </span>
                ) : (
                  `Current source: ${formData.video_source.replace('_', ' ')}`
                )}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting || !isFormChanged}
              className="flex-1"
            >
              Reset Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.video_url.trim() || !isFormChanged}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Video"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}