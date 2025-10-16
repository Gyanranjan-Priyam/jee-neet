"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Upload,
  Link as LinkIcon,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { PdfEditDialog } from "./pdf-edit-dialog";
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
}

interface PdfListProps {
  pdfs: Pdf[];
  pdfType: "note" | "dpp_pdf";
  onPdfDeleted: () => void;
  batchId: string;
  subjectId: string;
  chapterId: string;
}

export function PdfList({
  pdfs,
  pdfType,
  onPdfDeleted,
  batchId,
  subjectId,
  chapterId,
}: PdfListProps) {
  const [editingPdf, setEditingPdf] = useState<Pdf | null>(null);
  const [previewingPdf, setPreviewingPdf] = useState<Pdf | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredPdfs = pdfs.filter((pdf) => pdf.pdf_type === pdfType);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const handleDelete = async (pdfId: string) => {
    if (!confirm("Are you sure you want to delete this PDF?")) {
      return;
    }

    setDeletingId(pdfId);

    try {
      const response = await fetch(
        `/api/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/pdfs/${pdfId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete PDF");
      }

      toast.success("PDF deleted successfully");
      onPdfDeleted();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete PDF");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreview = (pdf: Pdf) => {
    setPreviewingPdf(pdf);
  };

  const handleEdit = (pdf: Pdf) => {
    setEditingPdf(pdf);
  };

  const handlePdfUpdated = () => {
    onPdfDeleted(); // Refresh the list
    setEditingPdf(null);
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
              ? "Upload comprehensive study notes for this chapter."
              : "Upload daily practice problem PDFs for this chapter."}
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
            <div className="flex items-center h-1 mt-auto mb-auto justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950">
                  <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>

                <div className="flex-1 mt-auto mb-auto min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-md truncate">
                      {pdf.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      Added {new Date(pdf.created_at).toLocaleDateString()}
                    </span>
                    {pdf.file_size && (
                      <span>{formatFileSize(pdf.file_size)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreview(pdf)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(pdf)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {pdf.pdf_source === "google_drive" ? "Open" : "Download"}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={deletingId === pdf.id}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(pdf)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(pdf.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Edit Dialog */}
      {editingPdf && (
        <PdfEditDialog
          pdf={editingPdf}
          isOpen={!!editingPdf}
          onClose={() => setEditingPdf(null)}
          onPdfUpdated={handlePdfUpdated}
          batchId={batchId}
          subjectId={subjectId}
          chapterId={chapterId}
        />
      )}

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