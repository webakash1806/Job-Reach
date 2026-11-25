"use client";

import { useCallback, useEffect, useState } from "react";
import { MailPlusIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
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
const preview = (s: string) => s.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k: string) => (SAMPLE as Record<string, string>)[k] ?? m);

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
        <DialogContent className="sm:max-w-3xl">
          {draft && (
            <form onSubmit={save} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>{draft._id ? "Edit template" : "New template"}</DialogTitle>
                <DialogDescription>The preview uses a sample contact.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid content-start gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="t-name">Name</Label>
                    <Input id="t-name" required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Tabs value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as Template["type"] })}>
                      <TabsList>
                        <TabsTrigger value="initial">First email</TabsTrigger>
                        <TabsTrigger value="followup">Follow-up</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="t-subject">Subject</Label>
                    <Input
                      id="t-subject"
                      required={draft.type === "initial"}
                      disabled={draft.type === "followup"}
                      value={draft.type === "followup" ? "" : draft.subject}
                      placeholder={draft.type === "followup" ? "Uses Re: original subject" : ""}
                      onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="t-body">Message</Label>
                    <Textarea id="t-body" required rows={12} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
                  </div>
                </div>
                <div className="grid content-start gap-2">
                  <Label>Preview</Label>
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                    <p className="mb-3 border-b pb-3 font-medium">
                      {draft.type === "followup" ? "Re: Application for the role you posted" : preview(draft.subject) || "(no subject)"}
                    </p>
                    <p className="whitespace-pre-line leading-relaxed">{preview(draft.body)}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={busy}>Save template</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
