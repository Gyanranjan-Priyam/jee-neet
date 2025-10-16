"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, Play } from "lucide-react";

interface VideoFallbackProps {
  video: {
    title: string;
    video_url: string;
    video_source: string;
  };
  onOpenExternal: () => void;
}

export function VideoFallback({ video, onOpenExternal }: VideoFallbackProps) {
  return (
    <div className="aspect-video flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="text-center">
        <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {video.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Click to open video in external player
        </p>
        <Button onClick={onOpenExternal}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Video
        </Button>
      </div>
    </div>
  );
}