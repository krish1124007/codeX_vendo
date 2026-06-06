"use client";

import { useTransition } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendInvoiceEmailAction } from "@/actions/invoices";

export function EmailInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleSendEmail = () => {
    startTransition(async () => {
      const result = await sendInvoiceEmailAction(invoiceId);
      if (result.ok) {
        alert("Invoice emailed to vendor successfully!");
      } else {
        alert("Failed to send email: " + result.error);
      }
    });
  };

  return (
    <Button variant="outline" onClick={handleSendEmail} disabled={isPending}>
      <Mail size={16} className="mr-2" />
      {isPending ? "Sending..." : "Email Invoice"}
    </Button>
  );
}
