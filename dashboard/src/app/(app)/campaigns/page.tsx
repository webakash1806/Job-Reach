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
      <div className="overflow-hidden rounded-lg border">
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
