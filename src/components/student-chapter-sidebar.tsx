"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle,
  PlayCircle,
  Clock,
  Lock
} from "lucide-react";

interface Chapter {
  id: string;
  name: string;
  description?: string;
  status: "not_started" | "in_progress" | "completed";
  order_index: number;
  completion_date?: string;
  created_at?: string;
  updated_at?: string;
  is_locked?: boolean;
  progress?: {
    progress_percentage: number;
    videos_watched: number;
    total_videos: number;
    pdfs_viewed: number;
    total_pdfs: number;
  };
}

interface StudentChapterSidebarProps {
  chapters: Chapter[];
  currentChapterId: string;
  batchId: string;
  subjectId: string;
  subjectName: string;
}

export function StudentChapterSidebar({ 
  chapters, 
  currentChapterId, 
  batchId, 
  subjectId, 
  subjectName,
}: StudentChapterSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Persist collapsed state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('studentChapterSidebarCollapsed');
    if (savedState !== null) {
      setCollapsed(JSON.parse(savedState));
    }
  }, []);

  const handleToggleCollapsed = (newState: boolean) => {
    setCollapsed(newState);
    localStorage.setItem('studentChapterSidebarCollapsed', JSON.stringify(newState));
  };

  const currentChapterIndex = chapters.findIndex(ch => ch.id === currentChapterId);
  const previousChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

  const getStatusIcon = (chapter: Chapter) => {
    if (chapter.is_locked) {
      return <Lock className="h-3 w-3 text-gray-400" />;
    }
    
    switch (chapter.status) {
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "in_progress":
        return <PlayCircle className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusColor = (chapter: Chapter) => {
    if (chapter.is_locked) {
      return "text-gray-400";
    }
    
    switch (chapter.status) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  if (collapsed) {
    return (
      <div className="w-12 border-r bg-background flex flex-col">
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleCollapsed(false)}
            className="w-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex flex-col items-center py-4 space-y-2">
          {chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapter.id}`}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors relative ${
                chapter.id === currentChapterId
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                  : chapter.is_locked
                  ? "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title={`${chapter.name}${chapter.is_locked ? ' (Locked)' : ''}`}
            >
              {chapter.order_index}
              {!chapter.is_locked && chapter.status === "completed" && (
                <CheckCircle className="h-3 w-3 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
              )}
              {chapter.is_locked && (
                <Lock className="h-3 w-3 text-gray-400 absolute -top-1 -right-1 bg-white rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <Link
            href={`/student/batches/${batchId}/subjects/${subjectId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subject
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleCollapsed(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <h2 className="font-semibold text-lg truncate" title={subjectName}>
            {subjectName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {chapters.filter(ch => !ch.is_locked).length} available of {chapters.length} chapters
          </p>
        </div>
      </div>

      {/* Chapters List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-3">
            {chapters.map((chapter) => {
              const isActive = chapter.id === currentChapterId;
              const isAccessible = !chapter.is_locked;
              
              const content = (
                <div className={`block p-3 rounded-md transition-all ${
                  isAccessible ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : 'cursor-not-allowed'
                } ${
                  isActive ? "bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500" : ""
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full font-semibold text-xs flex-shrink-0 ${
                      isActive
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                        : chapter.is_locked
                        ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                        : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                    }`}>
                      {chapter.order_index}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium text-sm truncate ${
                          isActive 
                            ? "text-blue-700 dark:text-blue-300" 
                            : chapter.is_locked
                            ? "text-gray-400"
                            : "text-gray-900 dark:text-gray-100"
                        }`} title={chapter.name}>
                          {chapter.name}
                        </span>
                        {getStatusIcon(chapter)}
                      </div>
                      
                      {/* Progress indicator */}
                      {!chapter.is_locked && chapter.progress && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{chapter.progress.progress_percentage}% complete</span>
                          {chapter.progress.total_videos > 0 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {chapter.progress.videos_watched}/{chapter.progress.total_videos} videos
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {chapter.is_locked && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Lock className="h-3 w-3" />
                          <span>Locked</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );

              return isAccessible ? (
                <Link
                  key={chapter.id}
                  href={`/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapter.id}`}
                >
                  {content}
                </Link>
              ) : (
                <div key={chapter.id}>
                  {content}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Navigation Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between gap-2">
          {previousChapter && !previousChapter.is_locked ? (
            <Link
              href={`/student/batches/${batchId}/subjects/${subjectId}/chapters/${previousChapter.id}`}
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="truncate">Prev</span>
              </Button>
            </Link>
          ) : (
            <div className="flex-1">
              <Button variant="outline" size="sm" className="w-full" disabled>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
            </div>
          )}
          
          {nextChapter && !nextChapter.is_locked ? (
            <Link
              href={`/student/batches/${batchId}/subjects/${subjectId}/chapters/${nextChapter.id}`}
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full justify-end">
                <span className="truncate">Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <div className="flex-1">
              <Button variant="outline" size="sm" className="w-full" disabled>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-center">
          <span className="text-xs text-muted-foreground">
            Chapter {currentChapterIndex + 1} of {chapters.length}
          </span>
        </div>
      </div>
    </div>
  );
}