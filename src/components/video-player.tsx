"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

// Import Video.js player type
import type Player from "video.js/dist/types/player";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  controls?: boolean;
  responsive?: boolean;
  onReady?: (player: Player) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export function VideoPlayer({
  src,
  poster,
  title,
  className = "",
  width = 640,
  height = 360,
  autoplay = false,
  controls = true,
  responsive = true,
  onReady,
  onPlay,
  onPause,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = videojs(videoElement, {
        width,
        height,
        controls,
        responsive,
        fluid: responsive,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        poster,
        preload: "metadata",
        sources: [
          {
            src,
            type: getVideoType(src),
          },
        ],
        html5: {
          vhs: {
            overrideNative: true,
          },
        },
        techOrder: ["html5"],
      });

      playerRef.current = player;

      // Player event listeners
      player.ready(() => {
        setIsLoading(false);
        onReady?.(player);
      });

      player.on("play", () => {
        onPlay?.();
      });

      player.on("pause", () => {
        onPause?.();
      });

      player.on("ended", () => {
        onEnded?.();
      });

      player.on("error", () => {
        const error = player.error();
        if (error) {
          setError(`Video playback error: ${error.message || "Unknown error"}`);
        }
      });

      // Handle autoplay
      if (autoplay) {
        player.ready(() => {
          const promise = player.play();
          if (promise !== undefined) {
            promise.catch((error) => {
              console.warn("Autoplay was prevented:", error);
            });
          }
        });
      }
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, width, height, controls, responsive, poster, autoplay, onReady, onPlay, onPause, onEnded]);

  // Update source when src changes
  useEffect(() => {
    if (playerRef.current && !playerRef.current.isDisposed()) {
      playerRef.current.src([
        {
          src,
          type: getVideoType(src),
        },
      ]);
    }
  }, [src]);

  const getVideoType = (url: string): string => {
    if (url.includes(".m3u8")) return "application/x-mpegURL";
    if (url.includes(".mpd")) return "application/dash+xml";
    if (url.includes(".mp4")) return "video/mp4";
    if (url.includes(".webm")) return "video/webm";
    if (url.includes(".ogg")) return "video/ogg";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "video/youtube";
    if (url.includes("vimeo.com")) return "video/vimeo";
    return "video/mp4"; // Default fallback
  };

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <div className="text-red-600 mb-2">⚠️ Video Error</div>
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            // Reinitialize player
            if (playerRef.current) {
              playerRef.current.dispose();
              playerRef.current = null;
            }
          }}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`video-player-wrapper ${className}`}>
      {title && (
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div 
        ref={videoRef} 
        className="video-js-container"
        style={{ width: responsive ? "100%" : width, height: responsive ? "auto" : height }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading video...</p>
          </div>
        </div>
      )}
    </div>
  );
}