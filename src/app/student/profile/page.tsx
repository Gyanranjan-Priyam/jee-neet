'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { SidebarProvider, MinimalSidebar, studentNavItems } from '@/components/minimal-sidebar';
import { PageLoadingIndicator } from '@/components/professional-loading-indicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User,
  Mail,
  Calendar,
  BookOpen,
  Edit,
  Save,
  X,
} from 'lucide-react';

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // For now, just set basic user data from auth
      setProfile({
        name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student",
        email: user?.email || "",
        joined_date: user?.created_at || new Date().toISOString(),
        enrollments: [], // Would fetch from API in real implementation
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/student/login');
  };

  if (authLoading || loading) {
    return <PageLoadingIndicator text="Loading your profile..." />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <MinimalSidebar
          user={{
            name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student",
            email: user?.email || "student@example.com",
          }}
          navItems={studentNavItems}
          onLogout={handleSignOut}
          type="student"
        />
      <div className="flex-1 overflow-auto">
        <div className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <h1 className="text-xl font-semibold">Student Profile</h1>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid gap-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="name"
                        value={profile?.name || ""}
                        disabled={!editing}
                        className={!editing ? "bg-muted" : ""}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email"
                        value={profile?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {profile?.joined_date ? new Date(profile.joined_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!editing ? (
                    <Button 
                      onClick={() => setEditing(true)}
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={() => setEditing(false)}
                        size="sm"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setEditing(false)}
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Current Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    View your enrollments in the Batches section
                  </p>
                  <Button 
                    onClick={() => router.push('/student/batches')}
                    className="mt-4"
                  >
                    View My Batches
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </SidebarProvider>
  );
}