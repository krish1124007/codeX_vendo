"use client";

import { toast } from "sonner";
import { useTransition } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendInvoiceEmailAction } from "@/actions/invoices";

export function EmailInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleSendEmail = () => {
    startTransition(async () => {
      const result = await sendInvoiceEmailAction(invoiceId);
      if (result.error) {
        toast.error("Failed to send email: " + result.error);
      } else {
        toast.success("Invoice emailed to vendor successfully!");
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
