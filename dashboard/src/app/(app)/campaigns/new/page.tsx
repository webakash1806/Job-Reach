"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/bits";
import { TimingFields, defaultTiming, timingPayload, type TimingValue } from "@/components/timing-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, CAMPAIGN_IDS_KEY, fmtDate, toLocalInput } from "@/lib/api";

type Template = { _id: string; name: string; type: "initial" | "followup"; subject: string };
type Resume = { _id: string; filename: string; isDefault: boolean };
type Preview = { selected: number; skipped: number; willSend: number; firstAt: string | null; lastAt: string | null };

const NONE = "__none__";

function NewCampaign() {
  const router = useRouter();
  const params = useSearchParams();
  const [ids, setIds] = useState<string[]>([]);
  const [audience, setAudience] = useState<"selected" | "allNew">("allNew");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [name, setName] = useState(`Outreach ${new Date().toLocaleDateString(undefined, { day: "numeric", month: "short" })}`);
  const [templateId, setTemplateId] = useState("");
  const [resumeId, setResumeId] = useState(NONE);
  const [startAt, setStartAt] = useState(toLocalInput(new Date(Date.now() + 2 * 60000)));
  const [timing, setTiming] = useState<TimingValue>(defaultTiming);
  const [fu, setFu] = useState({ enabled: false, afterDays: 4, templateId: "", maxCount: 1, attachResume: false });
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (params.get("from") === "selection") {
      try {
        const saved = JSON.parse(sessionStorage.getItem(CAMPAIGN_IDS_KEY) || "[]");
        if (Array.isArray(saved) && saved.length) {
          setIds(saved);
          setAudience("selected");
        }
      } catch {}
    }
    Promise.all([api<{ templates: Template[] }>("/api/templates"), api<{ resumes: Resume[] }>("/api/resumes")])
      .then(([t, r]) => {
        setTemplates(t.templates);
        setResumes(r.resumes);
        const init = t.templates.find((x) => x.type === "initial");
        if (init) setTemplateId(init._id);
        const f = t.templates.find((x) => x.type === "followup");
        if (f) setFu((v) => ({ ...v, templateId: f._id }));
        const def = r.resumes.find((x) => x.isDefault) ?? r.resumes[0];
        if (def) setResumeId(def._id);
      })
      .catch((e) => toast.error(e.message));
  }, [params]);

  const audiencePayload = useMemo(
    () => (audience === "selected" ? { contactIds: ids } : { allNew: true }),
    [audience, ids]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      api<Preview>("/api/campaigns/preview", {
        method: "POST",
        json: { ...audiencePayload, ...timingPayload(timing), startAt: new Date(startAt).toISOString() },
      })
        .then(setPreview)
        .catch(() => setPreview(null));
    }, 400);
    return () => clearTimeout(t);
  }, [audiencePayload, timing, startAt]);

  const initialTemplates = templates.filter((t) => t.type === "initial");
  const followTemplates = templates.filter((t) => t.type === "followup");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!templateId) return toast.error("Create a message template first");
    setBusy(true);
    try {
      const r = await api<{ campaign: { _id: string }; queued: number; skipped: number; firstAt: string; lastAt: string }>("/api/campaigns", {
        method: "POST",
        json: {
          name,
          templateId,
          resumeId: resumeId === NONE ? null : resumeId,
          startAt: new Date(startAt).toISOString(),
          ...audiencePayload,
          ...timingPayload(timing),
          followUp: { ...fu, templateId: fu.enabled ? fu.templateId : null },
        },
      });
      sessionStorage.removeItem(CAMPAIGN_IDS_KEY);
      toast.success(`Scheduled ${r.queued} emails${r.skipped ? `, skipped ${r.skipped} already emailed` : ""}`);
      router.push(`/campaigns/${r.campaign._id}`);
    } catch (err) {
      toast.error((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <PageHeader title="New campaign" description="Pick who to email, the message and CV, and how fast to send." />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipients and message</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Campaign name</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Send to</Label>
                <Tabs value={audience} onValueChange={(v) => setAudience(v as typeof audience)}>
                  <TabsList>
                    <TabsTrigger value="allNew">All new contacts</TabsTrigger>
                    <TabsTrigger value="selected" disabled={!ids.length}>
                      Selected ({ids.length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                {!ids.length && (
                  <p className="text-xs text-muted-foreground">
                    To email specific people, select rows on the <Link className="underline" href="/contacts">Contacts</Link> page and press Email.
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Message template</Label>
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {initialTemplates.map((t) => (
                        <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!initialTemplates.length && (
                    <p className="text-xs text-destructive">
                      No templates yet. <Link className="underline" href="/templates">Create one</Link>.
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Attach CV</Label>
                  <Select value={resumeId} onValueChange={setResumeId}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No attachment</SelectItem>
                      {resumes.map((r) => (
                        <SelectItem key={r._id} value={r._id}>{r.filename}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Emails go out one by one with a gap between them.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2 sm:max-w-xs">
                <Label htmlFor="startAt">Start at</Label>
                <Input id="startAt" type="datetime-local" required value={startAt} onChange={(e) => setStartAt(e.target.value)} />
              </div>
              <TimingFields value={timing} onChange={setTiming} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automatic follow-up</CardTitle>
              <CardDescription>Sent as a reply in the same email thread, only to people who have not replied.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-3">
                <Switch id="fu" checked={fu.enabled} onCheckedChange={(v) => setFu({ ...fu, enabled: v })} />
                <Label htmlFor="fu">Follow up automatically</Label>
              </div>
              {fu.enabled && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="fuDays">After (days)</Label>
                    <Input id="fuDays" type="number" min={1} value={fu.afterDays} onChange={(e) => setFu({ ...fu, afterDays: Number(e.target.value) })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fuMax">Max follow-ups</Label>
                    <Input id="fuMax" type="number" min={1} max={5} value={fu.maxCount} onChange={(e) => setFu({ ...fu, maxCount: Number(e.target.value) })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Template</Label>
                    <Select value={fu.templateId} onValueChange={(v) => setFu({ ...fu, templateId: v })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Follow-up template" />
                      </SelectTrigger>
                      <SelectContent>
                        {followTemplates.map((t) => (
                          <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 sm:col-span-3">
                    <Switch id="fuAttach" checked={fu.attachResume} onCheckedChange={(v) => setFu({ ...fu, attachResume: v })} />
                    <Label htmlFor="fuAttach">Attach the CV again on follow-ups</Label>
                  </div>
                  {!followTemplates.length && (
                    <p className="text-xs text-destructive sm:col-span-3">
                      Create a template of type Follow-up on the <Link className="underline" href="/templates">Templates</Link> page.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            {preview ? (
              <dl className="grid grid-cols-[1fr_auto] gap-y-2">
                <dt className="text-muted-foreground">Selected</dt>
                <dd className="font-mono tabular-nums">{preview.selected}</dd>
                <dt className="text-muted-foreground">Already emailed, skipped</dt>
                <dd className="font-mono tabular-nums">{preview.skipped}</dd>
                <dt className="font-medium">Will be sent</dt>
                <dd className="font-mono font-medium tabular-nums">{preview.willSend}</dd>
                {preview.firstAt && (
                  <>
                    <dt className="text-muted-foreground">First email</dt>
                    <dd className="text-right">{fmtDate(preview.firstAt)}</dd>
                    <dt className="text-muted-foreground">Last email (approx.)</dt>
                    <dd className="text-right">{fmtDate(preview.lastAt)}</dd>
                  </>
                )}
              </dl>
            ) : (
              <p className="text-muted-foreground">Calculating...</p>
            )}
            <Button type="submit" disabled={busy || !preview?.willSend} className="w-full">
              {busy ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
              Schedule {preview?.willSend ?? ""} emails
            </Button>
            <p className="text-xs text-muted-foreground">The background worker must be running for emails to go out.</p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

export default function Page() {
  return (
    <Suspense>
      <NewCampaign />
    </Suspense>
  );
}
