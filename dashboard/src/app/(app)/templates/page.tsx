"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2Icon, MailPlusIcon, PaperclipIcon, PencilIcon, PlusIcon, ReplyIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

type Template = { _id: string; name: string; type: "initial" | "followup"; subject: string; body: string };
type Draft = Omit<Template, "_id"> & { _id?: string };

const STARTERS: Record<Template["type"], Draft> = {
  initial: {
    name: "Application",
    type: "initial",
    subject: "Application for the role you posted",
    body:
      "Hi {{first_name}},\n\nI saw your LinkedIn post about the opening at {{company}} and would like to apply. I have attached my CV for your review.\n\nA quick summary: [your experience in one or two lines].\n\nI would be glad to talk whenever it suits you.\n\nThanks,\n[Your name]\n[Phone] | [LinkedIn URL]",
  },
  followup: {
    name: "Gentle follow-up",
    type: "followup",
    subject: "",
    body:
      "Hi {{first_name}},\n\nJust following up on my application below. I am still very interested in the role and happy to share anything else you need.\n\nThanks,\n[Your name]",
  },
};

const SAMPLE = { name: "Priya Raman", first_name: "Priya", email: "priya@hireloop.in", company: "Hireloop" };

export default function TemplatesPage() {
  const [rows, setRows] = useState<Template[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api<{ templates: Template[] }>("/api/templates").then((d) => setRows(d.templates)).catch((e) => toast.error(e.message)), []);
  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    try {
      const { _id, ...body } = draft;
      await api(_id ? `/api/templates/${_id}` : "/api/templates", { method: _id ? "PUT" : "POST", json: body });
      toast.success("Template saved");
      setDraft(null);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await api(`/api/templates/${id}`, { method: "DELETE" }).then(() => toast.success("Deleted")).catch((e) => toast.error(e.message));
    load();
  }

  return (
    <>
      <PageHeader title="Templates" description="Use {{first_name}}, {{name}}, {{company}} and {{email}}. Missing values fall back to friendly defaults.">
        <Button variant="outline" onClick={() => setDraft({ ...STARTERS.followup })}>
          <PlusIcon />
          Follow-up
        </Button>
        <Button onClick={() => setDraft({ ...STARTERS.initial })}>
          <PlusIcon />
          Message
        </Button>
      </PageHeader>

      {!rows ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={MailPlusIcon} title="No templates yet">
          Start with a first message, then add a follow-up for people who do not reply.
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((t) => (
            <Card key={t._id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {t.name}
                  <Badge variant="secondary">{t.type === "initial" ? "First email" : "Follow-up"}</Badge>
                </CardTitle>
                <CardDescription className="line-clamp-1">{t.type === "followup" ? "Re: original subject" : t.subject}</CardDescription>
                <CardAction className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setDraft(t)}><PencilIcon /></Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => remove(t._id)}><Trash2Icon /></Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-5 whitespace-pre-line text-sm text-muted-foreground">{t.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
          {draft && <TemplateEditor draft={draft} setDraft={setDraft} busy={busy} onSubmit={save} onCancel={() => setDraft(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

const VARS = ["first_name", "name", "company", "email"] as const;

/** Text with {{vars}} filled from the sample contact: known ones highlighted, unknown ones in red. */
function Filled({ text }: { text: string }) {
  return text.split(/(\{\{\s*\w+\s*\}\})/g).map((part, i) => {
    const key = part.match(/^\{\{\s*(\w+)\s*\}\}$/)?.[1];
    if (!key) return part;
    const value = (SAMPLE as Record<string, string>)[key];
    return (
      <mark key={i} className={value ? "rounded-sm bg-foreground/10 px-0.5 text-foreground" : "rounded-sm bg-destructive/15 px-0.5 text-destructive"}>
        {value ?? part}
      </mark>
    );
  });
}

function TemplateEditor({ draft, setDraft, busy, onSubmit, onCancel }: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  busy: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const followup = draft.type === "followup";
  const words = draft.body.trim() ? draft.body.trim().split(/\s+/).length : 0;

  // put {{var}} where the cursor is and keep typing from there
  function insert(v: string) {
    const el = bodyRef.current;
    const tag = `{{${v}}}`;
    const at = el?.selectionStart ?? draft.body.length;
    const end = el?.selectionEnd ?? at;
    setDraft({ ...draft, body: draft.body.slice(0, at) + tag + draft.body.slice(end) });
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(at + tag.length, at + tag.length);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="border-b px-5 py-4 pr-12">
        <DialogTitle className="text-base">{draft._id ? "Edit template" : "New template"}</DialogTitle>
        <DialogDescription>Write once. Each recruiter gets their own name and company filled in.</DialogDescription>
      </DialogHeader>

      <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-2 md:overflow-hidden">
        {/* editor */}
        <div className="grid content-start gap-5 p-5 md:min-h-0 md:overflow-y-auto">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="grid gap-2">
              <Label htmlFor="t-name">Template name</Label>
              <Input id="t-name" required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. React roles" />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Tabs value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as Template["type"] })}>
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="initial">First email</TabsTrigger>
                  <TabsTrigger value="followup">Follow-up</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="t-subject">Subject</Label>
            {followup ? (
              <p className="flex h-9 items-center gap-2 rounded-lg border border-dashed px-3 text-sm text-muted-foreground">
                <ReplyIcon className="size-4" />
                Sent as a reply: &ldquo;Re: original subject&rdquo;
              </p>
            ) : (
              <Input id="t-subject" required value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} placeholder="Application for the role you posted" />
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-end justify-between gap-2">
              <Label htmlFor="t-body">Message</Label>
              <span className="text-xs tabular-nums text-muted-foreground">{words} words</span>
            </div>
            <div className="overflow-hidden rounded-lg border focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <div className="flex flex-wrap items-center gap-1.5 border-b bg-muted/40 px-2 py-1.5">
                <span className="px-1 text-xs text-muted-foreground">Insert</span>
                {VARS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insert(v)}
                    className="rounded-md border bg-background px-2 py-0.5 font-mono text-xs transition-colors hover:border-foreground/30 hover:bg-accent"
                  >
                    {v}
                  </button>
                ))}
              </div>
              <Textarea
                ref={bodyRef}
                id="t-body"
                required
                rows={14}
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                className="min-h-72 resize-none rounded-none border-0 bg-transparent leading-relaxed shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
            </div>
            <p className="text-xs text-muted-foreground">Missing values fall back to friendly defaults, like &ldquo;there&rdquo; for a name.</p>
          </div>
        </div>

        {/* preview */}
        <div className="grid content-start gap-3 border-t md:min-h-0 bg-muted/30 p-5 md:overflow-y-auto md:border-t-0 md:border-l">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Preview</span>
            <span className="truncate text-xs text-muted-foreground">Sample: {SAMPLE.name}, {SAMPLE.company}</span>
          </div>
          <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
            <div className="grid gap-3 border-b p-4">
              <p className="font-medium leading-snug">
                {followup ? "Re: Application for the role you posted" : draft.subject ? <Filled text={draft.subject} /> : <span className="text-muted-foreground">(no subject)</span>}
              </p>
              <div className="flex items-center gap-3 text-sm">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-xs font-medium text-background">You</span>
                <div className="min-w-0">
                  <p className="truncate font-medium">You</p>
                  <p className="truncate text-xs text-muted-foreground">to {SAMPLE.email}</p>
                </div>
              </div>
            </div>
            <div className="whitespace-pre-line break-words p-4 text-sm leading-relaxed">
              {draft.body.trim() ? <Filled text={draft.body} /> : <span className="text-muted-foreground">Your message appears here.</span>}
            </div>
            {!followup && (
              <div className="flex items-center gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
                <PaperclipIcon className="size-3.5" />
                Your chosen resume is attached
              </div>
            )}
          </div>
        </div>
      </div>

      <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-none border-t bg-background px-5 py-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2Icon className="animate-spin" />}
          Save template
        </Button>
      </DialogFooter>
    </form>
  );
}
