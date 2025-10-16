"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PdfUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPdfAdded: () => void;
  batchId: string;
  subjectId: string;
  chapterId: string;
  pdfType: "note" | "dpp_pdf";
  title: string;
}

export function PdfUploadDialog({
  isOpen,
  onClose,
  onPdfAdded,
  batchId,
  subjectId,
  chapterId,
  pdfType,
  title,
}: PdfUploadDialogProps) {
  const [pdfTitle, setPdfTitle] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadTab, setUploadTab] = useState<"file" | "drive">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setPdfTitle("");
    setDriveUrl("");
    setUploadTab("file");
    onClose();
  };

  const isValidGoogleDriveUrl = (url: string) => {
    const patterns = [
      /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/,
      /https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/,
      /https:\/\/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9-_]+)/,
      /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const convertToDirectGoogleDriveUrl = (url: string) => {
    // Extract file ID from various Google Drive URL formats
    const fileIdPattern = /\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(fileIdPattern);
    
    if (match && match[1]) {
      const fileId = match[1];
      return `https://drive.google.com/file/d/${fileId}/view`;
    }
    
    return url;
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return null;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return null;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('batchId', batchId);
      formData.append('subjectId', subjectId);
      formData.append('chapterId', chapterId);
      formData.append('pdfType', pdfType);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      return {
        url: result.url,
        storagePath: result.storagePath,
        fileSize: result.fileSize,
      };
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!pdfTitle.trim()) {
      toast.error("Please enter a title for the PDF");
      return;
    }

    if (uploadTab === "drive" && !driveUrl.trim()) {
      toast.error("Please enter a Google Drive URL");
      return;
    }

    if (uploadTab === "drive" && !isValidGoogleDriveUrl(driveUrl)) {
      toast.error("Please enter a valid Google Drive URL");
      return;
    }

    if (uploadTab === "file" && !fileInputRef.current?.files?.[0]) {
      toast.error("Please select a PDF file");
      return;
    }

    setUploading(true);

    try {
      let pdfUrl = "";
      let storagePath = "";
      let fileSize = 0;
      let pdfSource = "";

      if (uploadTab === "file") {
        const file = fileInputRef.current?.files?.[0];
        if (!file) throw new Error("No file selected");

        const uploadResult = await handleFileUpload(file);
        if (!uploadResult) throw new Error("File upload failed");

        pdfUrl = uploadResult.url;
        storagePath = uploadResult.storagePath;
        fileSize = uploadResult.fileSize;
        pdfSource = "supabase_storage";
      } else {
        pdfUrl = convertToDirectGoogleDriveUrl(driveUrl);
        pdfSource = "google_drive";
      }

      // Save to database
      const response = await fetch(
        `/api/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/pdfs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: pdfTitle,
            pdf_url: pdfUrl,
            pdf_type: pdfType,
            pdf_source: pdfSource,
            storage_path: storagePath || null,
            file_size: fileSize || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save PDF");
      }

      toast.success("PDF uploaded successfully!");
      onPdfAdded();
      handleClose();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload PDF");
    } finally {
      setUploading(false);
    }
  };

  const getSourceBadge = () => {
    if (uploadTab === "file") {
      return (
        <Badge variant="outline" className="text-xs">
          <Upload className="h-3 w-3 mr-1" />
          Direct Upload
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-xs">
          <LinkIcon className="h-3 w-3 mr-1" />
          Google Drive
        </Badge>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload {title}
          </DialogTitle>
          <DialogDescription>
            Add a new PDF document to this chapter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">PDF Title</Label>
            <Input
              id="title"
              placeholder="Enter PDF title..."
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Upload Method Tabs */}
          <Tabs value={uploadTab} onValueChange={(value) => setUploadTab(value as "file" | "drive")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Direct Upload
              </TabsTrigger>
              <TabsTrigger value="drive" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Google Drive
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-2">
              <Label htmlFor="file">Select PDF File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground">
                Maximum file size: 50MB. Only PDF files are allowed.
              </p>
            </TabsContent>

            <TabsContent value="drive" className="space-y-2">
              <Label htmlFor="drive-url">Google Drive URL</Label>
              <Input
                id="drive-url"
                placeholder="https://drive.google.com/file/d/..."
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground">
                Paste the Google Drive share link for your PDF file.
              </p>
            </TabsContent>
          </Tabs>

          {/* Source Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Source:</span>
            {getSourceBadge()}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Upload PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}