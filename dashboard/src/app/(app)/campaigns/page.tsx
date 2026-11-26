"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader, StatusBadge } from "@/components/bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, fmtDate, fmtRelative } from "@/lib/api";

type Row = {
  _id: string;
  name: string;
  status: string;
  total: number;
  createdAt: string;
  nextAt: string | null;
  counts: Record<string, number>;
  followUp?: { enabled: boolean };
};

export default function CampaignsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    const load = () => api<{ campaigns: Row[] }>("/api/campaigns").then((d) => setRows(d.campaigns)).catch((e) => toast.error(e.message));
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <PageHeader title="Campaigns" description="Bulk sends on a schedule. Open one to pause, resume or cancel it.">
        <Button asChild>
          <Link href="/campaigns/new">
            <PlusIcon />
            New campaign
          </Link>
        </Button>
      </PageHeader>
      {/* phones: one card per campaign */}
      <div className="grid gap-2 @3xl:hidden">
        {!rows ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)
        ) : rows.length === 0 ? (
          <div className="rounded-lg border p-6">
            <EmptyState icon={SendIcon} title="No campaigns yet">Add a template and a CV, then start your first campaign.</EmptyState>
          </div>
        ) : (
          rows.map((r) => {
            const sent = r.counts.sent ?? 0;
            const failed = r.counts.failed ?? 0;
            return (
              <Link key={r._id} href={`/campaigns/${r._id}`} className="grid gap-3 rounded-lg border bg-card p-4 transition-colors active:bg-muted/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.followUp?.enabled ? "Auto follow-up on · " : ""}{fmtDate(r.createdAt)}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <Progress value={Math.min(100, (sent / (r.total || 1)) * 100)} />
                <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                  <span>{sent} sent{failed ? `, ${failed} failed` : ""} of {r.total}</span>
                  {r.nextAt && <span>Next {fmtRelative(r.nextAt)}</span>}
                </div>
              </Link>
            );
          })
        )}
      </div>
      <div className="hidden overflow-x-auto rounded-lg border @3xl:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-64">Progress</TableHead>
              <TableHead>Next email</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!rows ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-32" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState icon={SendIcon} title="No campaigns yet">
                    Add a template and a CV, then start your first campaign.
                  </EmptyState>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => {
                const sent = r.counts.sent ?? 0;
                const failed = r.counts.failed ?? 0;
                const initialTotal = r.total || 1;
                return (
                  <TableRow key={r._id}>
                    <TableCell>
                      <Link href={`/campaigns/${r._id}`} className="font-medium hover:underline">{r.name}</Link>
                      {r.followUp?.enabled && <p className="text-xs text-muted-foreground">Auto follow-up on</p>}
                    </TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell>
                      <div className="grid gap-1">
                        <Progress value={Math.min(100, (sent / initialTotal) * 100)} />
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {sent} sent{failed ? `, ${failed} failed` : ""} of {r.total}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{r.nextAt ? fmtRelative(r.nextAt) : ""}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(r.createdAt)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
