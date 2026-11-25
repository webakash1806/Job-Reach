"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { PauseIcon, PlayIcon, Trash2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatusBadge } from "@/components/bits";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api, fmtDate } from "@/lib/api";

type Job = { _id: string; to: string; type: string; status: string; scheduledAt: string; sentAt?: string; error?: string };
type Campaign = {
  _id: string;
  name: string;
  status: string;
  total: number;
  intervalMode: string;
  intervalSec: number;
  minSec: number;
  maxSec: number;
  dailyCap: number;
  windowStart?: string;
  windowEnd?: string;
  templateId?: { name: string };
  resumeId?: { filename: string };
  followUp?: { enabled: boolean; afterDays: number; maxCount: number };
};

export default function CampaignDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [c, setC] = useState<Campaign | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () =>
      api<{ campaign: Campaign; jobs: Job[] }>(`/api/campaigns/${id}`)
        .then((d) => {
          setC(d.campaign);
          setJobs(d.jobs);
        })
        .catch((e) => toast.error(e.message)),
    [id]
  );

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  async function act(action: "pause" | "resume" | "cancel") {
    setBusy(true);
    try {
      await api(`/api/campaigns/${id}`, { method: "POST", json: { action } });
      toast.success(action === "pause" ? "Paused" : action === "resume" ? "Resumed, remaining emails rescheduled from now" : "Cancelled");
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    try {
      await api(`/api/campaigns/${id}`, { method: "DELETE" });
      router.push("/campaigns");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const count = (s: string) => jobs.filter((j) => j.status === s && j.type === "initial").length;
  const sent = count("sent");

  const columns = useMemo<ColumnDef<Job>[]>(
    () => [
      { accessorKey: "to", header: "Recipient", cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
      { accessorKey: "type", header: "Type", cell: ({ getValue }) => <span className="text-xs capitalize">{getValue() as string}</span> },
      { accessorKey: "status", header: "Status", cell: ({ row }) => (
          <div className="grid gap-1">
            <StatusBadge status={row.original.status} />
            {row.original.error && <span className="max-w-xs text-xs text-destructive">{row.original.error}</span>}
          </div>
        ) },
      { id: "time", header: "Time", cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(row.original.sentAt || row.original.scheduledAt)}</span> },
    ],
    []
  );

  if (!c) return <p className="text-sm text-muted-foreground">Loading campaign...</p>;
  const gap = c.intervalMode === "fixed" ? `every ${c.intervalSec}s` : `random ${c.minSec} to ${c.maxSec}s`;

  return (
    <>
      <PageHeader title={c.name}>
        <StatusBadge status={c.status} />
        {c.status === "running" && (
          <Button variant="outline" disabled={busy} onClick={() => act("pause")}><PauseIcon />Pause</Button>
        )}
        {c.status === "paused" && (
          <Button disabled={busy} onClick={() => act("resume")}><PlayIcon />Resume</Button>
        )}
        {(c.status === "running" || c.status === "paused") && (
          <Button variant="destructive" disabled={busy} onClick={() => act("cancel")}><XIcon />Cancel</Button>
        )}
        {(c.status === "done" || c.status === "cancelled") && (
          <Button variant="ghost" onClick={del}><Trash2Icon />Delete</Button>
        )}
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>{sent} of {c.total} sent</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Progress value={(sent / Math.max(1, c.total)) * 100} />
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div><p className="font-mono text-xl tabular-nums">{count("pending") + count("paused")}</p><p className="text-xs text-muted-foreground">waiting</p></div>
              <div><p className="font-mono text-xl tabular-nums">{sent}</p><p className="text-xs text-muted-foreground">sent</p></div>
              <div><p className="font-mono text-xl tabular-nums">{count("failed")}</p><p className="text-xs text-muted-foreground">failed</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Template</dt><dd>{c.templateId?.name ?? "Deleted"}</dd>
              <dt className="text-muted-foreground">CV</dt><dd>{c.resumeId?.filename ?? "No attachment"}</dd>
              <dt className="text-muted-foreground">Gap</dt><dd>{gap}, max {c.dailyCap} per day</dd>
              <dt className="text-muted-foreground">Hours</dt><dd>{c.windowStart && c.windowEnd ? `${c.windowStart} to ${c.windowEnd}` : "Any time"}</dd>
              <dt className="text-muted-foreground">Follow-up</dt>
              <dd>{c.followUp?.enabled ? `after ${c.followUp.afterDays} days, up to ${c.followUp.maxCount}` : "Off"}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={jobs} pageSize={50} />
    </>
  );
}
