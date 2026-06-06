"use client";

import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { selectQuotationAction } from "@/actions/quotations";
import { Button } from "@/components/ui/button";

export function SelectQuotationButton({
  quotationId,
  lowest,
}: {
  quotationId: string;
  lowest: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      const res = await selectQuotationAction(quotationId);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      router.push("/approvals");
    });
  }

  return (
    <Button
      onClick={handle}
      disabled={pending}
      variant={lowest ? "primary" : "secondary"}
      size="sm"
      className="w-full"
    >
      {pending ? "Selecting…" : lowest ? "Select & Approve" : "Select"}
    </Button>
  );
}
