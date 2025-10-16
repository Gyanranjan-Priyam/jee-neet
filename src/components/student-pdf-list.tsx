"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ExternalLink,
  Eye,
  Download,
  Upload,
  Link as LinkIcon,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PdfFullPagePreview } from "./pdf-full-page-preview";

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
  // Student-specific fields
  is_viewed?: boolean;
  is_downloaded?: boolean;
  view_count?: number;
}

interface StudentPdfListProps {
  pdfs: Pdf[];
  pdfType: "note" | "dpp_pdf";
  onPdfViewed?: (pdfId: string) => void;
  onPdfDownloaded?: (pdfId: string) => void;
}

export function StudentPdfList({
  pdfs,
  pdfType,
  onPdfViewed,
  onPdfDownloaded,
}: StudentPdfListProps) {
  const [previewingPdf, setPreviewingPdf] = useState<Pdf | null>(null);

  const filteredPdfs = pdfs.filter((pdf) => pdf.pdf_type === pdfType);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const handlePreview = (pdf: Pdf) => {
    setPreviewingPdf(pdf);
    // Track PDF as viewed when previewed
    if (onPdfViewed && !pdf.is_viewed) {
      onPdfViewed(pdf.id);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "supabase_storage":
        return <Upload className="h-3 w-3" />;
      case "google_drive":
        return <LinkIcon className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "supabase_storage":
        return "Direct Upload";
      case "google_drive":
        return "Google Drive";
      default:
        return "Unknown";
    }
  };

  const handleDownload = (pdf: Pdf) => {
    // Track download
    if (onPdfDownloaded) {
      onPdfDownloaded(pdf.id);
    }

    if (pdf.pdf_source === "google_drive") {
      // For Google Drive files, open in new tab
      window.open(pdf.pdf_url, "_blank");
      toast.success(`Opening: ${pdf.title}`);
    } else {
      // For direct uploads, trigger download
      const link = document.createElement("a");
      link.href = pdf.pdf_url;
      link.download = `${pdf.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading: ${pdf.title}`);
    }
  };

  if (filteredPdfs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No {pdfType === "note" ? "notes" : "DPP PDFs"} yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {pdfType === "note"
              ? "Study notes for this chapter will appear here when your instructor adds them."
              : "Daily Practice Problem PDFs will appear here when available."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredPdfs.map((pdf) => (
        <Card key={pdf.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg ${
                  pdfType === "note" 
                    ? "bg-blue-50 dark:bg-blue-950"
                    : "bg-red-50 dark:bg-red-950"
                }`}>
                  <FileText className={`h-5 w-5 ${
                    pdfType === "note"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-red-600 dark:text-red-400"
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-md truncate">
                      {pdf.title}
                    </h4>
                    {pdf.is_viewed && (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {getSourceIcon(pdf.pdf_source)}
                      <span>{getSourceLabel(pdf.pdf_source)}</span>
                    </div>
                    <span>
                      Added {new Date(pdf.created_at).toLocaleDateString()}
                    </span>
                    {pdf.file_size && (
                      <span>{formatFileSize(pdf.file_size)}</span>
                    )}
                    {pdf.view_count && pdf.view_count > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Viewed {pdf.view_count} {pdf.view_count === 1 ? 'time' : 'times'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handlePreview(pdf)}
                  className={`text-white ${
                    pdfType === "note"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {pdf.is_viewed ? "View Again" : "Preview"}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(pdf)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {pdf.pdf_source === "google_drive" ? "Open" : "Download"}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(pdf.pdf_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Full Page Preview */}
      {previewingPdf && (
        <PdfFullPagePreview
          pdf={previewingPdf}
          onClose={() => setPreviewingPdf(null)}
        />
      )}
    </div>
  );
}