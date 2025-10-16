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
  FolderOpen, 
  Plus, 
  Download, 
  Eye, 
  Edit,
  Trash2,
  FileText,
  Image,
  Video,
  File,
  Upload,
  Calendar,
  User
} from "lucide-react";
import { toast } from "sonner";

interface Resource {
  id: string;
  name: string;
  description?: string;
  type: "pdf" | "video" | "image" | "document" | "link";
  url: string;
  size?: string;
  uploadedBy: string;
  uploadedAt: string;
  subject?: string;
  topic?: string;
  downloads: number;
}

interface BatchResourcesProps {
  batchId: string;
  category: "JEE" | "NEET";
  classType: "11th" | "12th" | "Dropper";
}

export function BatchResources({ batchId, category, classType }: BatchResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "pdf" as const,
    subject: "",
    topic: "",
  });

  // Mock resources
  const mockResources: Resource[] = [
    {
      id: "1",
      name: "Physics Formula Sheet",
      description: "Complete formula sheet for JEE Main Physics",
      type: "pdf",
      url: "/resources/physics-formulas.pdf",
      size: "2.5 MB",
      uploadedBy: "Dr. Rajesh Kumar",
      uploadedAt: "2024-10-01",
      subject: "Physics",
      topic: "All Topics",
      downloads: 45
    },
    {
      id: "2",
      name: "Organic Chemistry Mechanisms",
      description: "Video lecture on important organic chemistry mechanisms",
      type: "video",
      url: "/resources/organic-mechanisms.mp4",
      size: "150 MB",
      uploadedBy: "Dr. Priya Singh",
      uploadedAt: "2024-10-05",
      subject: "Chemistry",
      topic: "Organic Chemistry",
      downloads: 32
    },
    {
      id: "3",
      name: "Calculus Practice Problems",
      description: "100+ practice problems with detailed solutions",
      type: "pdf",
      url: "/resources/calculus-problems.pdf",
      size: "5.2 MB",
      uploadedBy: "Prof. Amit Sharma",
      uploadedAt: "2024-10-08",
      subject: "Mathematics",
      topic: "Calculus",
      downloads: 67
    },
    {
      id: "4",
      name: "Previous Year Question Paper",
      description: "JEE Main 2023 Question Paper with solutions",
      type: "pdf",
      url: "/resources/jee-main-2023.pdf",
      size: "3.1 MB",
      uploadedBy: "Admin",
      uploadedAt: "2024-10-10",
      subject: "All Subjects",
      topic: "Previous Papers",
      downloads: 89
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
      case "document":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "video":
        return <Video className="h-5 w-5 text-purple-500" />;
      case "image":
        return <Image className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "pdf":
        return "bg-red-100 text-red-800";
      case "video":
        return "bg-purple-100 text-purple-800";
      case "image":
        return "bg-green-100 text-green-800";
      case "document":
        return "bg-blue-100 text-blue-800";
      case "link":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredResources = selectedType === "all" 
    ? mockResources 
    : mockResources.filter(resource => resource.type === selectedType);

  const handleAddResource = () => {
    toast.success("Resource management coming soon!");
    setShowAddDialog(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Learning Resources
          </h3>
          <p className="text-muted-foreground text-sm">
            Study materials, notes, and resources for {category} {classType} students
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
              <DialogDescription>
                Upload or link to study materials for students
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Resource Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Physics Formula Sheet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the resource"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Resource Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="link">Web Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Physics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="Mechanics"
                  />
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Drag & drop files here or click to browse</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Choose File
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddResource}>Add Resource</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b">
        {["all", "pdf", "video", "image", "document"].map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedType(type)}
            className="rounded-b-none"
          >
            {type === "all" ? "All Resources" : type.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(resource.type)}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">{resource.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getTypeColor(resource.type)} variant="secondary">
                        {resource.type.toUpperCase()}
                      </Badge>
                      {resource.size && (
                        <span className="text-xs text-muted-foreground">{resource.size}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => toast.info("Preview coming soon!")}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.info("Edit coming soon!")}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {resource.uploadedBy}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(resource.uploadedAt)}
                  </div>
                </div>

                {(resource.subject || resource.topic) && (
                  <div className="flex flex-wrap gap-1">
                    {resource.subject && (
                      <Badge variant="outline" className="text-xs">
                        {resource.subject}
                      </Badge>
                    )}
                    {resource.topic && (
                      <Badge variant="outline" className="text-xs">
                        {resource.topic}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    {resource.downloads} downloads
                  </span>
                  <Button size="sm" variant="outline" onClick={() => toast.info("Download coming soon!")}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedType === "all" ? "No resources added yet" : `No ${selectedType} resources found`}
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedType === "all" 
                ? "Start building your resource library by adding study materials."
                : `Add ${selectedType} resources to help students learn better.`
              }
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Development Notice */}
      <Alert>
        <Upload className="h-4 w-4" />
        <AlertDescription>
          <strong>Coming Soon:</strong> Full resource management with file uploads, Google Drive integration, 
          categorization, search, and student access controls.
        </AlertDescription>
      </Alert>
    </div>
  );
}