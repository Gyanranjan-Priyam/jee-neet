"use client";

import { useState, useEffect } from "react";
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
import { FileText, Loader2, Upload, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface Pdf {
  id: string;
  title: string;
  pdf_url: string;
  pdf_type: "note" | "dpp_pdf";
  pdf_source: "supabase_storage" | "google_drive";
  file_size?: number;
  storage_path?: string;
  order_index: number;
  created_at: string;
}

interface PdfEditDialogProps {
  pdf: Pdf;
  isOpen: boolean;
  onClose: () => void;
  onPdfUpdated: () => void;
  batchId: string;
  subjectId: string;
  chapterId: string;
}

export function PdfEditDialog({
  pdf,
  isOpen,
  onClose,
  onPdfUpdated,
  batchId,
  subjectId,
  chapterId,
}: PdfEditDialogProps) {
  const [title, setTitle] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [updating, setUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (pdf) {
      setTitle(pdf.title);
      setPdfUrl(pdf.pdf_url);
      setHasChanges(false);
    }
  }, [pdf]);

  useEffect(() => {
    if (pdf) {
      const titleChanged = title !== pdf.title;
      const urlChanged = pdfUrl !== pdf.pdf_url;
      setHasChanges(titleChanged || urlChanged);
    }
  }, [title, pdfUrl, pdf]);

  const handleClose = () => {
    setTitle(pdf.title);
    setPdfUrl(pdf.pdf_url);
    setHasChanges(false);
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
    const fileIdPattern = /\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(fileIdPattern);
    
    if (match && match[1]) {
      const fileId = match[1];
      return `https://drive.google.com/file/d/${fileId}/view`;
    }
    
    return url;
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title for the PDF");
      return;
    }

    if (pdf.pdf_source === "google_drive" && !pdfUrl.trim()) {
      toast.error("Please enter a PDF URL");
      return;
    }

    if (pdf.pdf_source === "google_drive" && !isValidGoogleDriveUrl(pdfUrl)) {
      toast.error("Please enter a valid Google Drive URL");
      return;
    }

    if (!hasChanges) {
      handleClose();
      return;
    }

    setUpdating(true);

    try {
      let finalPdfUrl = pdfUrl;
      
      // Convert Google Drive URL if needed
      if (pdf.pdf_source === "google_drive") {
        finalPdfUrl = convertToDirectGoogleDriveUrl(pdfUrl);
      }

      const response = await fetch(
        `/api/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/pdfs/${pdf.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            pdf_url: finalPdfUrl,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update PDF");
      }

      toast.success("PDF updated successfully!");
      onPdfUpdated();
      handleClose();
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update PDF");
    } finally {
      setUpdating(false);
    }
  };

  const getSourceIcon = () => {
    switch (pdf.pdf_source) {
      case "supabase_storage":
        return <Upload className="h-3 w-3" />;
      case "google_drive":
        return <LinkIcon className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getSourceLabel = () => {
    switch (pdf.pdf_source) {
      case "supabase_storage":
        return "Direct Upload";
      case "google_drive":
        return "Google Drive";
      default:
        return "Unknown";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit PDF
          </DialogTitle>
          <DialogDescription>
            Update the PDF information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* PDF Source Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Source:</span>
            <Badge variant="outline" className="text-xs">
              {getSourceIcon()}
              <span className="ml-1">{getSourceLabel()}</span>
            </Badge>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">PDF Title</Label>
            <Input
              id="title"
              placeholder="Enter PDF title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={updating}
            />
          </div>

          {/* URL Input - Only for Google Drive files */}
          {pdf.pdf_source === "google_drive" && (
            <div className="space-y-2">
              <Label htmlFor="pdf-url">PDF URL</Label>
              <Input
                id="pdf-url"
                placeholder="https://drive.google.com/file/d/..."
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                disabled={updating}
              />
              <p className="text-xs text-muted-foreground">
                Google Drive share link for your PDF file.
              </p>
            </div>
          )}

          {/* File info for direct uploads */}
          {pdf.pdf_source === "supabase_storage" && (
            <div className="space-y-2">
              <Label>File Information</Label>
              <div className="text-sm text-muted-foreground">
                <p>Original file cannot be changed for direct uploads.</p>
                <p>You can only update the title.</p>
                {pdf.file_size && (
                  <p>File size: {Math.round(pdf.file_size / 1024)} KB</p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={updating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updating || !hasChanges}>
            {updating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Update PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}