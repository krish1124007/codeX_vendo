import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { humanizeEnum } from "@/lib/utils/format";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "primary";

const tones: Record<Tone, string> = {
  neutral: "bg-muted/10 text-muted border-muted/20",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  info: "bg-info/10 text-info border-info/30",
  primary: "bg-primary/10 text-primary border-primary/30",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

// Map every domain status to a tone so badges are consistent app-wide.
const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "success",
  PENDING: "warning",
  BLOCKED: "danger",
  DRAFT: "neutral",
  PUBLISHED: "info",
  CLOSED: "warning",
  AWARDED: "success",
  CANCELLED: "danger",
  SUBMITTED: "info",
  UNDER_REVIEW: "warning",
  SELECTED: "success",
  REJECTED: "danger",
  APPROVED: "success",
  ISSUED: "info",
  ACKNOWLEDGED: "info",
  COMPLETED: "success",
  PENDING_PAYMENT: "warning",
  PAID: "success",
  OVERDUE: "danger",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  return (
    <Badge tone={tone}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {humanizeEnum(status)}
    </Badge>
  );
}
