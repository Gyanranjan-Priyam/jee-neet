"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Youtube, HardDrive, Link as LinkIcon, Video } from "lucide-react";

interface VideoPlayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    video_url: string;
    video_source: "youtube" | "google_drive" | "direct_link" | "cloudinary";
    created_at: string;
  };
}

export function VideoPlayerDialog({
  isOpen,
  onClose,
  video,
}: VideoPlayerDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        return "Cloudinary";
      default:
        return "Direct Link";
    }
  };

  // Convert video URL to embeddable format
  const getEmbedUrl = (url: string, source: string): string => {
    try {
      switch (source) {
        case "youtube":
          // Handle various YouTube URL formats
          const youtubePatterns = [
            /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
          ];
          
          for (const pattern of youtubePatterns) {
            const match = url.match(pattern);
            if (match) {
              return `https://www.youtube.com/embed/${match[1]}?autoplay=1&modestbranding=1&rel=0&fs=1`;
            }
          }
          return url;
          
        case "google_drive":
          // Handle Google Drive URLs
          const drivePatterns = [
            /\/file\/d\/([a-zA-Z0-9-_]+)/,
            /\/open\?id=([a-zA-Z0-9-_]+)/
          ];
          
          for (const pattern of drivePatterns) {
            const match = url.match(pattern);
            if (match) {
              return `https://drive.google.com/file/d/${match[1]}/preview`;
            }
          }
          return url;
          
        case "cloudinary":
          // Cloudinary videos can be embedded directly
          return url;
          
        default:
          // For direct links, try to embed if it's a video file
          if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
            return url;
          }
          return url;
      }
    } catch (error) {
      console.error('Error processing embed URL:', error);
      return url;
    }
  };

  const embedUrl = getEmbedUrl(video.video_url, video.video_source);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setError("Failed to load video");
    setLoading(false);
  };

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black animate-in fade-in duration-300">
      {/* Header */}
      <div className="relative z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white">
              {video.title}
            </h1>
            <Badge variant="outline" className="flex items-center gap-1 border-gray-600">
              {getSourceIcon(video.video_source)}
              <span className="text-gray-300">{getSourceLabel(video.video_source)}</span>
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative w-full h-[calc(100vh-73px)]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading video...</p>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="text-red-400 text-xl mb-4">
                Failed to load video
              </div>
              <p className="text-gray-400 mb-4">
                The video could not be loaded. Please try again.
              </p>
              <Button onClick={onClose} variant="outline">
                Close Player
              </Button>
            </div>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={video.title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
      </div>
    </div>
  );
}