"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  InboxIcon,
  MailIcon,
  MegaphoneIcon,
  MessageSquareReplyIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";
import { EmptyState, StatusBadge } from "@/components/bits";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { api, fmtRelative } from "@/lib/api";
import { cn } from "@/lib/utils";

type Stats = {
  total: number;
  new: number;
  sent: number;
  replied: number;
  bounced: number;
  queued: number;
  failedToday: number;
  sentToday: number;
  days: { day: string; sent: number }[];
  recent: { _id: string; email: string; name?: string; keyword?: string; createdAt: string; status: string }[];
  imap: { enabled: boolean; lastCheck?: string; error?: string };
};
type Campaign = { _id: string; name: string; status: "running" | "paused" | "done" | "cancelled"; total: number; counts: Record<string, number>; nextAt: string | null };
type Me = { name: string; email: string; smtp: { hasPassword: boolean }; imap: { enabled: boolean } };
type Extra = { me: Me; campaigns: Campaign[]; templates: number; resumes: number };

const chartConfig = { sent: { label: "Sent", color: "var(--primary)" } } satisfies ChartConfig;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
const initials = (name?: string, email?: string) =>
  (name || email || "?").replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

/** "in 3 min" / "now" for the next send */
function until(d?: string | null) {
  if (!d) return null;
  const min = Math.round((new Date(d).getTime() - Date.now()) / 60000);
  if (min <= 0) return "now";
  if (min < 60) return `in ${min} min`;
  const h = Math.round(min / 60);
  return h < 24 ? `in ${h} h` : `in ${Math.round(h / 24)} d`;
}

/** a small line of the last 14 days, for a metric card */
function Spark({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 100},${30 - (v / max) * 26}`).join(" ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-8 w-24 overflow-visible" aria-hidden="true">
      <polyline points={`0,32 ${pts} 100,32`} className="fill-primary/15 stroke-none" />
      <polyline points={pts} className="fill-none stroke-primary" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

/** a ring for a percentage */
function Ring({ pct }: { pct: number }) {
  const r = 15, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 36 36" className="size-10 -rotate-90" aria-hidden="true">
      <circle cx="18" cy="18" r={r} className="fill-none stroke-muted" strokeWidth="4" />
      <circle cx="18" cy="18" r={r} className="fill-none stroke-primary transition-[stroke-dasharray] duration-700" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(Math.min(pct, 100) / 100) * c} ${c}`} />
    </svg>
  );
}

function Metric({ icon: Icon, label, value, hint, children, accent }: { icon: React.ElementType; label: string; value: React.ReactNode; hint: React.ReactNode; children?: React.ReactNode; accent?: boolean }) {
  return (
    <Card className={cn("relative gap-0 overflow-hidden py-4", accent && "border-primary/30")}>
      {accent && <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full bg-primary/15 blur-2xl" />}
      <CardContent className="flex items-end justify-between gap-3 px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={cn("grid size-7 place-items-center rounded-md border bg-background", accent && "border-primary/30 text-primary")}>
              <Icon className="size-3.5" />
            </span>
            {label}
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

const CAMPAIGN_STATE: Record<Campaign["status"], { label: string; dot: string }> = {
  running: { label: "Sending", dot: "bg-emerald-500 animate-pulse" },
  paused: { label: "Paused", dot: "bg-amber-500" },
  done: { label: "Done", dot: "bg-muted-foreground" },
  cancelled: { label: "Cancelled", dot: "bg-destructive" },
};

export default function DashboardPage() {
  const [s, setS] = useState<Stats | null>(null);
  const [x, setX] = useState<Extra | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = () => api<Stats>(`/api/stats?tz=${new Date().getTimezoneOffset()}`).then(setS).catch((e) => setErr(e.message));
    const loadExtra = () =>
      Promise.all([
        api<Me>("/api/settings"),
        api<{ campaigns: Campaign[] }>("/api/campaigns"),
        api<{ templates: unknown[] }>("/api/templates"),
        api<{ resumes: unknown[] }>("/api/resumes"),
      ])
        .then(([me, c, t, r]) => setX({ me, campaigns: c.campaigns, templates: t.templates.length, resumes: r.resumes.length }))
        .catch(() => {});
    load();
    loadExtra();
    const t = setInterval(() => { load(); loadExtra(); }, 30000);
    return () => clearInterval(t);
  }, []);

  const replyRate = s && s.sent ? Math.round((s.replied / s.sent) * 1000) / 10 : 0;
  const active = x?.campaigns.filter((c) => c.status === "running" || c.status === "paused") ?? [];
  const nextSend = x?.campaigns.filter((c) => c.status === "running" && c.nextAt).map((c) => c.nextAt!).sort()[0];

  // what is left to set up; the card hides once every step is done
  const steps = x && s
    ? [
        { done: x.me.smtp.hasPassword, label: "Connect your email", href: "/settings" },
        { done: x.me.imap.enabled, label: "Turn on reply detection", href: "/settings?tab=imap" },
        { done: x.resumes > 0, label: "Upload your CV", href: "/resumes" },
        { done: x.templates > 0, label: "Write a message", href: "/templates" },
        { done: s.total > 0, label: "Collect emails on LinkedIn", href: "/extension" },
        { done: x.campaigns.length > 0, label: "Start a campaign", href: "/campaigns/new" },
      ]
    : [];
  const doneSteps = steps.filter((st) => st.done).length;

  const funnel = s
    ? [
        { label: "Collected", value: s.total, of: s.total },
        { label: "Emailed", value: s.sent, of: s.total },
        { label: "Replied", value: s.replied, of: s.total },
      ]
    : [];

  return (
    <>
      {/* greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            {greeting()}
            {x?.me.name ? `, ${x.me.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span className={cn("size-2 rounded-full", s?.imap.enabled ? (s.imap.error ? "bg-destructive" : "bg-emerald-500") : "bg-muted-foreground/50")} />
            {!s
              ? "Loading..."
              : s.imap.enabled
                ? s.imap.error
                  ? `Reply check failed: ${s.imap.error}`
                  : `Inbox checked ${s.imap.lastCheck ? fmtRelative(s.imap.lastCheck) : "soon"}`
                : "Reply detection is off"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/sent">Open Sent</Link>
          </Button>
          <Button asChild>
            <Link href="/campaigns/new">
              <PlusIcon />
              New campaign
            </Link>
          </Button>
        </div>
      </div>

      {err && <p className="text-sm text-destructive">{err}</p>}

      {/* setup, until it is all done */}
      {steps.length > 0 && doneSteps < steps.length && (
        <Card className="gap-4 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-base">Finish setting up</CardTitle>
            <CardDescription>{doneSteps} of {steps.length} done. Each step links to where you do it.</CardDescription>
            <div className="mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${(doneSteps / steps.length) * 100}%` }} />
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 px-4 @2xl:grid-cols-3">
            {steps.map((st) => (
              <Link
                key={st.label}
                href={st.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:border-foreground/20 hover:bg-accent/40",
                  st.done && "text-muted-foreground",
                )}
              >
                <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", st.done ? "border-primary bg-primary text-primary-foreground" : "border-dashed border-muted-foreground/50")}>
                  {st.done && <CheckIcon className="size-3" />}
                </span>
                <span className={cn("flex-1", st.done && "line-through decoration-muted-foreground/40")}>{st.label}</span>
                {!st.done && <ArrowRightIcon className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* metrics */}
      <div className="grid gap-4 @lg:grid-cols-2 @5xl:grid-cols-4">
        {s ? (
          <>
            <Metric icon={UsersIcon} label="Emails collected" value={s.total} hint={`${s.new} not contacted yet`} />
            <Metric icon={MailIcon} label="Emailed" value={s.sent} hint={`${s.sentToday} today`} accent>
              <Spark values={s.days.map((d) => d.sent)} />
            </Metric>
            <Metric icon={MessageSquareReplyIcon} label="Replies" value={s.replied} hint={s.sent ? `${replyRate}% reply rate` : "No sends yet"}>
              <Ring pct={replyRate} />
            </Metric>
            <Metric
              icon={ClockIcon}
              label="In queue"
              value={s.queued}
              hint={s.failedToday ? <span className="text-destructive">{s.failedToday} failed today</span> : nextSend ? `Next email ${until(nextSend)}` : "Nothing scheduled"}
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[122px] rounded-xl" />)
        )}
      </div>

      {/* sends over time, and how collected emails turn into replies */}
      <div className="grid gap-4 @4xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Emails sent</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
            {s && (
              <CardAction className="text-right">
                <p className="text-2xl font-semibold tabular-nums">{s.days.reduce((a, d) => a + d.sent, 0)}</p>
                <p className="text-xs text-muted-foreground">in 14 days</p>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            {s ? (
              <ChartContainer config={chartConfig} className="h-56 w-full">
                <AreaChart data={s.days} margin={{ left: 4, right: 4, top: 8 }}>
                  <defs>
                    <linearGradient id="sentFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-sent)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-sent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                  <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltipContent />} />
                  <Area dataKey="sent" type="monotone" stroke="var(--color-sent)" strokeWidth={2} fill="url(#sentFill)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ChartContainer>
            ) : (
              <Skeleton className="h-56 w-full" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>From collected to replied</CardTitle>
            <CardDescription>Every email you have collected</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            {s ? (
              funnel.map((f, i) => {
                const pct = f.of ? (f.value / f.of) * 100 : 0;
                return (
                  <div key={f.label} className="grid gap-2">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-muted-foreground">{f.label}</span>
                      <span>
                        <span className="font-semibold tabular-nums">{f.value}</span>
                        {i > 0 && <span className="ml-2 text-xs text-muted-foreground tabular-nums">{Math.round(pct)}%</span>}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full transition-[width] duration-700", i === 2 ? "bg-primary" : i === 1 ? "bg-primary/60" : "bg-foreground/25")} style={{ width: `${Math.max(pct, f.value ? 3 : 0)}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <Skeleton className="h-40 w-full" />
            )}
            {s && s.bounced > 0 && <p className="text-xs text-muted-foreground">{s.bounced} bounced and were taken out of follow-ups.</p>}
          </CardContent>
        </Card>
      </div>

      {/* campaigns and the newest contacts */}
      <div className="grid gap-4 @4xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Active campaigns</CardTitle>
            <CardDescription>{active.length ? `${active.length} sending or paused` : "Nothing running right now"}</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/campaigns">All <ArrowRightIcon /></Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {!x ? (
              <div className="grid gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : active.length === 0 ? (
              <EmptyState icon={MegaphoneIcon} title="No active campaigns">
                <Link href="/campaigns/new" className="underline underline-offset-4">Start one</Link> to send to the emails you collected.
              </EmptyState>
            ) : (
              <ul className="grid gap-2">
                {active.map((c) => {
                  const sent = (c.counts.sent ?? 0) + (c.counts.replied ?? 0);
                  const total = Math.max(c.total, sent + (c.counts.pending ?? 0) + (c.counts.sending ?? 0) + (c.counts.failed ?? 0));
                  const pct = total ? Math.round((sent / total) * 100) : 0;
                  const st = CAMPAIGN_STATE[c.status];
                  return (
                    <li key={c._id}>
                      <Link href={`/campaigns/${c._id}`} className="grid gap-2 rounded-lg border p-3 transition-colors hover:border-foreground/20 hover:bg-accent/40">
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate font-medium">{c.name}</span>
                          <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                            <span className={cn("size-1.5 rounded-full", st.dot)} />
                            {st.label}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                          <span>{sent} of {total} sent</span>
                          <span>{c.status === "running" && c.nextAt ? `Next ${until(c.nextAt)}` : c.counts.failed ? `${c.counts.failed} failed` : `${pct}%`}</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently collected</CardTitle>
            <CardDescription>From the Chrome extension</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/contacts">All <ArrowRightIcon /></Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {!s ? (
              <div className="grid gap-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : s.recent.length === 0 ? (
              <EmptyState icon={InboxIcon} title="No emails collected yet">
                <Link href="/extension" className="underline underline-offset-4">Install the Chrome extension</Link> and press Start on LinkedIn.
              </EmptyState>
            ) : (
              <ul className="grid">
                {s.recent.map((c) => (
                  <li key={c._id} className="flex items-center gap-3 border-b py-2.5 text-sm last:border-0">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border bg-muted text-[11px] font-semibold">{initials(c.name, c.email)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{c.name || c.email}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.keyword || "manual"} · {fmtRelative(c.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
