"use client";

import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { decideApprovalAction } from "@/actions/approvals";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";

export function ApprovalDecision({ approvalId }: { approvalId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [remarks, setRemarks] = useState("");

  function decide(decision: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      const res = await decideApprovalAction({ approvalId, decision, remarks });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.poId) router.push(`/purchase-orders/${res.poId}`);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="remarks">Approval remarks</Label>
        <Textarea
          id="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add your comments or conditions…"
        />
      </div>
      <div className="flex gap-2">
        <Button className="flex-1" disabled={pending} onClick={() => decide("APPROVED")}>
          {pending ? "Processing…" : "Approve"}
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          disabled={pending}
          onClick={() => decide("REJECTED")}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
