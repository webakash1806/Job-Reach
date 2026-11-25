"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { TimingFields, defaultTiming, timingPayload, type TimingValue } from "@/components/timing-fields";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, toLocalInput } from "@/lib/api";

const NONE = "__none__";

export function FollowupDialog({
  contactIds,
  open,
  onOpenChange,
  onDone,
}: {
  contactIds: string[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDone?: () => void;
}) {
  const [templates, setTemplates] = useState<{ _id: string; name: string; type: string }[]>([]);
  const [resumes, setResumes] = useState<{ _id: string; filename: string }[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [resumeId, setResumeId] = useState(NONE);
  const [startAt, setStartAt] = useState(toLocalInput(new Date(Date.now() + 60000)));
  const [timing, setTiming] = useState<TimingValue>({ ...defaultTiming, windowStart: "", windowEnd: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStartAt(toLocalInput(new Date(Date.now() + 60000)));
    Promise.all([api<{ templates: typeof templates }>("/api/templates"), api<{ resumes: typeof resumes }>("/api/resumes")]).then(([t, r]) => {
      const f = t.templates.filter((x) => x.type === "followup");
      setTemplates(f);
      setResumes(r.resumes);
      if (f[0]) setTemplateId((v) => v || f[0]._id);
    });
  }, [open]);

  async function submit() {
    setBusy(true);
    try {
      const r = await api<{ queued: number; skipped: number }>("/api/followups", {
        method: "POST",
        json: {
          contactIds,
          templateId,
          resumeId: resumeId === NONE ? null : resumeId,
          startAt: new Date(startAt).toISOString(),
          ...timingPayload(timing),
        },
      });
      toast.success(`Queued ${r.queued} follow-ups${r.skipped ? `, skipped ${r.skipped}` : ""}`);
      onOpenChange(false);
      onDone?.();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Follow up with {contactIds.length} {contactIds.length === 1 ? "person" : "people"}</DialogTitle>
          <DialogDescription>Sent as a reply in the original thread. Anyone who has replied or bounced is skipped.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Follow-up template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Choose" /></SelectTrigger>
                <SelectContent>
                  {templates.map((t) => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {!templates.length && (
                <p className="text-xs text-destructive">No follow-up templates. <Link className="underline" href="/templates">Create one</Link>.</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Attach CV</Label>
              <Select value={resumeId} onValueChange={setResumeId}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No attachment</SelectItem>
                  {resumes.map((r) => <SelectItem key={r._id} value={r._id}>{r.filename}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor="fu-start">Start at</Label>
            <Input id="fu-start" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
          </div>
          {contactIds.length > 1 && <TimingFields value={timing} onChange={setTiming} />}
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={busy || !templateId}>
            {busy && <Loader2Icon className="animate-spin" />}
            Queue follow-ups
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
