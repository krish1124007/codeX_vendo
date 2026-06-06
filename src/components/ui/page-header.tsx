import * as React from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="animate-fade-up mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
