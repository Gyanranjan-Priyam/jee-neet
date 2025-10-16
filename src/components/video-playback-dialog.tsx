"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Download,
  X,
  Video as VideoIcon,
  Calendar,
  User,
  Clock,
} from "lucide-react";
import { VideoPlayer } from "./video-player";
import type Player from "video.js/dist/types/player";

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

interface VideoPlaybackDialogProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoPlaybackDialog({
  video,
  isOpen,
  onClose,
}: VideoPlaybackDialogProps) {
  const [player, setPlayer] = useState<Player | null>(null);

  if (!video) return null;

  const handlePlayerReady = (playerInstance: Player) => {
    setPlayer(playerInstance);
  };

  const handleDownload = () => {
    if (video.video_source === "cloudinary" && video.video_url) {
      // For Cloudinary videos, create download link
      const link = document.createElement("a");
      link.href = video.video_url;
      link.download = `${video.title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For other sources, open in new tab
      window.open(video.video_url, "_blank");
    }
  };

  const handleOpenExternal = () => {
    window.open(video.video_url, "_blank");
  };

  const getVideoUrl = (video: Video): string => {
    // Handle different video sources
    switch (video.video_source) {
      case "youtube":
        // Convert YouTube embed URL to direct playable URL if needed
        if (video.video_url.includes("youtube.com/embed/")) {
          const videoId = video.video_url.split("/embed/")[1]?.split("?")[0];
          return `https://www.youtube.com/watch?v=${videoId}`;
        }
        return video.video_url;
      
      case "google_drive":
        // For Google Drive, we might need to convert to direct playback URL
        return video.video_url;
      
      case "cloudinary":
      case "direct_link":
      default:
        return video.video_url;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  const getSourceIcon = () => {
    switch (video.video_source) {
      case "youtube":
        return "🎬";
      case "google_drive":
        return "💾";
      case "cloudinary":
        return "☁️";
      default:
        return "🔗";
    }
  };

  const getSourceLabel = () => {
    switch (video.video_source) {
      case "youtube":
        return "YouTube";
      case "google_drive":
        return "Google Drive";
      case "cloudinary":
        return "Cloudinary";
      case "direct_link":
        return "Direct Link";
      default:
        return "External";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold mb-2 flex items-center gap-2">
                <VideoIcon className="h-5 w-5 text-blue-600" />
                {video.title}
              </DialogTitle>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {getSourceIcon()} {getSourceLabel()}
                </Badge>
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                </div>
                
                {video.file_size && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatFileSize(video.file_size)}</span>
                  </div>
                )}
                
                <Badge variant={video.video_type === "lecture" ? "default" : "secondary"}>
                  {video.video_type === "lecture" ? "Lecture" : "DPP Video"}
                </Badge>
              </div>
              
              {video.description && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                  {video.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                {video.video_source === "cloudinary" ? "Download" : "Open"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenExternal}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                External
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Video Player */}
        <div className="p-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {video.video_source === "youtube" ? (
              // For YouTube videos, use iframe
              <iframe
                src={video.video_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.title}
              />
            ) : video.video_source === "google_drive" ? (
              // For Google Drive videos, use iframe
              <iframe
                src={video.video_url}
                className="w-full h-full"
                allow="autoplay"
                title={video.title}
              />
            ) : (
              // For direct links and Cloudinary, use Video.js
              <VideoPlayer
                src={getVideoUrl(video)}
                title={video.title}
                poster={video.thumbnail_url}
                className="w-full h-full"
                responsive={true}
                controls={true}
                onReady={handlePlayerReady}
                onPlay={() => console.log("Video started playing")}
                onPause={() => console.log("Video paused")}
                onEnded={() => console.log("Video ended")}
              />
            )}
          </div>
          
          {/* Video Details */}
          {video.description && (
            <div className="mt-6">
              <h4 className="font-medium text-sm mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {video.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}