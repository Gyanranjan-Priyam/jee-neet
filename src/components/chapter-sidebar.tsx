"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft
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
}

interface ChapterSidebarProps {
  chapters: Chapter[];
  currentChapterId: string;
  batchId: string;
  subjectId: string;
  subjectName: string;
  isStudentView?: boolean;
}

export function ChapterSidebar({ 
  chapters, 
  currentChapterId, 
  batchId, 
  subjectId, 
  subjectName,
  isStudentView = false
}: ChapterSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Persist collapsed state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('chapterSidebarCollapsed');
    if (savedState !== null) {
      setCollapsed(JSON.parse(savedState));
    }
  }, []);

  const handleToggleCollapsed = (newState: boolean) => {
    setCollapsed(newState);
    localStorage.setItem('chapterSidebarCollapsed', JSON.stringify(newState));
  };



  const currentChapterIndex = chapters.findIndex(ch => ch.id === currentChapterId);
  const previousChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

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
              href={`/admin/batches/${batchId}/subjects/${subjectId}/chapters/${chapter.id}`}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                chapter.id === currentChapterId
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title={chapter.name}
            >
              {chapter.order_index}
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
            href={`${isStudentView ? '/student' : '/admin'}/batches/${batchId}/subjects/${subjectId}`}
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
            {chapters.length} chapters
          </p>
        </div>
      </div>



      {/* Chapters List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-3">
            {chapters.map((chapter) => {
              const isActive = chapter.id === currentChapterId;
              
              return (
                <Link
                  key={chapter.id}
                  href={`/admin/batches/${batchId}/subjects/${subjectId}/chapters/${chapter.id}`}
                  className={`block p-3 rounded-md cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    isActive ? "bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 font-semibold text-xs flex-shrink-0">
                      {chapter.order_index}
                    </div>
                    <span className={`font-medium text-sm truncate ${
                      isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"
                    }`} title={chapter.name}>
                      {chapter.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Navigation Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between gap-2">
          {previousChapter ? (
            <Link
              href={`${isStudentView ? '/student' : '/admin'}/batches/${batchId}/subjects/${subjectId}/chapters/${previousChapter.id}`}
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
          
          {nextChapter ? (
            <Link
              href={`${isStudentView ? '/student' : '/admin'}/batches/${batchId}/subjects/${subjectId}/chapters/${nextChapter.id}`}
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