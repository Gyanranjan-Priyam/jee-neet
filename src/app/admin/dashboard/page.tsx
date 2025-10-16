"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { SidebarProvider, MinimalSidebar, adminNavItems } from "@/components/minimal-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  GraduationCap,
  FileText,
  Clock,
  Target
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <MinimalSidebar
          user={{
            name: user?.email?.split('@')[0] || 'Admin',
            email: user?.email || 'admin@example.com'
          }}
          navItems={adminNavItems}
          onLogout={handleLogout}
          type="admin"
        />
        <div className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex h-16 items-center justify-between px-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
          </header>
        
        <div className="flex-1 space-y-4 p-8 pt-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
            <div className="flex items-center space-x-2">
              <Button onClick={() => router.push('/admin/batches')}>
                <Users className="mr-2 h-4 w-4" />
                Manage Batches
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245</div>
                <p className="text-xs text-muted-foreground">
                  +18 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">36</div>
                <p className="text-xs text-muted-foreground">
                  Across all batches
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Batches</CardTitle>
                <CardDescription>
                  Your most recently created or updated batches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "JEE Advanced 2025", category: "JEE", students: 45, subjects: 3, status: "Active" },
                    { name: "NEET UG Batch", category: "NEET", students: 67, subjects: 3, status: "Active" },
                    { name: "JEE Mains Dropper", category: "JEE", students: 23, subjects: 3, status: "Planning" },
                    { name: "NEET Revision", category: "NEET", students: 34, subjects: 3, status: "Active" },
                  ].map((batch, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-none">{batch.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {batch.students} students • {batch.subjects} subjects
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={batch.status === "Active" ? "default" : "secondary"}>
                          {batch.status}
                        </Badge>
                        <Badge variant="outline">{batch.category}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/admin/batches/create')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Create New Batch
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/admin/batches')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  View All Batches
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  disabled
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Reports
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  disabled
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Classes
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                System Overview
              </CardTitle>
              <CardDescription>
                Current system status and recent updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database Status</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    All tables operational
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage Status</span>
                    <Badge variant="default">Ready</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    File uploads enabled
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Backup</span>
                    <Badge variant="outline">2 hours ago</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Automated daily backups
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </SidebarProvider>
  );
}