"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { ReplyIcon } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/bits";
import { DataTable, SortHeader, selectColumn } from "@/components/data-table";
import { FollowupDialog } from "@/components/followup-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, fmtDate, fmtRelative } from "@/lib/api";

type Row = {
  _id: string;
  email: string;
  name?: string;
  company?: string;
  subject: string;
  firstSentAt?: string;
  lastSentAt?: string;
  followUpCount?: number;
};

export default function FollowupsPage() {
  const [days, setDays] = useState(3);
  const [rows, setRows] = useState<Row[]>([]);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<RowSelectionState>({});
  const [open, setOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api<{ contacts: Row[]; pendingFollowups: number }>(`/api/followups?days=${days}`)
      .then((d) => {
        setRows(d.contacts);
        setPending(d.pendingFollowups);
        setSel({});
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      selectColumn<Row>(),
      {
        accessorKey: "email",
        header: ({ column }) => <SortHeader label="Email" column={column} />,
        cell: ({ row }) => (
          <div className="grid gap-0.5">
            <span className="font-medium">{row.original.email}</span>
            {row.original.name && <span className="text-xs text-muted-foreground">{row.original.name}</span>}
          </div>
        ),
      },
      { accessorKey: "subject", header: "Original subject", cell: ({ getValue }) => <span className="line-clamp-1 text-sm">{getValue() as string}</span> },
      { accessorKey: "followUpCount", header: "Follow-ups sent", cell: ({ getValue }) => <span className="font-mono tabular-nums">{(getValue() as number) || 0}</span> },
      {
        accessorKey: "lastSentAt",
        header: ({ column }) => <SortHeader label="Last email" column={column} />,
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground" title={fmtDate(getValue() as string)}>
            {fmtRelative(getValue() as string)}
          </span>
        ),
      },
    ],
    []
  );

  const ids = Object.keys(sel);

  return (
    <>
      <PageHeader
        title="Follow-ups"
        description={`People you emailed who have not replied. ${pending ? `${pending} follow-ups already scheduled.` : ""}`}
      >
        <Button disabled={!ids.length} onClick={() => setOpen(true)}>
          <ReplyIcon />
          Follow up{ids.length ? ` (${ids.length})` : ""}
        </Button>
      </PageHeader>
      <div className="flex items-end gap-3">
        <div className="grid gap-2">
          <Label htmlFor="days">No reply for at least</Label>
          <div className="relative w-40">
            <Input id="days" type="number" min={0} value={days} onChange={(e) => setDays(Number(e.target.value))} className="pr-12" />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">days</span>
          </div>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        selection={sel}
        onSelectionChange={setSel}
        empty={
          <EmptyState icon={ReplyIcon} title="Nobody to follow up with">
            Contacts show up here once they have been emailed for {days} days without a reply. Replies are detected over IMAP.
          </EmptyState>
        }
      />
      <FollowupDialog contactIds={ids} open={open} onOpenChange={setOpen} onDone={load} />
    </>
  );
}
