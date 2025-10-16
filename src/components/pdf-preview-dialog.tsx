"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ExternalLink,
  X,
  Upload,
  Link as LinkIcon,
  Download,
} from "lucide-react";

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

interface PdfPreviewDialogProps {
  pdf: Pdf;
  isOpen: boolean;
  onClose: () => void;
}

export function PdfPreviewDialog({
  pdf,
  isOpen,
  onClose,
}: PdfPreviewDialogProps) {
  const getPdfEmbedUrl = (url: string, source: string) => {
    if (source === "google_drive") {
      // Extract file ID and create embed URL
      const fileIdPattern = /\/d\/([a-zA-Z0-9-_]+)/;
      const match = url.match(fileIdPattern);
      
      if (match && match[1]) {
        const fileId = match[1];
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    
    // For direct uploads, return the URL directly (it should work with iframe)
    return url;
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

  const handleDownload = () => {
    if (pdf.pdf_source === "google_drive") {
      // For Google Drive files, open in new tab
      window.open(pdf.pdf_url, "_blank");
    } else {
      // For direct uploads, trigger download
      const link = document.createElement("a");
      link.href = pdf.pdf_url;
      link.download = `${pdf.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(pdf.pdf_url, "_blank");
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <div>
                <DialogTitle className="text-lg">{pdf.title}</DialogTitle>
                <div className="flex items-center gap-4 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getSourceIcon()}
                    <span className="ml-1">{getSourceLabel()}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Added {new Date(pdf.created_at).toLocaleDateString()}
                  </span>
                  {pdf.file_size && (
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(pdf.file_size)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                {pdf.pdf_source === "google_drive" ? "Open" : "Download"}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenInNewTab}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                New Tab
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* PDF Preview */}
        <div className="flex-1 min-h-0 mt-4">
          <iframe
            src={getPdfEmbedUrl(pdf.pdf_url, pdf.pdf_source)}
            className="w-full h-full border rounded-lg"
            title={pdf.title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>

        {/* Fallback message for PDFs that can't be embedded */}
        <div className="text-center text-sm text-muted-foreground mt-2">
          If the PDF doesn't display properly, try opening it in a{" "}
          <button
            onClick={handleOpenInNewTab}
            className="text-blue-600 hover:text-blue-500 underline"
          >
            new tab
          </button>
          .
        </div>
      </DialogContent>
    </Dialog>
  );
}