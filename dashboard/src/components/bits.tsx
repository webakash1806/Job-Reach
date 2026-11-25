import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-secondary text-secondary-foreground" },
  queued: { label: "Queued", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  sent: { label: "Already sent", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  replied: { label: "Replied", className: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950" },
  bounced: { label: "Bounced", className: "bg-destructive/10 text-destructive" },
  pending: { label: "Scheduled", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  paused: { label: "Paused", className: "bg-secondary text-secondary-foreground" },
  sending: { label: "Sending", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
  running: { label: "Running", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  done: { label: "Done", className: "bg-secondary text-secondary-foreground" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, className: "" };
  return <Badge className={cn("font-normal", s.className)}>{s.label}</Badge>;
}

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="max-w-[65ch] text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      {children && <div className="max-w-sm text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
