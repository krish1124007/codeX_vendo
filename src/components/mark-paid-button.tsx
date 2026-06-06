"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markInvoicePaidAction } from "@/actions/invoices";
import { Button } from "@/components/ui/button";

export function MarkPaidButton({
  invoiceId,
  size = "md",
}: {
  invoiceId: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size={size}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await markInvoicePaidAction(invoiceId);
          router.refresh();
        })
      }
    >
      {pending ? "Updating…" : "Mark as paid"}
    </Button>
  );
}
