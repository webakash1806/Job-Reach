"use client";

import { useState } from "react";
import { BriefcaseBusinessIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/login", { method: "POST", json: { email, password } });
      // go back to the page that asked for sign-in (same-site paths only)
      const next = new URLSearchParams(window.location.search).get("next") || "";
      const safe = next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") && !next.startsWith("/api/auth/");
      window.location.href = safe ? next : "/dashboard";
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-muted/40 p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BriefcaseBusinessIcon className="size-4" />
          </div>
          Job Outreach
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>Accounts are created by the admin. There is no public sign-up.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2Icon className="animate-spin" />}
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
