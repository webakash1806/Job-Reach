"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  HashIcon,
  Loader2Icon,
  MailIcon,
  PaperclipIcon,
  ReplyIcon,
  RotateCcwIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { FollowupDialog } from "@/components/followup-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, fmtDate } from "@/lib/api";
import { cn } from "@/lib/utils";

type Job = {
  _id: string;
  to: string;
  type: string;
  status: string;
  subject?: string;
  scheduledAt: string;
  sentAt?: string;
  error?: string;
  attempts: number;
  contactId?: { _id: string; status: string; name?: string; company?: string; followUpCount?: number } | null;
  campaignId?: { _id: string; name: string } | null;
};
type Detail = { templateName: string | null; resumeFilename: string | null; subject: string; body: string };

const FOLDERS = [
  { id: "sent", label: "Sent", icon: MailIcon, match: (j: Job) => j.status === "sent" },
  { id: "pending", label: "Scheduled", icon: ClockIcon, match: (j: Job) => ["pending", "paused", "sending"].includes(j.status) },
  { id: "replied", label: "Replied", icon: CheckIcon, match: (j: Job) => j.status === "sent" && j.contactId?.status === "replied" },
  { id: "failed", label: "Failed", icon: AlertCircleIcon, match: (j: Job) => j.status === "failed" },
] as const;
type FolderId = (typeof FOLDERS)[number]["id"];

/** What the row's chip says: a sent email whose recruiter replied or bounced shows that instead. */
function chipOf(j: Job) {
  const c = j.contactId?.status;
  if (j.status === "sent" && (c === "replied" || c === "bounced")) return c;
  return j.status;
}

const CHIP: Record<string, { label: string; className: string }> = {
  sent: { label: "Sent", className: "text-muted-foreground" },
  replied: { label: "Replied", className: "border-foreground/40 font-medium text-foreground" },
  bounced: { label: "Bounced", className: "border-destructive/40 text-destructive" },
  pending: { label: "Queued", className: "text-foreground/80" },
  paused: { label: "Paused", className: "text-muted-foreground" },
  sending: { label: "Sending", className: "border-foreground/40 font-medium text-foreground" },
  failed: { label: "Failed", className: "border-destructive/40 text-destructive" },
};

function Chip({ status }: { status: string }) {
  const s = CHIP[status] ?? { label: status, className: "text-muted-foreground" };
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md border px-2 text-xs", s.className)}>
      {status === "sending" ? (
        <Loader2Icon className="size-3 animate-spin" />
      ) : (
        <span className={cn("size-1.5 rounded-full bg-current", status !== "replied" && "opacity-60")} />
      )}
      {s.label}
    </span>
  );
}

const AVATAR = [
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-teal-500/15 text-teal-700 dark:text-teal-300",
];

function Avatar({ name }: { name: string }) {
  const parts = name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  const initials = ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold", AVATAR[Math.abs(h) % AVATAR.length])}>{initials}</span>;
}

const who = (j: Job) => j.contactId?.name || j.to;

export default function SentPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState<FolderId>("sent");
  const [campaign, setCampaign] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [fuFor, setFuFor] = useState<string[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    api<{ jobs: Job[] }>("/api/jobs?status=all")
      .then((d) => setJobs(d.jobs))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const counts = useMemo(() => Object.fromEntries(FOLDERS.map((f) => [f.id, jobs.filter(f.match).length])), [jobs]);
  const campaigns = useMemo(() => {
    const m = new Map<string, string>();
    for (const j of jobs) if (j.campaignId) m.set(j.campaignId._id, j.campaignId.name);
    return [...m];
  }, [jobs]);

  const rows = useMemo(() => {
    const f = FOLDERS.find((x) => x.id === folder)!;
    const needle = q.trim().toLowerCase();
    return jobs.filter(
      (j) =>
        f.match(j) &&
        (!campaign || j.campaignId?._id === campaign) &&
        (!needle || [j.to, j.contactId?.name, j.contactId?.company, j.subject].some((s) => s?.toLowerCase().includes(needle)))
    );
  }, [jobs, folder, campaign, q]);

  const open = rows.find((j) => j._id === openId) ?? null;
  // open the first email of the list when all three columns fit (the @4xl layout), so the reading pane is never empty
  useEffect(() => {
    if (!open && rows.length && (document.querySelector("[data-mail]")?.clientWidth ?? 0) >= 896) setOpenId(rows[0]._id);
  }, [open, rows]);

  useEffect(() => {
    if (!openId) return;
    setDetail(null);
    let live = true;
    api<Detail>(`/api/jobs/${openId}`)
      .then((d) => live && setDetail(d))
      .catch((e) => toast.error(e.message));
    return () => {
      live = false;
    };
  }, [openId]);

  async function act(id: string, action: "retry" | "cancel") {
    try {
      await api(`/api/jobs/${id}`, { method: "POST", json: { action } });
      toast.success(action === "retry" ? "Will retry now" : "Cancelled");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <>
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Sent</h1>
        <p className="max-w-[65ch] text-sm text-muted-foreground">Every email the app has sent or scheduled. Follow-ups reply inside the same thread.</p>
      </div>

      <div data-mail="" className="grid h-[calc(100dvh-13rem)] min-h-[520px] overflow-hidden rounded-xl border bg-card @4xl:grid-cols-[200px_minmax(300px,380px)_1fr]">
        {/* folders */}
        <nav className="hidden flex-col gap-0.5 border-r p-3 @4xl:flex" aria-label="Folders">
          {FOLDERS.map((f) => (
            <button
              key={f.id}
              onClick={() => { setFolder(f.id); setOpenId(null); }}
              className={cn(
                "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors",
                folder === f.id ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <f.icon className="size-4" />
              {f.label}
              <span className="ml-auto text-xs tabular-nums">{counts[f.id] || ""}</span>
            </button>
          ))}
          {campaigns.length > 0 && (
            <>
              <p className="mt-5 px-2.5 pb-1 text-xs text-muted-foreground">Campaigns</p>
              {campaigns.map(([id, name]) => (
                <button
                  key={id}
                  onClick={() => { setCampaign(campaign === id ? null : id); setOpenId(null); }}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-left text-sm transition-colors",
                    campaign === id ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <HashIcon className="size-4 shrink-0" />
                  <span className="truncate">{name}</span>
                </button>
              ))}
            </>
          )}
        </nav>

        {/* list */}
        <section className={cn("flex min-h-0 flex-col border-r", open && "@max-4xl:hidden")}>
          <div className="flex flex-col gap-2 border-b p-3">
            {/* folders as tabs when the three columns do not fit */}
            <div className="flex gap-1 overflow-x-auto @4xl:hidden">
              {FOLDERS.map((f) => (
                <button key={f.id} onClick={() => setFolder(f.id)} className={cn("h-8 shrink-0 rounded-md px-3 text-sm", folder === f.id ? "bg-accent font-medium" : "text-muted-foreground")}>
                  {f.label} <span className="text-xs tabular-nums opacity-70">{counts[f.id] || ""}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, company or subject" className="h-9 pl-8" />
            </div>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {loading && <li className="grid place-items-center p-10"><Loader2Icon className="size-5 animate-spin text-muted-foreground" /></li>}
            {!loading && rows.length === 0 && <li className="p-10 text-center text-sm text-muted-foreground">Nothing here yet.</li>}
            {rows.map((j) => (
              <li key={j._id}>
                <button
                  onClick={() => setOpenId(j._id)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b px-3 py-3 text-left transition-colors",
                    j._id === openId ? "bg-accent" : "hover:bg-accent/40"
                  )}
                >
                  <Avatar name={who(j)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{who(j)}</span>
                    <span className="block truncate text-sm text-muted-foreground">{j.subject || j.to}</span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <Chip status={chipOf(j)} />
                    <span className="text-[11px] tabular-nums text-muted-foreground">{fmtDate(j.sentAt || j.scheduledAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* reading pane */}
        <section className={cn("min-h-0 overflow-y-auto", !open && "@max-4xl:hidden")}>
          {open ? (
            <article className="mx-auto max-w-2xl p-6 md:p-8">
              <button onClick={() => setOpenId(null)} className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground @4xl:hidden">
                <ArrowLeftIcon className="size-4" /> Back
              </button>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  To {who(open)}
                  {detail?.templateName && <> · template {detail.templateName}</>}
                  {detail?.resumeFilename && (
                    <> · <PaperclipIcon className="inline size-3.5" /> {detail.resumeFilename}</>
                  )}
                </p>
                <Chip status={chipOf(open)} />
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">{detail?.subject || open.subject || "(no subject)"}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {open.to} · {open.type === "followup" ? "Follow-up reply" : "First email"} · {open.sentAt ? `sent ${fmtDate(open.sentAt)}` : `scheduled ${fmtDate(open.scheduledAt)}`}
                {open.campaignId && <> · {open.campaignId.name}</>}
              </p>

              {open.error && (
                <p className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{open.error}</p>
              )}

              <div className="mt-6 grid gap-3 text-[15px] leading-relaxed">
                {detail ? (
                  detail.body.split(/\n{2,}/).map((p, i) => (
                    <p key={i} className="whitespace-pre-line">{p}</p>
                  ))
                ) : (
                  <div className="grid gap-2">
                    {[100, 92, 96, 60].map((w) => <div key={w} className="h-4 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />)}
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-2 border-t pt-5">
                {open.status === "failed" && <Button size="sm" onClick={() => act(open._id, "retry")}><RotateCcwIcon />Retry</Button>}
                {(open.status === "pending" || open.status === "paused") && <Button size="sm" variant="outline" onClick={() => act(open._id, "cancel")}><XIcon />Cancel</Button>}
                {open.status === "sent" && open.contactId?.status === "sent" && (
                  <Button size="sm" variant="outline" onClick={() => setFuFor([open.contactId!._id])}><ReplyIcon />Follow up</Button>
                )}
                {open.status === "sent" && open.contactId?.status === "sent" && (
                  <span className="text-xs text-muted-foreground">No reply yet. A follow-up goes out in this same thread.</span>
                )}
              </div>
            </article>
          ) : (
            <div className="grid h-full place-items-center p-10 text-sm text-muted-foreground">Select an email to read it.</div>
          )}
        </section>
      </div>

      <FollowupDialog contactIds={fuFor} open={fuFor.length > 0} onOpenChange={(o) => !o && setFuFor([])} onDone={load} />
    </>
  );
}
