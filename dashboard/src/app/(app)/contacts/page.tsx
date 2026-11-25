"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { DownloadIcon, ExternalLinkIcon, InboxIcon, PlusIcon, SearchIcon, SendIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader, StatusBadge } from "@/components/bits";
import { DataTable, SortHeader, selectColumn } from "@/components/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, CAMPAIGN_IDS_KEY, fmtDate } from "@/lib/api";

type Contact = {
  _id: string;
  email: string;
  name?: string;
  company?: string;
  keyword?: string;
  postUrl?: string;
  postSnippet?: string;
  source: string;
  status: string;
  createdAt: string;
  lastSentAt?: string;
  followUpCount?: number;
};



function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const split = (l: string) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  const head = split(lines[0]).map((h) => h.toLowerCase());
  const hasHeader = head.includes("email");
  const idx = (k: string) => (hasHeader ? head.indexOf(k) : -1);
  const ei = hasHeader ? idx("email") : 0;
  const rows = (hasHeader ? lines.slice(1) : lines).map(split);
  const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return rows
    .map((r) => ({
      email: r[ei] ?? "",
      name: idx("name") >= 0 ? r[idx("name")] : "",
      company: idx("company") >= 0 ? r[idx("company")] : "",
    }))
    .filter((r) => rx.test(r.email));
}

function toCsv(rows: Contact[]) {
  const esc = (v?: string | number) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["email", "name", "company", "keyword", "status", "postUrl", "collected"];
  return [head.join(","), ...rows.map((r) => [r.email, r.name, r.company, r.keyword, r.status, r.postUrl, r.createdAt].map(esc).join(","))].join("\n");
}

export default function ContactsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sel, setSel] = useState<RowSelectionState>({});
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ status, ...(q ? { q } : {}) });
      const d = await api<{ contacts: Contact[] }>(`/api/contacts?${p}`);
      setRows(d.contacts);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const selectedIds = Object.keys(sel);

  async function remove() {
    try {
      const r = await api<{ deleted: number }>("/api/contacts", { method: "DELETE", json: { ids: selectedIds } });
      toast.success(`Deleted ${r.deleted} contacts`);
      setSel({});
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function importCsv(file: File) {
    const items = parseCsv(await file.text());
    if (!items.length) return toast.error("No valid emails found. Use a CSV with an 'email' column.");
    try {
      const r = await api<{ inserted: number; duplicates: number }>("/api/contacts", { method: "POST", json: { items, source: "csv" } });
      toast.success(`Imported ${r.inserted} new, skipped ${r.duplicates} duplicates`);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  function exportCsv() {
    const blob = new Blob([toCsv(selectedIds.length ? rows.filter((r) => sel[r._id]) : rows)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function emailSelected() {
    sessionStorage.setItem(CAMPAIGN_IDS_KEY, JSON.stringify(selectedIds));
    router.push("/campaigns/new?from=selection");
  }

  const columns = useMemo<ColumnDef<Contact>[]>(
    () => [
      selectColumn<Contact>(),
      {
        accessorKey: "email",
        header: ({ column }) => <SortHeader label="Email" column={column} />,
        cell: ({ row }) => (
          <div className="grid min-w-48 gap-0.5">
            <span className="font-medium">{row.original.email}</span>
            {(row.original.name || row.original.company) && (
              <span className="text-xs text-muted-foreground">{[row.original.name, row.original.company].filter(Boolean).join(", ")}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "postSnippet",
        header: "From post",
        cell: ({ row }) => (
          <div className="flex max-w-md items-start gap-2">
            <p className="line-clamp-2 text-xs text-muted-foreground">{row.original.postSnippet || (row.original.source === "extension" ? "No post text saved" : "Added manually")}</p>
            {row.original.postUrl && (
              <a href={row.original.postUrl} target="_blank" rel="noreferrer" aria-label="Open LinkedIn post" className="shrink-0 text-muted-foreground hover:text-foreground">
                <ExternalLinkIcon className="size-3.5" />
              </a>
            )}
          </div>
        ),
      },
      { accessorKey: "keyword", header: "Keyword", cell: ({ getValue }) => <span className="text-xs">{(getValue() as string) || ""}</span> },
      {
        accessorKey: "status",
        header: ({ column }) => <SortHeader label="Status" column={column} />,
        cell: ({ row }) => (
          <div className="grid gap-1">
            <StatusBadge status={row.original.status} />
            {!!row.original.followUpCount && <span className="text-xs text-muted-foreground">{row.original.followUpCount} follow-up</span>}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <SortHeader label="Collected" column={column} />,
        cell: ({ getValue }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(getValue() as string)}</span>,
      },
    ],
    []
  );

  return (
    <>
      <PageHeader title="Contacts" description="Emails collected from LinkedIn posts. People you already emailed are marked and never emailed twice.">
        <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0]).finally(() => (e.target.value = ""))} />
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <UploadIcon />
          Import CSV
        </Button>
        <Button variant="outline" onClick={exportCsv} disabled={!rows.length}>
          <DownloadIcon />
          Export
        </Button>
        <Button variant="outline" onClick={() => setAddOpen(true)}>
          <PlusIcon />
          Add
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-80">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search email, name, keyword, post text" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" aria-label="Search contacts" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-44" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="sent">Already sent</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
          </SelectContent>
        </Select>
        {selectedIds.length > 0 && (
          <div className="flex gap-2 sm:ml-auto">
            <Button onClick={emailSelected}>
              <SendIcon />
              Email {selectedIds.length}
            </Button>
            <Button variant="destructive" onClick={() => setConfirmDel(true)}>
              <Trash2Icon />
              Delete
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        selection={sel}
        onSelectionChange={setSel}
        empty={
          <EmptyState icon={InboxIcon} title={q || status !== "all" ? "No contacts match" : "No contacts yet"}>
            {q || status !== "all" ? "Try another search or status." : "Run the Chrome extension on LinkedIn, or import a CSV."}
          </EmptyState>
        }
      />

      <AddContactDialog open={addOpen} onOpenChange={setAddOpen} onAdded={load} />

      <AlertDialog open={confirmDel} onOpenChange={setConfirmDel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} contacts?</AlertDialogTitle>
            <AlertDialogDescription>Queued emails to them are cancelled. If the extension finds them again they come back as new.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AddContactDialog({ open, onOpenChange, onAdded }: { open: boolean; onOpenChange: (o: boolean) => void; onAdded: () => void }) {
  const [f, setF] = useState({ email: "", name: "", company: "" });
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api<{ inserted: number }>("/api/contacts", { method: "POST", json: { items: [f], source: "manual" } });
      toast[r.inserted ? "success" : "info"](r.inserted ? "Contact added" : "That email is already in your contacts");
      setF({ email: "", name: "", company: "" });
      onOpenChange(false);
      onAdded();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={save} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Add contact</DialogTitle>
            <DialogDescription>Duplicates are ignored automatically.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="c-email">Email</Label>
            <Input id="c-email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-company">Company</Label>
              <Input id="c-company" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>Add contact</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
