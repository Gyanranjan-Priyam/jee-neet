"use client";

import { useState, useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  GraduationCap,
  FileText,
  Clock,
  Target,
  Loader2,
  ChevronRight,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";


interface Subject {
  id: string;
  name: string;
  teacher_name?: string;
  status: "not_started" | "in_progress" | "completed";
  created_at?: string;
  updated_at?: string;
  batch_id: string;
}

interface BatchSubjectsProps {
  batchId: string;
  category: "JEE" | "NEET";
  classType: "11th" | "12th" | "Dropper";
}

export function BatchSubjects({ batchId, category, classType }: BatchSubjectsProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    teacher_name: "",
    status: "not_started" as "not_started" | "in_progress" | "completed",
  });


  // Fetch subjects from API
  useEffect(() => {
    fetchSubjects();
  }, [batchId]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/batches/${batchId}/subjects`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch subjects');
      }
      
      const data = await response.json();
      setSubjects(data.subjects || []);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast.error(error.message || 'Failed to load subjects');
      setSubjects([]); // Set empty array on error
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

  const handleAddSubject = async () => {
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/batches/${batchId}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          teacher_name: formData.teacher_name,
          status: formData.status,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subject');
      }

      const data = await response.json();
      setSubjects(prev => [...prev, data.subject]);
      toast.success('Subject created successfully!');
      resetForm();
      setShowAddDialog(false);
    } catch (error: any) {
      console.error('Error creating subject:', error);
      toast.error(error.message || 'Failed to create subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubject = async () => {
    if (!editingSubject || !formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/batches/${batchId}/subjects/${editingSubject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          teacher_name: formData.teacher_name,
          status: formData.status,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update subject');
      }

      const data = await response.json();
      setSubjects(prev => prev.map(s => s.id === editingSubject.id ? data.subject : s));
      toast.success('Subject updated successfully!');
      resetForm();
      setShowEditDialog(false);
    } catch (error: any) {
      console.error('Error updating subject:', error);
      toast.error(error.message || 'Failed to update subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/batches/${batchId}/subjects/${deletingSubject.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete subject');
      }

      setSubjects(prev => prev.filter(s => s.id !== deletingSubject.id));
      toast.success('Subject deleted successfully!');
      setShowDeleteDialog(false);
      setDeletingSubject(null);
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      toast.error(error.message || 'Failed to delete subject');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      teacher_name: subject.teacher_name || '',
      status: subject.status,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (subject: Subject) => {
    setDeletingSubject(subject);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      teacher_name: "",
      status: "not_started",
    });
    setEditingSubject(null);
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
            Manage subjects and topics for this {category} {classType} batch
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>
                Add a new subject to this batch curriculum
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Physics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher_name">Teacher Name</Label>
                <Input
                  id="teacher_name"
                  value={formData.teacher_name}
                  onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                  placeholder="e.g., Dr. Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
                disabled={submitting}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button onClick={handleAddSubject} disabled={submitting} className="cursor-pointer">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Subject'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Subject Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
              <DialogDescription>
                Update the subject information for this batch
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Subject Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Physics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-teacher_name">Teacher Name</Label>
                <Input
                  id="edit-teacher_name"
                  value={formData.teacher_name}
                  onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                  placeholder="e.g., Dr. Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditDialog(false);
                  resetForm();
                }}
                disabled={submitting}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button onClick={handleEditSubject} disabled={submitting} className="cursor-pointer">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Subject'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Subject Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Subject</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingSubject?.name}"? This action cannot be undone.
                All topics and progress associated with this subject will also be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSubject}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Subject'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

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
          <Card key={subject.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Link 
                  href={`/admin/batches/${batchId}/subjects/${subject.id}`}
                  className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors flex-1"
                >
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Link>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(subject)} className="cursor-pointer">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(subject)} className="cursor-pointer">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subject.teacher_name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span>Teacher: {subject.teacher_name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(subject.status)}>
                    {subject.status.replace("_", " ").charAt(0).toUpperCase() + subject.status.replace("_", " ").slice(1)}
                  </Badge>
                  <Link href={`/admin/batches/${batchId}/subjects/${subject.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="cursor-pointer"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Open Subject
                    </Button>
                  </Link>
                </div>

                <div className="text-xs text-muted-foreground">
                  Created: {subject.created_at ? new Date(subject.created_at).toLocaleDateString() : 'Unknown'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No subjects added yet</h3>
            <p className="text-gray-600 mb-4">
              Start building your curriculum by adding subjects for this batch.
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Subject
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Success Notice */}
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          <strong>Subject Management Active:</strong> You can now add, edit, and delete subjects for this batch.
          Progress tracking and advanced features are coming soon.
        </AlertDescription>
      </Alert>
    </div>
  );
}