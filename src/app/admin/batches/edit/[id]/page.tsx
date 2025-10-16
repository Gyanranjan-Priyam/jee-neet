"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditBatchPage() {
  const [activeCategory, setActiveCategory] = useState<"jee" | "neet">("jee");
  const [activeClass, setActiveClass] = useState<"11th" | "12th" | "dropper">("11th");
  const [loading, setLoading] = useState(false);
  const [fetchingBatch, setFetchingBatch] = useState(true);
  
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
  const params = useParams();
  const batchId = params.id as string;
  const { user, loading: authLoading, signOut } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (batchId && user) {
      fetchBatchData();
    }
  }, [batchId, user]);

  const fetchBatchData = async () => {
    try {
      setFetchingBatch(true);
      const response = await fetch(`/api/batches/${batchId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch batch data');
      }
      
      const data = await response.json();
      const batch = data.batch;
      
      // Convert batch data to form format
      setFormData({
        name: batch.name || "",
        description: batch.description || "",
        category: batch.category || "",
        classType: batch.class_type || "",
        thumbnail: batch.thumbnail || "",
        schedule: {
          days: batch.schedule_days || [],
          startTime: batch.start_time || "",
          endTime: batch.end_time || "",
        },
        capacity: batch.capacity || 0,
        fees: batch.fees || 0,
        startDate: batch.start_date || "",
        endDate: batch.end_date || "",
        teacherInfo: {
          name: batch.teacher_name || "",
          subject: batch.teacher_subject || "",
          experience: batch.teacher_experience || "",
          qualification: batch.teacher_qualification || "",
          bio: batch.teacher_bio || "",
        },
      });
      
      setActiveCategory(batch.category?.toLowerCase() || "jee");
      setActiveClass(batch.class_type || "11th");
      
    } catch (error) {
      console.error('Error fetching batch:', error);
      toast.error('Failed to fetch batch data');
      router.push('/admin/batches');
    } finally {
      setFetchingBatch(false);
    }
  };

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
      // Update batch via API
      const response = await fetch(`/api/batches/${batchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update batch');
      }

      const data = await response.json();
      toast.success(`Batch "${formData.name}" updated successfully!`);
      router.push("/admin/batches");
      
    } catch (err) {
      console.error("Error updating batch:", err);
      toast.error("Failed to update batch");
    } finally {
      setLoading(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  if (authLoading || fetchingBatch) {
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
                Edit Batch
              </h1>
            </div>
          </header>
        
        <div className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/batches">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Batches
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Batch</h1>
              <p className="text-muted-foreground">
                Update batch information and settings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Form */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Update the basic details of your batch
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Batch Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter batch name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Enter batch description"
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange("category", value)}
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
                        <Label htmlFor="classType">Class Type *</Label>
                        <Select
                          value={formData.classType}
                          onValueChange={(value) => handleInputChange("classType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="11th">11th</SelectItem>
                            <SelectItem value="12th">12th</SelectItem>
                            <SelectItem value="Dropper">Dropper</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Maximum Students</Label>
                        <Input
                          id="capacity"
                          type="number"
                          min={1}
                          value={formData.capacity}
                          onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
                          placeholder="Enter maximum students"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fees">Fees (₹)</Label>
                        <Input
                          id="fees"
                          type="number"
                          min={0}
                          value={formData.fees}
                          onChange={(e) => handleInputChange("fees", parseInt(e.target.value) || 0)}
                          placeholder="Enter fees amount"
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

                {/* Thumbnail Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Batch Thumbnail
                    </CardTitle>
                    <CardDescription>
                      Upload an image for your batch
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

                {/* Schedule Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule Information</CardTitle>
                    <CardDescription>
                      Set the schedule for your batch
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Days</Label>
                      <div className="flex flex-wrap gap-2">
                        {days.map((day) => (
                          <Button
                            key={day}
                            type="button"
                            variant={formData.schedule.days.includes(day) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleDayToggle(day)}
                          >
                            {day.substring(0, 3)}
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

                {/* Teacher Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Teacher Information
                    </CardTitle>
                    <CardDescription>
                      Optional teacher details for the batch
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacherName">Teacher Name</Label>
                        <Input
                          id="teacherName"
                          value={formData.teacherInfo.name}
                          onChange={(e) => handleTeacherInfoChange("name", e.target.value)}
                          placeholder="Enter teacher name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacherSubject">Subject</Label>
                        <Input
                          id="teacherSubject"
                          value={formData.teacherInfo.subject}
                          onChange={(e) => handleTeacherInfoChange("subject", e.target.value)}
                          placeholder="Enter subject"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacherExperience">Experience</Label>
                        <Input
                          id="teacherExperience"
                          value={formData.teacherInfo.experience}
                          onChange={(e) => handleTeacherInfoChange("experience", e.target.value)}
                          placeholder="e.g., 10 years"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacherQualification">Qualification</Label>
                        <Input
                          id="teacherQualification"
                          value={formData.teacherInfo.qualification}
                          onChange={(e) => handleTeacherInfoChange("qualification", e.target.value)}
                          placeholder="Enter qualification"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacherBio">Bio</Label>
                      <Textarea
                        id="teacherBio"
                        value={formData.teacherInfo.bio}
                        onChange={(e) => handleTeacherInfoChange("bio", e.target.value)}
                        placeholder="Enter teacher bio"
                        className="min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Batch
                      </>
                    )}
                  </Button>
                  <Link href="/admin/batches">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:sticky lg:top-6">
              <BatchPreview batchData={formData} />
            </div>
          </div>
        </div>
        </div>
      </div>
    </SidebarProvider>
  );
}