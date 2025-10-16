"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { 
  Megaphone, 
  Plus, 
  Edit,
  Trash2,
  Pin,
  Calendar,
  Clock,
  User,
  AlertCircle,
  Info,
  CheckCircle,
  Bell
} from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "general" | "urgent" | "exam" | "schedule" | "notice";
  priority: "low" | "medium" | "high";
  isPinned: boolean;
  author: string;
  createdAt: string;
  updatedAt?: string;
  scheduledFor?: string;
  expiresAt?: string;
  isPublished: boolean;
  readBy: string[];
}

interface BatchAnnouncementsProps {
  batchId: string;
  category: "JEE" | "NEET";
  classType: "11th" | "12th" | "Dropper";
}

export function BatchAnnouncements({ batchId, category, classType }: BatchAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general" as const,
    priority: "medium" as const,
    isPinned: false,
    scheduledFor: "",
    expiresAt: "",
  });

  // Mock announcements
  const mockAnnouncements: Announcement[] = [
    {
      id: "1",
      title: "Mid-term Exam Schedule Released",
      content: "Dear students, the mid-term examination schedule has been released. Please check your dashboard for detailed timetable. The exams will start from November 15th, 2024. Make sure to complete your syllabus revision by November 10th.",
      type: "exam",
      priority: "high",
      isPinned: true,
      author: "Dr. Rajesh Kumar",
      createdAt: "2024-10-12T10:00:00Z",
      isPublished: true,
      readBy: ["student1", "student2"]
    },
    {
      id: "2",
      title: "Class Timing Change - Physics",
      content: "Due to a scheduling conflict, tomorrow's Physics class (October 15th) will be conducted from 2:00 PM to 4:00 PM instead of the regular 10:00 AM slot. Please make note of this change.",
      type: "schedule",
      priority: "medium",
      isPinned: false,
      author: "Admin",
      createdAt: "2024-10-14T08:30:00Z",
      isPublished: true,
      readBy: ["student1"]
    },
    {
      id: "3",
      title: "New Study Material Available",
      content: "We've uploaded new practice questions for Organic Chemistry. These include previous year JEE questions with detailed solutions. Access them from the Resources section.",
      type: "general",
      priority: "low",
      isPinned: false,
      author: "Dr. Priya Singh",
      createdAt: "2024-10-13T14:20:00Z",
      isPublished: true,
      readBy: []
    },
    {
      id: "4",
      title: "Important: Fee Payment Reminder",
      content: "This is a friendly reminder that the next installment of fees is due by October 20th, 2024. Please ensure timely payment to avoid any interruption in classes. Contact the office for any payment-related queries.",
      type: "notice",
      priority: "high",
      isPinned: true,
      author: "Admin",
      createdAt: "2024-10-11T09:00:00Z",
      expiresAt: "2024-10-20T23:59:59Z",
      isPublished: true,
      readBy: ["student1", "student2", "student3"]
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "exam":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "schedule":
        return <Clock className="h-4 w-4 text-purple-500" />;
      case "notice":
        return <Info className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "exam":
        return "bg-blue-100 text-blue-800";
      case "schedule":
        return "bg-purple-100 text-purple-800";
      case "notice":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredAnnouncements = selectedFilter === "all" 
    ? mockAnnouncements 
    : mockAnnouncements.filter(announcement => 
        selectedFilter === "pinned" ? announcement.isPinned : announcement.type === selectedFilter
      );

  const handleAddAnnouncement = () => {
    toast.success("Announcement system coming soon!");
    setShowAddDialog(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffHours = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Announcements
          </h3>
          <p className="text-muted-foreground text-sm">
            Important updates and notices for {category} {classType} students
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Create an announcement for all students in this batch
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Mid-term Exam Schedule"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your announcement content here..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="schedule">Schedule</SelectItem>
                      <SelectItem value="notice">Notice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledFor">Schedule For (Optional)</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isPinned" className="text-sm">
                  Pin this announcement (will appear at the top)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAnnouncement}>Create Announcement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b">
        {["all", "pinned", "urgent", "exam", "schedule", "notice", "general"].map((filter) => (
          <Button
            key={filter}
            variant={selectedFilter === filter ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedFilter(filter)}
            className="rounded-b-none"
          >
            {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card 
            key={announcement.id} 
            className={`hover:shadow-md transition-all ${
              announcement.isPinned ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
            } ${announcement.priority === "high" ? "border-l-4 border-l-red-500" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getTypeIcon(announcement.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      {announcement.isPinned && (
                        <Pin className="h-4 w-4 text-blue-500" />
                      )}
                      <Badge className={getTypeColor(announcement.type)} variant="secondary">
                        {announcement.type}
                      </Badge>
                      <Badge 
                        className={getPriorityColor(announcement.priority)} 
                        variant="outline"
                      >
                        {announcement.priority} priority
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {announcement.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(announcement.createdAt)}
                      </div>
                      {announcement.expiresAt && (
                        <div className={`flex items-center gap-1 ${
                          isExpiringSoon(announcement.expiresAt) ? "text-red-600" : ""
                        }`}>
                          <Clock className="h-3 w-3" />
                          Expires: {formatDate(announcement.expiresAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => toast.info("Edit coming soon!")}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.info("Delete coming soon!")}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {announcement.content}
              </p>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  Read by {announcement.readBy.length} students
                </div>
                {isExpiringSoon(announcement.expiresAt) && (
                  <Badge variant="destructive" className="text-xs">
                    Expiring Soon
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAnnouncements.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedFilter === "all" ? "No announcements yet" : `No ${selectedFilter} announcements`}
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedFilter === "all" 
                ? "Keep your students informed by creating announcements."
                : `Create ${selectedFilter} announcements to keep students updated.`
              }
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Announcement
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Development Notice */}
      <Alert>
        <Bell className="h-4 w-4" />
        <AlertDescription>
          <strong>Coming Soon:</strong> Full announcement system with push notifications, email alerts, 
          read receipts, scheduling, and student acknowledgment features.
        </AlertDescription>
      </Alert>
    </div>
  );
}