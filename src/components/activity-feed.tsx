import { Icon } from "@/components/ui/icon";
import { formatDateTime } from "@/lib/utils/format";
import type { ActivityLog, ActivityType } from "@/types";

const TYPE_META: Record<ActivityType, { icon: string; tone: string }> = {
  AUTH: { icon: "Users", tone: "text-muted" },
  VENDOR: { icon: "Building2", tone: "text-info" },
  RFQ: { icon: "FileText", tone: "text-info" },
  QUOTATION: { icon: "CheckCircle2", tone: "text-success" },
  APPROVAL: { icon: "Clock", tone: "text-warning" },
  PO: { icon: "ShoppingCart", tone: "text-primary" },
  INVOICE: { icon: "FileSpreadsheet", tone: "text-danger" },
};

export function ActivityFeed({ entries }: { entries: ActivityLog[] }) {
  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">No activity yet.</p>;
  }

  return (
    <ol className="relative space-y-5 border-l border-border pl-6">
      {entries.map((entry) => {
        const meta = TYPE_META[entry.type];
        return (
          <li key={entry.id} className="relative">
            <span
              className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card ${meta.tone}`}
            >
              <Icon name={meta.icon} size={13} />
            </span>
            <p className="text-sm">
              <span className="font-medium">{entry.action}</span>
              <span className="text-muted"> — {entry.description}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {formatDateTime(entry.createdAt)}
              {entry.actorName ? ` · ${entry.actorName}` : ""}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
