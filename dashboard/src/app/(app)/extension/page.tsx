"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckIcon,
  CircleCheckIcon,
  CopyIcon,
  DownloadIcon,
  FolderOpenIcon,
  Loader2Icon,
  PinIcon,
  PuzzleIcon,
  SearchIcon,
  ToggleRightIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, fmtRelative } from "@/lib/api";
import { cn } from "@/lib/utils";

type Status = { dashboardUrl: string; apiKey: string; version: string | null; lastSeenAt: string | null; lastVersion: string | null };

function CopyField({ id, label, value, mono = true }: { id: string; label: string; value: string; mono?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input id={id} readOnly value={value} className={cn(mono && "font-mono text-xs")} onFocus={(e) => e.target.select()} />
        <Button
          variant="outline"
          size="icon"
          aria-label={`Copy ${label}`}
          onClick={() =>
            navigator.clipboard.writeText(value).then(() => {
              setDone(true);
              setTimeout(() => setDone(false), 1500);
            })
          }
        >
          {done ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </div>
    </div>
  );
}

function Step({ n, icon: Icon, title, done, children }: { n: number; icon: React.ElementType; title: string; done?: boolean; children: React.ReactNode }) {
  return (
    <li className="group relative grid grid-cols-[2.25rem_1fr] gap-4 pb-8 last:pb-0">
      <span aria-hidden className="absolute top-10 bottom-0 left-[1.0625rem] w-px bg-border group-last:hidden" />
      <div
        className={cn(
          "relative z-[1] flex size-9 items-center justify-center rounded-full border bg-background text-sm font-medium",
          done && "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        )}
      >
        {done ? <CheckIcon className="size-4" /> : n}
      </div>
      <div className="grid gap-2 pt-1.5">
        <h3 className="flex items-center gap-2 font-medium">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </h3>
        <div className="grid gap-3 text-sm text-muted-foreground">{children}</div>
      </div>
    </li>
  );
}

export default function ExtensionSetupPage() {
  const [s, setS] = useState<Status | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  const load = useCallback(() => api<Status>("/api/extension").then(setS).catch((e) => toast.error(e.message)), []);
  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // live "connected" check while the user follows the steps
    return () => clearInterval(t);
  }, [load]);

  const connected = !!s?.lastSeenAt;
  const fresh = !!s?.lastSeenAt && Date.now() - new Date(s.lastSeenAt).getTime() < 10 * 60000;
  const outdated = !!s?.version && !!s?.lastVersion && s.version !== s.lastVersion;

  function download() {
    window.location.href = "/api/extension?download=1";
    setDownloaded(true);
    toast.success("Download started. Next, unzip it.");
  }

  return (
    <>
      <PageHeader
        title="Chrome extension"
        description="Collects emails from LinkedIn posts straight into your contacts. Install it in about two minutes, no Chrome Web Store needed."
      >
        {s && (
          connected ? (
            <Badge className={cn("gap-1 font-normal", fresh ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-secondary text-secondary-foreground")}>
              <CircleCheckIcon />
              Connected {fmtRelative(s.lastSeenAt)}
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1 font-normal">
              <Loader2Icon className="animate-spin" />
              Waiting for the extension
            </Badge>
          )
        )}
      </PageHeader>

      {outdated && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p>
            Version {s!.version} is available (you have {s!.lastVersion}). Download again, replace the files in your extension folder, then click the
            reload icon on the extension in <span className="font-mono">chrome://extensions</span>.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Install</CardTitle>
            <CardDescription>Works in Chrome, Edge and Brave on Windows, Mac and Linux.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid">
              <Step n={1} icon={DownloadIcon} title="Download the extension" done={downloaded || connected}>
                <p>Your dashboard address and API key are already inside, so it connects by itself.</p>
                <div>
                  <Button onClick={download} disabled={!s}>
                    <DownloadIcon />
                    Download extension{s?.version ? ` v${s.version}` : ""}
                  </Button>
                </div>
              </Step>

              <Step n={2} icon={FolderOpenIcon} title="Unzip it to a folder you will keep" done={connected}>
                <p>
                  Right-click <span className="font-mono text-foreground">job-outreach-extension.zip</span> and choose <span className="text-foreground">Extract All</span>.
                  Put it somewhere permanent, like <span className="font-mono text-foreground">Documents\job-outreach-extension</span>. Chrome runs the extension from
                  this folder, so do not delete or move it.
                </p>
              </Step>

              <Step n={3} icon={ToggleRightIcon} title="Open the extensions page and turn on Developer mode" done={connected}>
                <p>Websites cannot open this page for you. Copy the address, paste it into a new tab and press Enter.</p>
                <div className="max-w-sm">
                  <CopyField id="chrome-url" label="Address" value="chrome://extensions" />
                </div>
                <p>
                  Then switch on <span className="text-foreground">Developer mode</span> in the top right corner. In Edge use{" "}
                  <span className="font-mono text-foreground">edge://extensions</span>.
                </p>
              </Step>

              <Step n={4} icon={PuzzleIcon} title="Click Load unpacked and pick the folder" done={connected}>
                <p>
                  Choose the folder you extracted, the one that has <span className="font-mono text-foreground">manifest.json</span> directly inside it.
                  LinkedIn Email Collector appears in the list.
                </p>
              </Step>

              <Step n={5} icon={PinIcon} title="Pin it and open it once" done={connected}>
                <p>Click the puzzle icon next to the address bar, pin LinkedIn Email Collector, then click it. The popup should say Connected as your email.</p>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-3",
                    connected ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300" : "bg-muted/40"
                  )}
                  aria-live="polite"
                >
                  {connected ? <CircleCheckIcon className="size-4" /> : <Loader2Icon className="size-4 animate-spin" />}
                  {connected
                    ? `Extension connected${s?.lastVersion ? ` (v${s.lastVersion})` : ""}, last seen ${fmtRelative(s!.lastSeenAt)}.`
                    : "Waiting for the extension to check in. This updates by itself."}
                </div>
              </Step>

              <Step n={6} icon={SearchIcon} title="Run your first search">
                <p>
                  Sign in to LinkedIn in the same browser. In the popup, enter keywords (one search per line), words to skip such as{" "}
                  <span className="font-mono text-foreground">python, java</span>, and the date range, then press Start. New emails show up on the Contacts page.
                </p>
              </Step>
            </ol>
          </CardContent>
        </Card>

        <div className="grid h-fit gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Connect manually</CardTitle>
              <CardDescription>Only needed if the popup says Not connected. Paste these in the popup Setup tab and press Save and test.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {s ? (
                <>
                  <CopyField id="dash-url" label="Dashboard URL" value={s.dashboardUrl} />
                  <CopyField id="api-key" label="API key" value={s.apiKey} />
                  <p className="text-xs text-muted-foreground">Keep the key private. You can create a new one in Settings, then download the extension again.</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Loading...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>If something goes wrong</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="grid gap-1">
                <p className="font-medium">&quot;Manifest file is missing or unreadable&quot;</p>
                <p className="text-muted-foreground">You picked the folder one level too high. Open it and choose the inner folder that holds manifest.json.</p>
              </div>
              <div className="grid gap-1">
                <p className="font-medium">&quot;Disable developer mode extensions&quot; popup</p>
                <p className="text-muted-foreground">Chrome shows this for extensions not from the store. Close it with the X. Do not click Disable.</p>
              </div>
              <div className="grid gap-1">
                <p className="font-medium">Popup says Invalid API key</p>
                <p className="text-muted-foreground">The key was regenerated. Download again and replace the files, or paste the new key above.</p>
              </div>
              <div className="grid gap-1">
                <p className="font-medium">No posts found</p>
                <p className="text-muted-foreground">Make sure you are signed in to LinkedIn. If LinkedIn changed its layout, ask the admin for an updated version.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
