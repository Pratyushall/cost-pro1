"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { analytics } from "@/lib/analytics";

interface PDFPreviewModalProps {
  open: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  metadata: {
    bhk: string;
    pkg: string;
    sqft: number;
    grandTotal: number;
  };
}

export function PDFPreviewModal({
  open,
  onClose,
  pdfBlob,
  metadata,
}: PDFPreviewModalProps) {
  // Create one object URL per blob and clean it up on change/unmount
  const objectUrl = React.useMemo(() => {
    if (!pdfBlob) return null;
    return URL.createObjectURL(pdfBlob);
  }, [pdfBlob]);

  React.useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = objectUrl ?? URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interior-estimate-${metadata.bhk}-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    try {
      analytics.pdfDownloaded?.(
        { bhk: metadata.bhk, pkg: metadata.pkg, sqft: metadata.sqft },
        { grandTotal: metadata.grandTotal, lines: undefined }
      );
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-foreground">PDF Preview</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden rounded-lg border border-border bg-muted">
          {objectUrl ? (
            <iframe
              src={objectUrl}
              className="w-full h-full"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading PDF...
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-foreground hover:bg-muted bg-transparent"
          >
            Close
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!objectUrl}
            className="btn-enhanced-primary"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
