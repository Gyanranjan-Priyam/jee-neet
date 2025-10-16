"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Clock, 
  Award, 
  Users, 
  Calendar,
  BarChart3,
  FileText,
  PlayCircle,
  GraduationCap,
  Brain,
  ClipboardList,
  Star,
  ChevronRight,
  Activity,
  Zap
} from "lucide-react";

import { SidebarProvider, MinimalSidebar, studentNavItems } from "@/components/minimal-sidebar";
import { PageLoadingIndicator, InlineLoadingIndicator } from "@/components/professional-loading-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalStudyHours: number;
  testsCompleted: number;
  accuracy: number;
  rank: number;
  streak: number;
  totalSubjects: number;
}

interface RecentActivity {
  id: string;
  type: "test" | "study" | "video" | "assignment";
  title: string;
  score?: number;
  duration?: string;
  date: string;
  status: "completed" | "in_progress" | "upcoming";
}

interface SubjectProgress {
  id: string;
  name: string;
  progress: number;
  color: string;
  totalChapters: number;
  completedChapters: number;
  lastStudied: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/student/login");
      return;
    }

    if (user && user.user_metadata?.user_type !== "student") {
      toast.error("Access denied. Student access required.");
      router.push("/student/login");
      return;
    }

    // Load dashboard data
    if (user) {
      loadDashboardData();
    }
  }, [user, loading, router]);

  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true);
      
      // Simulate API calls - replace with real API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock dashboard data
      setStats({
        totalStudyHours: 124,
        testsCompleted: 18,
        accuracy: 84,
        rank: 45,
        streak: 7,
        totalSubjects: 3
      });

      setRecentActivities([
        {
          id: "1",
          type: "test",
          title: "Physics Mock Test - Mechanics",
          score: 87,
          date: "2 hours ago",
          status: "completed"
        },
        {
          id: "2", 
          type: "study",
          title: "Organic Chemistry - Reactions",
          duration: "2.5 hours",
          date: "1 day ago",
          status: "completed"
        },
        {
          id: "3",
          type: "video",
          title: "Calculus - Integration Techniques",
          duration: "45 min",
          date: "2 days ago", 
          status: "completed"
        },
        {
          id: "4",
          type: "assignment",
          title: "Trigonometry Practice Set",
          date: "Tomorrow",
          status: "upcoming"
        }
      ]);

      setSubjectProgress([
        {
          id: "1",
          name: "Physics",
          progress: 78,
          color: "blue",
          totalChapters: 25,
          completedChapters: 19,
          lastStudied: "2 hours ago"
        },
        {
          id: "2",
          name: "Chemistry", 
          progress: 65,
          color: "green",
          totalChapters: 30,
          completedChapters: 20,
          lastStudied: "1 day ago"
        },
        {
          id: "3",
          name: "Mathematics",
          progress: 92,
          color: "purple", 
          totalChapters: 20,
          completedChapters: 18,
          lastStudied: "3 hours ago"
        }
      ]);

      setUpcomingTests([
        {
          id: "1",
          title: "JEE Main Mock Test 5",
          date: "Tomorrow, 10:00 AM",
          duration: "3 hours",
          subjects: ["Physics", "Chemistry", "Math"]
        },
        {
          id: "2", 
          title: "Chemistry Unit Test",
          date: "Dec 20, 2:00 PM",
          duration: "2 hours",
          subjects: ["Chemistry"]
        }
      ]);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/student/login");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "test":
        return <Target className="h-5 w-5" />;
      case "study":
        return <BookOpen className="h-5 w-5" />;
      case "video":
        return <PlayCircle className="h-5 w-5" />;
      case "assignment":
        return <FileText className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "test":
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400";
      case "study":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400";
      case "video":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400";
      case "assignment":
        return "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  if (loading) {
    return <PageLoadingIndicator text="Loading your dashboard..." />;
  }

  if (dashboardLoading) {
    return <PageLoadingIndicator text="Setting up your learning space..." />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <MinimalSidebar
          user={{
            name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student",
            email: user?.email || "student@example.com",
            avatar: user?.user_metadata?.avatar_url
          }}
          navItems={studentNavItems}
          onLogout={handleSignOut}
          type="student"
        />
        
        <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track your learning progress and stay motivated
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden sm:flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {stats?.streak} day streak
              </Badge>
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-6">
          {/* Welcome Banner */}
          <Card className="border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">
                    {getGreeting()}, {user?.user_metadata?.full_name?.split(" ")[0] || "Student"}! 👋
                  </h2>
                  <p className="text-blue-100">
                    You've studied for {stats?.totalStudyHours} hours this month. Keep going!
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 text-right">
                  <div className="text-3xl font-bold">{stats?.accuracy}%</div>
                  <div className="text-sm text-blue-100">Overall Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Study Hours
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.totalStudyHours}
                    </p>
                    <p className="text-xs text-green-600">This month</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Tests Completed
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.testsCompleted}
                    </p>
                    <p className="text-xs text-green-600">+3 this week</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Current Rank
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      #{stats?.rank}
                    </p>
                    <p className="text-xs text-blue-600">Among all students</p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                    <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Study Streak
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.streak} days
                    </p>
                    <p className="text-xs text-purple-600">Keep it up!</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Progress & Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subject Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Subject Progress
                  </CardTitle>
                  <CardDescription>
                    Your learning progress across all subjects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subjectProgress.map((subject) => (
                    <div key={subject.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            subject.color === "blue" && "bg-blue-500",
                            subject.color === "green" && "bg-green-500", 
                            subject.color === "purple" && "bg-purple-500"
                          )} />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {subject.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {subject.progress}%
                          </span>
                          <p className="text-xs text-gray-500">
                            {subject.completedChapters}/{subject.totalChapters} chapters
                          </p>
                        </div>
                      </div>
                      <Progress 
                        value={subject.progress} 
                        className={cn(
                          "h-2",
                          subject.color === "blue" && "[&>div]:bg-blue-500",
                          subject.color === "green" && "[&>div]:bg-green-500",
                          subject.color === "purple" && "[&>div]:bg-purple-500"
                        )} 
                      />
                      <p className="text-xs text-gray-500">
                        Last studied: {subject.lastStudied}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Jump into your learning activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Button
                      className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      onClick={() => router.push("/student/batches")}
                    >
                      <GraduationCap className="h-6 w-6" />
                      <span className="text-sm font-medium">My Batches</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center gap-2 border-2 hover:bg-gray-50"
                      onClick={() => router.push("/student/batches")}
                    >
                      <Brain className="h-6 w-6 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Study Materials</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center gap-2 border-2 hover:bg-gray-50"
                      onClick={() => toast.info("Tests coming soon!")}
                    >
                      <ClipboardList className="h-6 w-6 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Tests</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center gap-2 border-2 hover:bg-gray-50"
                      onClick={() => toast.info("Performance analytics coming soon!")}
                    >
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700">Analytics</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Activities & Tests */}
            <div className="space-y-6">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest learning activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div className={cn("p-2 rounded-full", getActivityColor(activity.type))}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {activity.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {activity.score && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                {activity.score}%
                              </Badge>
                            )}
                            {activity.duration && (
                              <Badge variant="secondary" className="text-xs">
                                {activity.duration}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">{activity.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Tests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Tests
                  </CardTitle>
                  <CardDescription>Don't miss these important tests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingTests.map((test) => (
                      <div key={test.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {test.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {test.date}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {test.duration}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {test.subjects.join(", ")}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        </div>
      </div>
    </SidebarProvider>
  );
}