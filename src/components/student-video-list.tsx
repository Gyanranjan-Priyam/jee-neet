"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, PlayCircle, Youtube, HardDrive, Link as LinkIcon, Play, ExternalLink, CheckCircle, Clock } from "lucide-react";
import { VideoPlayerDialog } from "@/components/video-player-dialog";

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  video_source: "youtube" | "google_drive" | "direct_link" | "cloudinary";
  video_type: "lecture" | "dpp_video";
  order_index: number;
  created_at: string;
  // Student-specific fields
  is_watched?: boolean;
  watch_progress?: number;
  duration?: number;
}

interface StudentVideoListProps {
  videos: VideoItem[];
  videoType: "lecture" | "dpp_video";
  onVideoWatched?: (videoId: string) => void;
}

export function StudentVideoList({ 
  videos, 
  videoType,
  onVideoWatched
}: StudentVideoListProps) {
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  const handlePlayVideo = (video: VideoItem) => {
    setPlayingVideo(video);
    // Track video as watched when played
    if (onVideoWatched && !video.is_watched) {
      onVideoWatched(video.id);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "youtube":
        return <Youtube className="h-4 w-4 text-red-500" />;
      case "google_drive":
        return <HardDrive className="h-4 w-4 text-blue-500" />;
      case "cloudinary":
        return <Video className="h-4 w-4 text-orange-500" />;
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
      case "cloudinary":
        return "Video";
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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              ? "Lecture videos for this chapter will appear here when your instructor adds them."
              : "Daily Practice Problem solution videos will appear here when available."
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    videoType === "lecture" 
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-green-100 dark:bg-green-900"
                  }`}>
                    <span className={`text-sm font-semibold ${
                      videoType === "lecture"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-green-600 dark:text-green-400"
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {video.title}
                      {video.is_watched && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </CardTitle>
                    {video.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handlePlayVideo(video)}
                    className={`text-white ${
                      videoType === "lecture"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {video.is_watched ? "Watch Again" : "Play"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(video.video_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Video metadata */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  {getSourceIcon(video.video_source)}
                  <span>{getSourceLabel(video.video_source)}</span>
                </div>
                <span>Added {formatDate(video.created_at)}</span>
                {video.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                )}
                {video.watch_progress && video.watch_progress > 0 && video.watch_progress < 100 && (
                  <Badge variant="outline" className="text-xs">
                    {video.watch_progress}% watched
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

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