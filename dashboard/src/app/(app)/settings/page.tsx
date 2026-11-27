"use client";
/* eslint-disable @next/next/no-img-element -- a 16px SVG brand icon; next/image adds nothing here */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  CopyIcon,
  InboxIcon,
  Loader2Icon,
  PuzzleIcon,
  RefreshCwIcon,
  SendIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SecureNote } from "@/components/bits";
import { SecurityPanel } from "@/components/security-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api, fmtRelative } from "@/lib/api";
import { cn } from "@/lib/utils";

type Settings = {
  email: string;
  name: string;
  apiKey: string | null;
  smtp: { host: string; port: number; secure: boolean; user: string; fromName: string; fromEmail: string; hasPassword: boolean };
  imap: { enabled: boolean; host: string; port: number; secure: boolean; user: string; hasPassword: boolean; lastCheck: string | null; lastError: string | null };
};

type Tab = "smtp" | "imap" | "ext" | "security";
const SECTIONS: { id: Tab; label: string; desc: string; icon: React.ElementType }[] = [
  { id: "smtp", label: "Sending email", desc: "Your Gmail or SMTP account", icon: SendIcon },
  { id: "imap", label: "Reply detection", desc: "Stops follow-ups on a reply", icon: InboxIcon },
  { id: "ext", label: "Chrome extension", desc: "Dashboard URL and API key", icon: PuzzleIcon },
  { id: "security", label: "Security", desc: "Password and devices", icon: ShieldCheckIcon },
];

type Tone = "ok" | "todo" | "bad" | "off";
const TONE: Record<Tone, { icon: React.ElementType; className: string }> = {
  ok: { icon: CheckCircle2Icon, className: "text-emerald-600 dark:text-emerald-400" },
  todo: { icon: CircleDashedIcon, className: "text-amber-600 dark:text-amber-400" },
  bad: { icon: AlertTriangleIcon, className: "text-destructive" },
  off: { icon: CircleDashedIcon, className: "text-muted-foreground" },
};

function Field({ id, label, hint, className, ...props }: React.ComponentProps<typeof Input> & { id: string; label: string; hint?: string }) {
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** a titled block of fields inside a card */
function Group({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className="grid gap-3">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>
      <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>
    </section>
  );
}

/** one line of the status strip: what is set up, and a click opens its section */
function StatusTile({ icon: Icon, label, state, tone, onClick, active }: { icon: React.ElementType; label: string; state: string; tone: Tone; onClick: () => void; active: boolean }) {
  const T = TONE[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-foreground/20 hover:bg-accent/40",
        active && "border-primary/50 ring-3 ring-primary/15",
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className={cn("flex items-center gap-1.5 text-xs", T.className)}>
          <T.icon className="size-3.5 shrink-0" />
          <span className="truncate">{state}</span>
        </span>
      </span>
    </button>
  );
}

function CopyField({ id, label, value, hint }: { id: string; label: string; value: string; hint?: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input id={id} readOnly value={value} className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
        <Button variant="outline" size="icon" aria-label={`Copy ${label}`} onClick={() => navigator.clipboard.writeText(value).then(() => toast.success("Copied"))}>
          <CopyIcon />
        </Button>
      </div>
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
  const [tab, setTab] = useState<Tab>("smtp");

  // deep link: /settings?tab=security
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && SECTIONS.some((x) => x.id === t)) setTab(t as Tab);
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
    toast.success("Gmail server settings filled in");
  };

  // what the status strip says
  const smtpReady = !!(s.smtp.host && s.smtp.user && s.smtp.hasPassword);
  const smtpState: [string, Tone] = smtpReady ? [`Connected as ${s.smtp.user}`, "ok"] : ["Not set up yet", "todo"];
  const imapState: [string, Tone] = !s.imap.enabled
    ? ["Off", "off"]
    : s.imap.lastError
      ? ["Last check failed", "bad"]
      : s.imap.lastCheck
        ? [`On, checked ${fmtRelative(s.imap.lastCheck)}`, "ok"]
        : ["On, first check soon", "ok"];
  const extState: [string, Tone] = s.apiKey ? ["API key ready", "ok"] : ["No API key yet", "todo"];

  const saving = (key: string) => busy === key && <Loader2Icon className="animate-spin" />;

  return (
    <>
      <PageHeader title="Settings" description={`Signed in as ${s.email}`} />

      {/* status at a glance */}
      <div className="grid gap-3 @2xl:grid-cols-3">
        <StatusTile icon={SendIcon} label="Sending email" state={smtpState[0]} tone={smtpState[1]} onClick={() => setTab("smtp")} active={tab === "smtp"} />
        <StatusTile icon={InboxIcon} label="Reply detection" state={imapState[0]} tone={imapState[1]} onClick={() => setTab("imap")} active={tab === "imap"} />
        <StatusTile icon={PuzzleIcon} label="Chrome extension" state={extState[0]} tone={extState[1]} onClick={() => setTab("ext")} active={tab === "ext"} />
      </div>

      <div className="grid items-start gap-6 @4xl:grid-cols-[230px_minmax(0,1fr)]">
        {/* section nav: a column on wide screens, a scrolling row on narrow ones */}
        <nav aria-label="Settings sections" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 @4xl:sticky @4xl:top-20 @4xl:flex-col @4xl:overflow-visible">
          {SECTIONS.map(({ id, label, desc, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent/60",
                tab === id ? "bg-accent text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-4 shrink-0", tab === id && "text-primary")} />
              <span className="min-w-0">
                <span className="block font-medium whitespace-nowrap">{label}</span>
                <span className="hidden text-xs text-muted-foreground @4xl:block">{desc}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="min-w-0 max-w-3xl">
          {tab === "smtp" && (
            <Card>
              <CardHeader>
                <CardTitle>Sending email</CardTitle>
                <CardDescription>The account your campaigns send from. Recruiters see this address and reply to it.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3">
                  <span className="grid size-9 place-items-center rounded-lg border bg-background">
                    <img src="/assets/icons/gmail.svg" alt="" width="18" height="18" />
                  </span>
                  <p className="min-w-[13rem] flex-1 text-sm">
                    <span className="font-medium">Using Gmail?</span>{" "}
                    <span className="text-muted-foreground">
                      Fill in Gmail&rsquo;s servers, then add an{" "}
                      <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="font-medium text-foreground underline underline-offset-4">
                        App Password
                      </a>{" "}
                      (needs 2-step verification). Your normal password will not work.
                    </span>
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={gmail}>Use Gmail settings</Button>
                </div>

                <Group title="Server" className="sm:grid-cols-[minmax(0,1fr)_110px_auto]">
                  <Field id="host" label="SMTP host" value={s.smtp.host} onChange={(e) => setSmtp({ host: e.target.value })} placeholder="smtp.gmail.com" />
                  <Field id="port" label="Port" type="number" value={s.smtp.port} onChange={(e) => setSmtp({ port: Number(e.target.value) })} />
                  <div className="grid content-start gap-2">
                    <Label htmlFor="secure">SSL</Label>
                    <div className="flex h-9 items-center">
                      <Switch id="secure" checked={s.smtp.secure} onCheckedChange={(v) => setSmtp({ secure: v })} />
                    </div>
                  </div>
                </Group>

                <Group title="Account">
                  <Field id="user" label="Username" autoComplete="off" value={s.smtp.user} onChange={(e) => setSmtp({ user: e.target.value })} placeholder="you@gmail.com" />
                  <Field
                    id="pass"
                    label="App Password"
                    type="password"
                    autoComplete="new-password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder={s.smtp.hasPassword ? "•••••••• saved" : ""}
                    hint={s.smtp.hasPassword ? "Saved and encrypted. Leave empty to keep it." : "Stored encrypted."}
                  />
                </Group>

                <Group title="Sender">
                  <Field id="fromName" label="Sender name" value={s.smtp.fromName} onChange={(e) => setSmtp({ fromName: e.target.value })} placeholder="Your full name" />
                  <Field id="fromEmail" label="Sender email (optional)" value={s.smtp.fromEmail} onChange={(e) => setSmtp({ fromEmail: e.target.value })} hint="Defaults to the username" />
                </Group>

                <SecureNote title="Your app password is encrypted">
                  It is locked with AES-256-GCM before it is saved, unlocked only for the moment an email is sent, and never shown again, to you or to an admin.
                </SecureNote>
              </CardContent>
              <CardFooter className="flex flex-wrap items-center gap-3 border-t">
                <Button onClick={saveSmtp} disabled={busy === "smtp"}>
                  {saving("smtp")}
                  Save changes
                </Button>
                <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
                  <Input aria-label="Send test to" placeholder="Send test to (optional)" value={testTo} onChange={(e) => setTestTo(e.target.value)} className="min-w-0 flex-1 sm:w-52" />
                  <Button variant="outline" onClick={() => test("smtp")} disabled={busy === "test-smtp" || !s.smtp.hasPassword}>
                    {saving("test-smtp")}
                    Send test email
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}

          {tab === "imap" && (
            <Card>
              <CardHeader>
                <CardTitle>Reply detection</CardTitle>
                <CardDescription>
                  Every 10 minutes your inbox is checked. Anyone who replies is marked Replied and gets no more follow-ups; bounces are marked too.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <label htmlFor="imapOn" className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-muted/40 p-3">
                  <span>
                    <span className="block text-sm font-medium">Check my inbox for replies</span>
                    <span className="block text-xs text-muted-foreground">
                      {s.imap.lastCheck ? `Last check ${fmtRelative(s.imap.lastCheck)}` : "No check yet"}
                    </span>
                  </span>
                  <Switch id="imapOn" checked={s.imap.enabled} onCheckedChange={(v) => setImap({ enabled: v })} />
                </label>
                {s.imap.lastError && (
                  <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                    Last check failed: {s.imap.lastError}
                  </p>
                )}

                <Group title="Server" className="sm:grid-cols-[minmax(0,1fr)_110px]">
                  <Field id="ihost" label="IMAP host" value={s.imap.host} onChange={(e) => setImap({ host: e.target.value })} placeholder="imap.gmail.com" />
                  <Field id="iport" label="Port" type="number" value={s.imap.port} onChange={(e) => setImap({ port: Number(e.target.value) })} />
                </Group>

                <Group title="Account">
                  <Field id="iuser" label="Username" autoComplete="off" value={s.imap.user} onChange={(e) => setImap({ user: e.target.value })} hint="Leave empty to use the SMTP username" />
                  <Field
                    id="ipass"
                    label="App Password"
                    type="password"
                    autoComplete="new-password"
                    value={imapPass}
                    onChange={(e) => setImapPass(e.target.value)}
                    placeholder={s.imap.hasPassword ? "•••••••• saved" : ""}
                    hint={s.imap.hasPassword ? "Saved and encrypted. Leave empty to keep it." : "Leave empty to use the SMTP password"}
                  />
                </Group>

                <SecureNote title="Encrypted the same way">
                  Your IMAP password is locked with AES-256-GCM and used only to check your inbox for replies.
                </SecureNote>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3 border-t">
                <Button onClick={saveImap} disabled={busy === "imap"}>
                  {saving("imap")}
                  Save changes
                </Button>
                <Button variant="outline" onClick={() => test("imap")} disabled={busy === "test-imap"}>
                  {saving("test-imap")}
                  Test connection
                </Button>
              </CardFooter>
            </Card>
          )}

          {tab === "ext" && (
            <Card>
              <CardHeader>
                <CardTitle>Chrome extension</CardTitle>
                <CardDescription>
                  The <Link href="/extension" className="font-medium text-foreground underline underline-offset-4">install guide</Link> download already contains these values. Use them here only for manual setup.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <CopyField id="url" label="Dashboard URL" value={typeof window !== "undefined" ? window.location.origin : ""} />
                <CopyField id="key" label="API key" value={s.apiKey ?? ""} hint="Keep it private. Anyone with this key can add contacts to your account." />
              </CardContent>
              <CardFooter className="flex flex-wrap items-center gap-3 border-t">
                <Button asChild>
                  <Link href="/extension">Open install guide</Link>
                </Button>
                <Button
                  variant="outline"
                  className="sm:ml-auto"
                  disabled={busy === "key"}
                  onClick={() =>
                    run("key", async () => {
                      await api("/api/settings", { method: "PUT", json: { regenerateApiKey: true } });
                      toast.success("New key created. Update it in the extension.");
                      load();
                    })
                  }
                >
                  {busy === "key" ? <Loader2Icon className="animate-spin" /> : <RefreshCwIcon />}
                  Regenerate key
                </Button>
              </CardFooter>
            </Card>
          )}

          {tab === "security" && <SecurityPanel />}
        </div>
      </div>
    </>
  );
}
