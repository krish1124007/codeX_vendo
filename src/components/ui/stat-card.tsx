import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/card";

type Accent = "primary" | "info" | "warning" | "danger" | "success";

const accentText: Record<Accent, string> = {
  primary: "text-primary",
  info: "text-info",
  warning: "text-warning",
  danger: "text-danger",
  success: "text-success",
};

export function StatCard({
  label,
  value,
  icon,
  accent = "primary",
  delta,
  trend,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  accent?: Accent;
  delta?: string;
  trend?: "up" | "down";
  hint?: string;
}) {
  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        {icon && (
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg bg-card-hover",
              accentText[accent],
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <p className={cn("mt-3 text-[1.9rem] font-semibold leading-none tracking-tight tabular-nums", accentText[accent])}>
        {value}
      </p>
      <div className="mt-3 flex items-center gap-2">
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
              trend === "down"
                ? "bg-danger/10 text-danger"
                : "bg-success/10 text-success",
            )}
          >
            {trend === "down" ? (
              <ArrowDownRight size={12} />
            ) : (
              <ArrowUpRight size={12} />
            )}
            {delta}
          </span>
        )}
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
    </Card>
  );
}
