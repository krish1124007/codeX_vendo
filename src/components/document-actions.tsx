"use client";

import { Download, Mail, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * PDF export (PDFKit) and email (Nodemailer) are server integrations that need
 * external credentials; in this build Print is wired to the browser and the
 * other two are placeholders that explain what they will do.
 */
export function DocumentActions({ docNumber }: { docNumber: string }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => alert(`PDF export for ${docNumber} (PDFKit) — wire up in production.`)}
      >
        <Download size={16} /> Download PDF
      </Button>
      <Button size="sm" variant="secondary" onClick={() => window.print()}>
        <Printer size={16} /> Print
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => alert(`Email invoice ${docNumber} (Nodemailer) — wire up in production.`)}
      >
        <Mail size={16} /> Email invoice
      </Button>
    </div>
  );
}
