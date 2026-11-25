"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DownloadIcon, FileTextIcon, Loader2Icon, StarIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, fmtDate } from "@/lib/api";
import { cn } from "@/lib/utils";

type Resume = { _id: string; filename: string; size: number; isDefault: boolean; createdAt: string };

export default function ResumesPage() {
  const [rows, setRows] = useState<Resume[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(() => api<{ resumes: Resume[] }>("/api/resumes").then((d) => setRows(d.resumes)).catch((e) => toast.error(e.message)), []);
  useEffect(() => {
    load();
  }, [load]);

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await api("/api/resumes", { method: "POST", body: fd });
      toast.success(`Uploaded ${file.name}`);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function makeDefault(id: string) {
    await api(`/api/resumes/${id}`, { method: "PATCH" }).catch((e) => toast.error(e.message));
    load();
  }
  async function remove(id: string) {
    await api(`/api/resumes/${id}`, { method: "DELETE" }).then(() => toast.success("Deleted")).catch((e) => toast.error(e.message));
    load();
  }

  return (
    <>
      <PageHeader title="Resumes" description="Upload your CV once. The default one is preselected when you create a campaign." />

      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) upload(f);
        }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center transition-colors hover:bg-muted/50",
          drag && "border-foreground/40 bg-muted/60"
        )}
      >
        {uploading ? <Loader2Icon className="size-6 animate-spin text-muted-foreground" /> : <UploadIcon className="size-6 text-muted-foreground" />}
        <span className="font-medium">Drop your CV here or click to choose</span>
        <span className="text-xs text-muted-foreground">PDF, DOC or DOCX, up to 5 MB</span>
      </button>
      <input ref={input} type="file" accept=".pdf,.doc,.docx,.rtf" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0]).finally(() => (e.target.value = ""))} />

      {!rows ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={FileTextIcon} title="No CV uploaded yet" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((r) => (
            <Card key={r._id} className="py-4">
              <CardContent className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileTextIcon className="size-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{r.filename}</p>
                    {r.isDefault && <Badge variant="secondary">Default</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(r.size / 1024).toFixed(0)} KB, uploaded {fmtDate(r.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!r.isDefault && (
                    <Button variant="ghost" size="icon-sm" aria-label="Make default" onClick={() => makeDefault(r._id)}>
                      <StarIcon />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon-sm" aria-label="Open" asChild>
                    <a href={`/api/resumes/${r._id}`} target="_blank" rel="noreferrer"><DownloadIcon /></a>
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => remove(r._id)}>
                    <Trash2Icon />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
