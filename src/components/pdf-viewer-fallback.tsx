"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ExternalLink, RefreshCw } from "lucide-react";

interface PdfViewerFallbackProps {
  pdfUrl: string;
  title: string;
  onOpenNewTab: () => void;
}

export function PdfViewerFallback({
  pdfUrl,
  title,
  onOpenNewTab,
}: PdfViewerFallbackProps) {
  const [viewerMethod, setViewerMethod] = useState<'iframe' | 'object' | 'embed' | 'error'>('iframe');
  const [retryCount, setRetryCount] = useState(0);

  const handleError = () => {
    console.log(`PDF viewer method '${viewerMethod}' failed for:`, pdfUrl);
    
    // Try different methods in sequence
    if (viewerMethod === 'iframe') {
      setViewerMethod('object');
    } else if (viewerMethod === 'object') {
      setViewerMethod('embed');
    } else {
      setViewerMethod('error');
    }
  };

  const handleRetry = () => {
    setViewerMethod('iframe');
    setRetryCount(prev => prev + 1);
  };

  const renderViewer = () => {
    const key = `${viewerMethod}-${retryCount}`;
    
    switch (viewerMethod) {
      case 'iframe':
        return (
          <iframe
            key={key}
            src={pdfUrl}
            className="w-full h-full border-0"
            title={title}
            onError={handleError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        );
      
      case 'object':
        return (
          <object
            key={key}
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
            title={title}
            onError={handleError}
          >
            <p>
              Your browser doesn't support embedded PDFs.{' '}
              <button
                onClick={onOpenNewTab}
                className="text-blue-600 underline"
              >
                Click here to view the PDF
              </button>
            </p>
          </object>
        );
      
      case 'embed':
        return (
          <embed
            key={key}
            src={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
            title={title}
            onError={handleError}
          />
        );
      
      case 'error':
      default:
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
                  <li>• PDF format compatibility</li>
                  <li>• Network connectivity issues</li>
                </ul>
                
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry Preview
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onOpenNewTab}
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
  };

  return <>{renderViewer()}</>;
}