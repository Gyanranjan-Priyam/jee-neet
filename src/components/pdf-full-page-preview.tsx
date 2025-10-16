"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  ExternalLink,
  X,
  Upload,
  Link as LinkIcon,
  Download,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
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

interface PdfFullPagePreviewProps {
  pdf: Pdf;
  onClose: () => void;
}

export function PdfFullPagePreview({
  pdf,
  onClose,
}: PdfFullPagePreviewProps) {
  const [iframeError, setIframeError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const getPdfEmbedUrl = (url: string, source: string, useProxy: boolean = false) => {
    if (source === "google_drive") {
      // Extract file ID and create embed URL
      const fileIdPattern = /\/d\/([a-zA-Z0-9-_]+)/;
      const match = url.match(fileIdPattern);
      
      if (match && match[1]) {
        const fileId = match[1];
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    
    // For direct uploads, try proxy if direct access failed
    if (source === "supabase_storage") {
      if (useProxy) {
        return `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
      }
      return `${url}#toolbar=1&navpanes=0&scrollbar=1&page=1&view=FitH`;
    }
    
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

  const handleIframeError = () => {
    console.log("Iframe failed to load PDF:", pdf.pdf_url);
    setIframeError(true);
  };

  const handleRetry = () => {
    setIframeError(false);
    setRetryCount(prev => prev + 1);
  };

  const getEmbedUrlWithFallback = (useProxy: boolean = false) => {
    return getPdfEmbedUrl(pdf.pdf_url, pdf.pdf_source, useProxy);
  };

  const renderPdfViewer = () => {
    // Try direct URL first, then proxy on retry
    const useProxy = retryCount > 0 && pdf.pdf_source === "supabase_storage";
    const embedUrl = getEmbedUrlWithFallback(useProxy);
    
    // If iframe failed, show fallback options
    if (iframeError) {
      return (
        <div className="h-full flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Preview Not Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This PDF cannot be displayed in the preview. This might happen due to:
              </p>
              <ul className="text-xs text-muted-foreground text-left mb-4 space-y-1">
                <li>• CORS restrictions from the PDF source</li>
                <li>• Browser security policies</li>
                <li>• PDF format compatibility issues</li>
                <li>• Network connectivity problems</li>
              </ul>
              
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {retryCount === 0 ? "Try Proxy" : "Retry Preview"}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleOpenInNewTab}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open in New Tab
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // For Supabase storage, try object tag for better PDF support
    if (pdf.pdf_source === "supabase_storage") {
      return (
        <object
          key={`object-${retryCount}-${useProxy ? 'proxy' : 'direct'}`}
          data={embedUrl}
          type="application/pdf"
          className="w-full h-full"
          title={pdf.title}
          onError={handleIframeError}
        >
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            title={pdf.title}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </object>
      );
    }

    // For Google Drive, use iframe with proper embed URL
    return (
      <iframe
        key={`iframe-${retryCount}`}
        src={embedUrl}
        className="w-full h-full border-0"
        title={pdf.title}
        onError={handleIframeError}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when preview is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header Bar */}
      <div className="bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <h1 className="font-semibold text-lg">{pdf.title}</h1>
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
            variant="ghost"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="h-[calc(100vh-73px)]">
        {renderPdfViewer()}
      </div>

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 right-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
        Press ESC to close
      </div>
    </div>
  );
}