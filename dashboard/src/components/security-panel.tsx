"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2Icon, LogOutIcon, MonitorIcon, SmartphoneIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, fmtDate, fmtRelative } from "@/lib/api";

type Sess = { _id: string; userAgent?: string; ip?: string; createdAt: string; lastUsedAt: string; current: boolean };

/** "Chrome on Windows" from a user-agent string; good enough to recognise your own devices. */
function describe(ua = "") {
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : ua ? "Browser" : "Unknown browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  const mobile = /Android|iPhone|iPad|Mobile/.test(ua);
  return { label: os ? `${browser} on ${os}` : browser, mobile };
}

export function SecurityPanel() {
  const [sessions, setSessions] = useState<Sess[] | null>(null);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => api<{ sessions: Sess[] }>("/api/auth/sessions").then((d) => setSessions(d.sessions)).catch((e) => toast.error(e.message)), []);
  useEffect(() => {
    load();
  }, [load]);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next !== pw.confirm) return toast.error("The new passwords do not match");
    setBusy("pw");
    try {
      const r = await api<{ endedOtherSessions: number }>("/api/auth/password", { method: "POST", json: { current: pw.current, next: pw.next } });
      toast.success(r.endedOtherSessions ? `Password changed. Signed out ${r.endedOtherSessions} other device${r.endedOtherSessions === 1 ? "" : "s"}.` : "Password changed");
      setPw({ current: "", next: "", confirm: "" });
      load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function end(body: { id: string } | { others: true }, key: string) {
    setBusy(key);
    try {
      const r = await api<{ ended: number; current?: boolean }>("/api/auth/sessions", { method: "DELETE", json: body });
      if (r.current) {
        window.location.href = "/login";
        return;
      }
      toast.success(r.ended ? `Signed out ${r.ended} device${r.ended === 1 ? "" : "s"}` : "No other devices were signed in");
      load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const others = sessions?.filter((s) => !s.current).length ?? 0;

  return (
    <div className="grid max-w-3xl gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Signed-in devices</CardTitle>
          <CardDescription>
            Each browser stays signed in for up to 30 days after its last visit (90 days at most). Signing a device out takes effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sessions ? (
            <div className="grid gap-3">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : (
            <ul className="grid divide-y rounded-lg border">
              {sessions.map((s) => {
                const d = describe(s.userAgent);
                const Icon = d.mobile ? SmartphoneIcon : MonitorIcon;
                return (
                  <li key={s._id} className="flex items-center gap-3 p-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {d.label}
                        {s.current && <Badge className="bg-emerald-500/15 font-normal text-emerald-700 dark:text-emerald-400">This device</Badge>}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.current ? "Active now" : `Last active ${fmtRelative(s.lastUsedAt)}`}
                        {s.ip ? `, IP ${s.ip}` : ""}, signed in {fmtDate(s.createdAt)}
                      </p>
                    </div>
                    {!s.current && (
                      <Button variant="ghost" size="sm" disabled={busy === s._id} onClick={() => end({ id: s._id }, s._id)}>
                        {busy === s._id ? <Loader2Icon className="animate-spin" /> : <LogOutIcon />}
                        Sign out
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
        <CardFooter className="border-t">
          <Button variant="outline" disabled={!others || busy === "others"} onClick={() => end({ others: true }, "others")}>
            {busy === "others" ? <Loader2Icon className="animate-spin" /> : <LogOutIcon />}
            Sign out all other devices
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <form onSubmit={changePassword}>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Every other device is signed out. This one stays signed in.</CardDescription>
          </CardHeader>
          <CardContent className="grid items-start gap-4 py-6 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="pw-current">Current password</Label>
              <Input id="pw-current" type="password" autoComplete="current-password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pw-next">New password</Label>
              <Input id="pw-next" type="password" autoComplete="new-password" minLength={8} required value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              <p className="text-xs text-muted-foreground">At least 8 characters.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pw-confirm">Repeat new password</Label>
              <Input id="pw-confirm" type="password" autoComplete="new-password" minLength={8} required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              {pw.confirm && pw.next !== pw.confirm && <p className="text-xs text-destructive">Passwords do not match.</p>}
            </div>
          </CardContent>
          <CardFooter className="border-t">
            <Button type="submit" disabled={busy === "pw"}>
              {busy === "pw" && <Loader2Icon className="animate-spin" />}
              Change password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
