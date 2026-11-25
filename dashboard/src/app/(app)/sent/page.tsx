"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MailCheckIcon, ReplyIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader, StatusBadge } from "@/components/bits";
import { DataTable, SortHeader } from "@/components/data-table";
import { FollowupDialog } from "@/components/followup-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, fmtDate } from "@/lib/api";

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
  contactId?: { _id: string; status: string; name?: string; followUpCount?: number } | null;
  campaignId?: { name: string } | null;
};

export default function SentPage() {
  const [tab, setTab] = useState("sent");
  const [rows, setRows] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [fuFor, setFuFor] = useState<string[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    api<{ jobs: Job[] }>(`/api/jobs?status=${tab}`)
      .then((d) => setRows(d.jobs))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(load, [load]);

  const act = useCallback(
    async (id: string, action: "retry" | "cancel") => {
      try {
        await api(`/api/jobs/${id}`, { method: "POST", json: { action } });
        toast.success(action === "retry" ? "Will retry now" : "Cancelled");
        load();
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    [load]
  );

  const columns = useMemo<ColumnDef<Job>[]>(
    () => [
      {
        accessorKey: "to",
        header: ({ column }) => <SortHeader label="To" column={column} />,
        cell: ({ row }) => (
          <div className="grid min-w-48 gap-0.5">
            <span className="font-medium">{row.original.to}</span>
            <span className="text-xs text-muted-foreground">{row.original.campaignId?.name ?? "Manual follow-up"}</span>
          </div>
        ),
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <div className="grid max-w-sm gap-0.5">
            <span className="line-clamp-1 text-sm">{row.original.subject || ""}</span>
            <span className="text-xs capitalize text-muted-foreground">{row.original.type === "followup" ? "Follow-up reply" : "First email"}</span>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const j = row.original;
          const contactStatus = j.contactId?.status;
          return (
            <div className="grid gap-1">
              <StatusBadge status={j.status === "sent" && (contactStatus === "replied" || contactStatus === "bounced") ? contactStatus : j.status} />
              {j.error && <span className="max-w-xs text-xs text-destructive">{j.error}</span>}
            </div>
          );
        },
      },
      {
        id: "time",
        accessorFn: (j) => j.sentAt || j.scheduledAt,
        header: ({ column }) => <SortHeader label={tab === "pending" ? "Scheduled" : "Time"} column={column} />,
        cell: ({ getValue }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(getValue() as string)}</span>,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const j = row.original;
          if (j.status === "failed")
            return <Button size="sm" variant="outline" onClick={() => act(j._id, "retry")}><RotateCcwIcon />Retry</Button>;
          if (j.status === "pending" || j.status === "paused")
            return <Button size="sm" variant="ghost" onClick={() => act(j._id, "cancel")}><XIcon />Cancel</Button>;
          if (j.status === "sent" && j.contactId?.status === "sent")
            return <Button size="sm" variant="outline" onClick={() => setFuFor([j.contactId!._id])}><ReplyIcon />Follow up</Button>;
          return null;
        },
      },
    ],
    [act, tab]
  );

  return (
    <>
      <PageHeader title="Sent" description="Every email the app has sent or scheduled. Follow-ups reply inside the same thread." />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="pending">Scheduled</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
      </Tabs>
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        pageSize={50}
        empty={<EmptyState icon={MailCheckIcon} title={tab === "sent" ? "Nothing sent yet" : tab === "pending" ? "Nothing scheduled" : "No failures"} />}
      />
      <FollowupDialog contactIds={fuFor} open={fuFor.length > 0} onOpenChange={(o) => !o && setFuFor([])} onDone={load} />
    </>
  );
}
