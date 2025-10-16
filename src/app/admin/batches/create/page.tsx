"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { createClient } from "@/lib/supabase";
import { SidebarProvider, MinimalSidebar, adminNavItems } from "@/components/minimal-sidebar";
import { ImageUpload } from "@/components/image-upload";
import { BatchPreview } from "@/components/batch-preview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Users, User, Image, Calendar } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface BatchFormData {
  name: string;
  description: string;
  category: string;
  classType: string;
  thumbnail: string;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  capacity: number;
  fees: number;
  startDate: string;
  endDate: string;
  teacherInfo: {
    name: string;
    subject: string;
    experience: string;
    qualification: string;
    bio: string;
  };
}

export default function CreateBatchPage() {
  const [activeCategory, setActiveCategory] = useState<"jee" | "neet">("jee");
  const [activeClass, setActiveClass] = useState<"11th" | "12th" | "dropper">("11th");
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<BatchFormData>({
    name: "",
    description: "",
    category: "",
    classType: "",
    thumbnail: "",
    schedule: {
      days: [],
      startTime: "",
      endTime: "",
    },
    capacity: 0,
    fees: 0,
    startDate: "",
    endDate: "",
    teacherInfo: {
      name: "",
      subject: "",
      experience: "",
      qualification: "",
      bio: "",
    },
  });

  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleScheduleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: value,
      },
    }));
  };

  const handleTeacherInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      teacherInfo: {
        ...prev.teacherInfo,
        [field]: value,
      },
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day],
      },
    }));
  };

  const handleThumbnailUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      thumbnail: url,
    }));
  };

  const handleThumbnailRemove = () => {
    setFormData(prev => ({
      ...prev,
      thumbnail: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.classType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      // Create batch via API
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create batch');
      }

      const data = await response.json();
      toast.success(`Batch "${formData.name}" created successfully!`);
      router.push("/admin/batches");
      
    } catch (err) {
      console.error("Error creating batch:", err);
      toast.error("Failed to create batch");
    } finally {
      setLoading(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  if (authLoading) {
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
                Create Batch
              </h1>
            </div>
          </header>
        
        <div className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/admin/batches">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Batches
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Batch</h1>
            <p className="text-muted-foreground">
              Set up a new batch with schedule, capacity, and other details.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left Panel - Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Fill in the basic details for your batch
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Batch Name *</Label>
                    <Input className="mt-1"
                      id="name"
                      placeholder="Enter batch name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange("category", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JEE">JEE</SelectItem>
                          <SelectItem value="NEET">NEET</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="classType">Class *</Label>
                      <Select
                        value={formData.classType}
                        onValueChange={(value) => handleInputChange("classType", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="11th">11th Class</SelectItem>
                          <SelectItem value="12th">12th Class</SelectItem>
                          <SelectItem value="Dropper">Dropper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter batch description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Student Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="Enter capacity"
                        value={formData.capacity || ""}
                        onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fees">Monthly Fees (₹)</Label>
                      <Input
                        id="fees"
                        type="number"
                        placeholder="Enter fees"
                        value={formData.fees || ""}
                        onChange={(e) => handleInputChange("fees", parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {/* Date Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        End Date
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                        min={formData.startDate}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Batch Thumbnail
                  </CardTitle>
                  <CardDescription>
                    Upload an image to represent your batch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    value={formData.thumbnail}
                    onChange={handleThumbnailUpload}
                    onRemove={handleThumbnailRemove}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                  <CardDescription>
                    Set up the batch schedule and timing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {days.map((day) => (
                        <Button
                          key={day}
                          type="button"
                          variant={formData.schedule.days.includes(day) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleDayToggle(day)}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.schedule.startTime}
                        onChange={(e) => handleScheduleChange("startTime", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.schedule.endTime}
                        onChange={(e) => handleScheduleChange("endTime", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Teacher Information (Optional)
                  </CardTitle>
                  <CardDescription>
                    Add teacher details for this batch
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teacherName">Teacher Name</Label>
                      <Input
                        id="teacherName"
                        placeholder="Enter teacher name"
                        value={formData.teacherInfo.name}
                        onChange={(e) => handleTeacherInfoChange("name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Enter subject"
                        value={formData.teacherInfo.subject}
                        onChange={(e) => handleTeacherInfoChange("subject", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience</Label>
                      <Input
                        id="experience"
                        placeholder="e.g., 5 years"
                        value={formData.teacherInfo.experience}
                        onChange={(e) => handleTeacherInfoChange("experience", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qualification">Qualification</Label>
                      <Input
                        id="qualification"
                        placeholder="Enter qualification"
                        value={formData.teacherInfo.qualification}
                        onChange={(e) => handleTeacherInfoChange("qualification", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Enter teacher bio"
                      value={formData.teacherInfo.bio}
                      onChange={(e) => handleTeacherInfoChange("bio", e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Link href="/admin/batches">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Batch
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="xl:sticky xl:top-6 xl:self-start">
              <BatchPreview batchData={formData} />
            </div>
          </div>
        </div>
        </div>
      </div>
    </SidebarProvider>
  );
}