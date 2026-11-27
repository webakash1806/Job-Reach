"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SecureNote } from "@/components/bits";
import { SecurityPanel } from "@/components/security-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, fmtRelative } from "@/lib/api";

type Settings = {
  email: string;
  name: string;
  apiKey: string | null;
  smtp: { host: string; port: number; secure: boolean; user: string; fromName: string; fromEmail: string; hasPassword: boolean };
  imap: { enabled: boolean; host: string; port: number; secure: boolean; user: string; hasPassword: boolean; lastCheck: string | null; lastError: string | null };
};

function Field({ id, label, hint, ...props }: React.ComponentProps<typeof Input> & { id: string; label: string; hint?: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [smtpPass, setSmtpPass] = useState("");
  const [imapPass, setImapPass] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [testTo, setTestTo] = useState("");
  const [tab, setTab] = useState("smtp");

  // deep link: /settings?tab=security
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && ["smtp", "imap", "ext", "security"].includes(t)) setTab(t);
  }, []);

  const load = () => api<Settings>("/api/settings").then(setS).catch((e) => toast.error(e.message));
  useEffect(() => {
    load();
  }, []);

  if (!s) return <p className="text-sm text-muted-foreground">Loading settings...</p>;

  const setSmtp = (p: Partial<Settings["smtp"]>) => setS({ ...s, smtp: { ...s.smtp, ...p } });
  const setImap = (p: Partial<Settings["imap"]>) => setS({ ...s, imap: { ...s.imap, ...p } });

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const saveSmtp = () =>
    run("smtp", async () => {
      await api("/api/settings", { method: "PUT", json: { name: s.name, smtp: { ...s.smtp, password: smtpPass || undefined } } });
      setSmtpPass("");
      toast.success("SMTP saved");
      load();
    });

  const saveImap = () =>
    run("imap", async () => {
      await api("/api/settings", { method: "PUT", json: { imap: { ...s.imap, password: imapPass || undefined } } });
      setImapPass("");
      toast.success("IMAP saved");
      load();
    });

  const test = (kind: "smtp" | "imap") =>
    run("test-" + kind, async () => {
      const r = await api<{ message: string }>("/api/settings/test", { method: "POST", json: { kind, to: testTo || undefined } });
      toast.success(r.message);
    });

  const gmail = () => {
    setSmtp({ host: "smtp.gmail.com", port: 465, secure: true });
    setImap({ host: "imap.gmail.com", port: 993, secure: true });
  };

  return (
    <>
      <PageHeader title="Settings" description={`Signed in as ${s.email}`} />
      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList>
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
          <TabsTrigger value="imap">Reply detection</TabsTrigger>
          <TabsTrigger value="ext">Extension</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="security">
          <SecurityPanel />
        </TabsContent>

        <TabsContent value="smtp">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Outgoing mail (SMTP)</CardTitle>
              <CardDescription>
                For Gmail, turn on 2-step verification and create an App Password at myaccount.google.com/apppasswords. Your normal Gmail password will not work.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Button type="button" variant="outline" size="sm" onClick={gmail}>Use Gmail defaults</Button>
              </div>
              <Field id="host" label="SMTP host" value={s.smtp.host} onChange={(e) => setSmtp({ host: e.target.value })} placeholder="smtp.gmail.com" />
              <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                <Field id="port" label="Port" type="number" value={s.smtp.port} onChange={(e) => setSmtp({ port: Number(e.target.value) })} />
                <div className="flex h-9 items-center gap-2">
                  <Switch id="secure" checked={s.smtp.secure} onCheckedChange={(v) => setSmtp({ secure: v })} />
                  <Label htmlFor="secure">SSL</Label>
                </div>
              </div>
              <Field id="user" label="Username" autoComplete="off" value={s.smtp.user} onChange={(e) => setSmtp({ user: e.target.value })} placeholder="you@gmail.com" />
              <Field
                id="pass"
                label="Password / App Password"
                type="password"
                autoComplete="new-password"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                hint={s.smtp.hasPassword ? "Saved and encrypted. Leave empty to keep it." : "Stored encrypted."}
              />
              <Field id="fromName" label="Sender name" value={s.smtp.fromName} onChange={(e) => setSmtp({ fromName: e.target.value })} placeholder="Your full name" />
              <Field id="fromEmail" label="Sender email (optional)" value={s.smtp.fromEmail} onChange={(e) => setSmtp({ fromEmail: e.target.value })} hint="Defaults to the username" />
              <SecureNote className="md:col-span-2" title="Your app password is encrypted">
                It is locked with AES-256-GCM before it is saved, unlocked only for the moment an email is sent, and never shown again, to you or to an admin.
              </SecureNote>
            </CardContent>
            <CardFooter className="flex flex-wrap items-end gap-3 border-t">
              <Button onClick={saveSmtp} disabled={busy === "smtp"}>
                {busy === "smtp" && <Loader2Icon className="animate-spin" />}
                Save
              </Button>
              <div className="ml-auto flex items-end gap-2">
                <Input aria-label="Send test to" placeholder="Send test to (optional)" value={testTo} onChange={(e) => setTestTo(e.target.value)} className="w-56" />
                <Button variant="outline" onClick={() => test("smtp")} disabled={busy === "test-smtp" || !s.smtp.hasPassword}>
                  {busy === "test-smtp" && <Loader2Icon className="animate-spin" />}
                  Send test email
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="imap">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Reply detection (IMAP)</CardTitle>
              <CardDescription>
                The worker checks your inbox every 10 minutes. Anyone who replies is marked Replied and gets no more follow-ups. Bounces are marked too.
                {s.imap.lastCheck && ` Last check ${fmtRelative(s.imap.lastCheck)}.`}
              </CardDescription>
              {s.imap.lastError && <p className="text-sm text-destructive">Last error: {s.imap.lastError}</p>}
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 md:col-span-2">
                <Switch id="imapOn" checked={s.imap.enabled} onCheckedChange={(v) => setImap({ enabled: v })} />
                <Label htmlFor="imapOn">Check my inbox for replies</Label>
              </div>
              <Field id="ihost" label="IMAP host" value={s.imap.host} onChange={(e) => setImap({ host: e.target.value })} placeholder="imap.gmail.com" />
              <Field id="iport" label="Port" type="number" value={s.imap.port} onChange={(e) => setImap({ port: Number(e.target.value) })} />
              <Field id="iuser" label="Username" autoComplete="off" value={s.imap.user} onChange={(e) => setImap({ user: e.target.value })} hint="Leave empty to use the SMTP username" />
              <Field
                id="ipass"
                label="Password / App Password"
                type="password"
                autoComplete="new-password"
                value={imapPass}
                onChange={(e) => setImapPass(e.target.value)}
                hint={s.imap.hasPassword ? "Saved and encrypted. Leave empty to keep it." : "Leave empty to use the SMTP password"}
              />
              <SecureNote className="md:col-span-2" title="Encrypted the same way">
                Your IMAP password is locked with AES-256-GCM and used only to check your inbox for replies.
              </SecureNote>
            </CardContent>
            <CardFooter className="flex gap-3 border-t">
              <Button onClick={saveImap} disabled={busy === "imap"}>
                {busy === "imap" && <Loader2Icon className="animate-spin" />}
                Save
              </Button>
              <Button variant="outline" onClick={() => test("imap")} disabled={busy === "test-imap"}>
                {busy === "test-imap" && <Loader2Icon className="animate-spin" />}
                Test connection
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ext">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Chrome extension</CardTitle>
              <CardDescription>
                The easiest way is the <Link href="/extension" className="font-medium text-foreground underline underline-offset-4">install guide</Link>: its download already contains these values. Use them here only for manual setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="url">Dashboard URL</Label>
                <div className="flex gap-2">
                  <Input id="url" readOnly value={typeof window !== "undefined" ? window.location.origin : ""} className="font-mono" />
                  <Button variant="outline" size="icon" aria-label="Copy URL" onClick={() => navigator.clipboard.writeText(window.location.origin).then(() => toast.success("Copied"))}>
                    <CopyIcon />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="key">API key</Label>
                <div className="flex gap-2">
                  <Input id="key" readOnly value={s.apiKey ?? ""} className="font-mono" />
                  <Button variant="outline" size="icon" aria-label="Copy API key" onClick={() => navigator.clipboard.writeText(s.apiKey ?? "").then(() => toast.success("Copied"))}>
                    <CopyIcon />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Keep it private. Anyone with this key can add contacts to your account.</p>
              </div>
            </CardContent>
            <CardFooter className="border-t">
              <Button
                variant="outline"
                onClick={() =>
                  run("key", async () => {
                    await api("/api/settings", { method: "PUT", json: { regenerateApiKey: true } });
                    toast.success("New key created. Update it in the extension.");
                    load();
                  })
                }
              >
                <RefreshCwIcon />
                Regenerate key
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
