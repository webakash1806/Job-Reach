"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { InboxIcon, PlusIcon } from "lucide-react";
import { EmptyState, PageHeader, StatusBadge } from "@/components/bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { api, fmtRelative } from "@/lib/api";

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

const chartConfig = { sent: { label: "Sent", color: "oklch(0.62 0.14 163)" } } satisfies ChartConfig;

export default function DashboardPage() {
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = () => api<Stats>(`/api/stats?tz=${new Date().getTimezoneOffset()}`).then(setS).catch((e) => setErr(e.message));
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const replyRate = s && s.sent ? Math.round((s.replied / s.sent) * 1000) / 10 : 0;
  const tiles = s
    ? [
        { label: "Emails collected", value: s.total, hint: `${s.new} not contacted yet` },
        { label: "Emailed", value: s.sent, hint: `${s.sentToday} today` },
        { label: "Replies", value: s.replied, hint: s.sent ? `${replyRate}% reply rate` : "No sends yet" },
        { label: "In queue", value: s.queued, hint: s.failedToday ? `${s.failedToday} failed today` : "No failures today" },
      ]
    : [];

  return (
    <>
      <PageHeader title="Dashboard" description="Your outreach at a glance. Updates every 30 seconds.">
        <Button asChild>
          <Link href="/campaigns/new">
            <PlusIcon />
            New campaign
          </Link>
        </Button>
      </PageHeader>

      {err && <p className="text-sm text-destructive">{err}</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {s
          ? tiles.map((t) => (
              <Card key={t.label} className="gap-1">
                <CardHeader>
                  <CardDescription>{t.label}</CardDescription>
                  <CardTitle className="font-mono text-3xl font-semibold tabular-nums">{t.value}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">{t.hint}</CardContent>
              </Card>
            ))
          : Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Emails sent</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            {s ? (
              <ChartContainer config={chartConfig} className="h-56 w-full">
                <BarChart data={s.days} margin={{ left: 0, right: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="sent" fill="var(--color-sent)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <Skeleton className="h-56 w-full" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently collected</CardTitle>
            <CardDescription>
              {s?.imap.enabled
                ? s.imap.error
                  ? `Reply check failed: ${s.imap.error}`
                  : `Inbox checked ${s.imap.lastCheck ? fmtRelative(s.imap.lastCheck) : "not yet"}`
                : "Turn on IMAP in Settings to detect replies"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!s ? (
              <div className="grid gap-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : s.recent.length === 0 ? (
              <EmptyState icon={InboxIcon} title="No emails collected yet">
                <Link href="/extension" className="underline underline-offset-4">Install the Chrome extension</Link> and press Start on LinkedIn.
              </EmptyState>
            ) : (
              <ul className="grid gap-3">
                {s.recent.map((c) => (
                  <li key={c._id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.email}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.keyword || "manual"} {fmtRelative(c.createdAt)}
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
