"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Video, PlayCircle, Edit, Trash2, MoreVertical, Youtube, HardDrive, Link as LinkIcon, Play } from "lucide-react";
import { toast } from "sonner";
import { VideoEditDialog } from "@/components/video-edit-dialog";
import { VideoPlayerDialog } from "@/components/video-player-dialog";

interface VideoItem {
  id: string;
  title: string;
  video_url: string;
  video_source: "youtube" | "google_drive" | "direct_link";
  order_index: number;
  created_at: string;
}

interface VideoListProps {
  videos: VideoItem[];
  videoType: "lecture" | "dpp_video";
  onVideoDeleted: () => void;
  batchId: string;
  subjectId: string;
  chapterId: string;
}

export function VideoList({ 
  videos, 
  videoType, 
  onVideoDeleted,
  batchId,
  subjectId,
  chapterId 
}: VideoListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  const handleDeleteVideo = async (videoId: string) => {
    if (deletingId) return;
    
    setDeletingId(videoId);
    
    try {
      const response = await fetch(
        `/api/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/videos/${videoId}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete video");
      }

      toast.success("Video deleted successfully");
      onVideoDeleted();
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete video");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditVideo = (video: VideoItem) => {
    setEditingVideo(video);
  };

  const handleVideoUpdated = () => {
    setEditingVideo(null);
    onVideoDeleted(); // Refresh the video list
  };

  const handlePlayVideo = (video: VideoItem) => {
    setPlayingVideo(video);
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

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "youtube":
        return "YouTube";
      case "google_drive":
        return "Google Drive";
      default:
        return "Direct Link";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (videos.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          {videoType === "lecture" ? (
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          ) : (
            <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No {videoType === "lecture" ? "lectures" : "DPP videos"} yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {videoType === "lecture" 
              ? "Add video lectures to help students understand this chapter."
              : "Add solution videos for daily practice problems."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {videos.map((video, index) => (
          <Card key={video.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex h-2 items-center justify-between">
              <div className="flex h-2 items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 mt-auto mb-auto rounded-full bg-blue-100 dark:bg-blue-900">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 mt-auto mb-auto">
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                </div>
              </div>
              
              <div className="flex items-center mt-auto mb-auto gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handlePlayVideo(video)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditVideo(video)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Video
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteVideo(video.id)}
                      disabled={deletingId === video.id}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deletingId === video.id ? "Deleting..." : "Delete Video"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          </Card>
        ))}
      </div>

      {editingVideo && (
        <VideoEditDialog
          isOpen={!!editingVideo}
          onClose={() => setEditingVideo(null)}
          onVideoUpdated={handleVideoUpdated}
          video={editingVideo}
          batchId={batchId}
          subjectId={subjectId}
          chapterId={chapterId}
        />
      )}

      {playingVideo && (
        <VideoPlayerDialog
          isOpen={!!playingVideo}
          onClose={() => setPlayingVideo(null)}
          video={playingVideo}
        />
      )}
    </>
  );
}