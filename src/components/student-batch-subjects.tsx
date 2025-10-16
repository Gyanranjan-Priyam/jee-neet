"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen, 
  GraduationCap,
  Loader2,
  ChevronRight,
  Eye,
  Lock,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Subject {
  id: string;
  name: string;
  teacher_name?: string;
  status: "not_started" | "in_progress" | "completed";
  created_at?: string;
  updated_at?: string;
  batch_id: string;
  description?: string;
  estimated_hours?: number;
  difficulty?: string;
  total_topics: number;
  is_locked: boolean;
  access_message?: string;
  progress?: {
    progress_percentage: number;
    completed_topics: number;
    total_topics: number;
  };
}

interface StudentBatchSubjectsProps {
  batchId: string;
  category: "JEE" | "NEET";
  classType: "11th" | "12th" | "Dropper";
}

export function StudentBatchSubjects({ batchId, category, classType }: StudentBatchSubjectsProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch subjects from API
  useEffect(() => {
    fetchSubjects();
  }, [batchId]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching subjects for batch: ${batchId}`);
      
      const response = await fetch(`/api/batches/${batchId}/subjects`);
      
      console.log(`📡 Response status: ${response.status}`);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ API Error:', error);
        throw new Error(error.error || `HTTP ${response.status}: Failed to fetch subjects`);
      }
      
      const data = await response.json();
      console.log('✅ Subjects data:', data);
      
      setSubjects(data.subjects || []);
      
      if (data.subjects && data.subjects.length > 0) {
        console.log(`📚 Found ${data.subjects.length} subjects:`);
        data.subjects.forEach((subject: Subject, index: number) => {
          console.log(`  ${index + 1}. ${subject.name} (${subject.is_locked ? 'Locked' : 'Unlocked'})`);
        });
      } else {
        console.log('📭 No subjects found');
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching subjects:', error);
      toast.error(error.message || 'Failed to load subjects');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_started":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <div className="h-4 w-4 rounded-full bg-blue-600 animate-pulse" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const handleSubjectClick = (subject: Subject) => {
    // If locked, show enrollment message
    if (subject.is_locked) {
      toast.error(subject.access_message || 'Please enroll to access this subject');
      return;
    }
    
    // Navigate to student subject view page
    router.push(`/student/batches/${batchId}/subjects/${subject.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Subjects & Curriculum
          </h3>
          <p className="text-muted-foreground text-sm">
            Your {category} {classType} subjects and learning progress
          </p>
        </div>
      </div>

      {/* Learning Progress Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <BookOpen className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Study Mode:</strong> Click on any subject to view chapters, videos, and materials. 
          Track your progress as you complete each topic.
        </AlertDescription>
      </Alert>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading subjects...</span>
        </div>
      )}

      {/* Subjects Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card 
              key={subject.id} 
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => handleSubjectClick(subject)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <CardTitle className={`text-lg transition-colors ${subject.is_locked ? 'text-gray-500' : 'group-hover:text-blue-600'}`}>
                      {subject.name}
                    </CardTitle>
                    {subject.is_locked && <Lock className="h-4 w-4 text-gray-400" />}
                    <ChevronRight className={`h-4 w-4 ml-auto transition-colors ${subject.is_locked ? 'text-gray-300' : 'text-gray-400 group-hover:text-blue-600'}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subject.description && (
                    <p className={`text-sm ${subject.is_locked ? 'text-gray-400' : 'text-gray-600'}`}>
                      {subject.description}
                    </p>
                  )}

                  {subject.teacher_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span>Teacher: {subject.teacher_name}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(subject.status)}
                      <Badge className={getStatusColor(subject.status)}>
                        {subject.status.replace("_", " ").charAt(0).toUpperCase() + subject.status.replace("_", " ").slice(1)}
                      </Badge>
                      {subject.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {subject.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Topics: {subject.total_topics}</span>
                      <span>Created: {subject.created_at ? new Date(subject.created_at).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    {subject.estimated_hours && (
                      <span>Duration: {subject.estimated_hours}h</span>
                    )}
                  </div>

                  {/* Progress Section - Only for enrolled students */}
                  {!subject.is_locked && subject.progress && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">Progress</span>
                        <span className="text-xs text-gray-600">
                          {subject.progress.completed_topics}/{subject.progress.total_topics} topics
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${subject.progress.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Access Message for Locked Subjects */}
                  {subject.is_locked && subject.access_message && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 text-xs text-amber-600">
                        <Lock className="h-3 w-3" />
                        <span>{subject.access_message}</span>
                      </div>
                    </div>
                  )}

                  {/* Study Action */}
                  <div className="pt-2 border-t">
                    <Button 
                      variant={subject.is_locked ? "outline" : "outline"}
                      size="sm" 
                      className={`w-full transition-colors ${
                        subject.is_locked 
                          ? 'text-gray-500 border-gray-200 cursor-not-allowed hover:bg-gray-50' 
                          : 'group-hover:bg-blue-50 group-hover:border-blue-200'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubjectClick(subject);
                      }}
                      disabled={subject.is_locked}
                    >
                      {subject.is_locked ? (
                        <>
                          <Lock className="h-4 w-4 mr-1" />
                          Locked
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Study Subject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && subjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No subjects available yet</h3>
            <p className="text-gray-600 mb-4">
              Your instructor hasn't added any subjects to this batch yet. 
              Subjects and learning materials will appear here once they are added.
            </p>
            <div className="text-sm text-gray-500">
              Check back later or contact your instructor for updates.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview */}
      {!loading && subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Learning Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {subjects.filter(s => s.status === 'not_started').length}
                </div>
                <div className="text-sm text-gray-500">Not Started</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {subjects.filter(s => s.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {subjects.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span>
                  {Math.round((subjects.filter(s => s.status === 'completed').length / subjects.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${(subjects.filter(s => s.status === 'completed').length / subjects.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}