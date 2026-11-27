import { ShieldCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// One quiet chip for every status, the same as the landing page and the Sent list:
// strong for things happening now, red for problems, muted for the rest.
type Tone = "muted" | "strong" | "live" | "bad";
const STATUS: Record<string, { label: string; tone: Tone }> = {
  new: { label: "New", tone: "muted" },
  queued: { label: "Queued", tone: "strong" },
  sent: { label: "Already sent", tone: "muted" },
  replied: { label: "Replied", tone: "strong" },
  bounced: { label: "Bounced", tone: "bad" },
  pending: { label: "Scheduled", tone: "muted" },
  paused: { label: "Paused", tone: "muted" },
  sending: { label: "Sending", tone: "live" },
  failed: { label: "Failed", tone: "bad" },
  cancelled: { label: "Cancelled", tone: "muted" },
  running: { label: "Running", tone: "live" },
  done: { label: "Done", tone: "muted" },
};
const TONE: Record<Tone, string> = {
  muted: "text-muted-foreground",
  strong: "border-foreground/30 font-medium text-foreground",
  live: "border-foreground/30 font-medium text-foreground",
  bad: "border-destructive/40 text-destructive",
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, tone: "muted" as Tone };
  return (
    <span className={cn("inline-flex h-6 w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2 text-xs", TONE[s.tone])}>
      <span className={cn("size-1.5 rounded-full", s.tone === "live" ? "animate-pulse bg-green-500" : "bg-current opacity-70")} />
      {s.label}
    </span>
  );
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

// A short, plain note next to a field that takes a password: how it is stored.
export function SecureNote({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-3", className)}>
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <ShieldCheckIcon className="size-4" />
      </span>
      <div className="text-sm">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
