"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- the landing page at / needs a full page load: its kit scripts and start-up script run only on a fresh document */

import { useState } from "react";
import { ArrowLeftIcon, ClockIcon, EyeIcon, EyeOffIcon, Loader2Icon, LockKeyholeIcon, MailCheckIcon } from "lucide-react";
import { GoogleTagManager } from "@/components/gtm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

function Mark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <rect x="3" y="16" width="18" height="4" rx="1" />
    </svg>
  );
}

const FACTS = [
  { icon: MailCheckIcon, title: "Sent from your own inbox", body: "Recruiters see your address. Replies land where you already read mail." },
  { icon: LockKeyholeIcon, title: "Your SMTP password stays encrypted", body: "Stored with AES-256-GCM. Sign-in tokens expire after 15 minutes." },
  { icon: ClockIcon, title: "Replies checked every 10 minutes", body: "A reply stops the follow-ups to that recruiter on its own." },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
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
    <main className="grid min-h-[100dvh] lg:grid-cols-2">
      <GoogleTagManager />
      {/* form side */}
      <section className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-medium tracking-tight">
            <Mark />
            Job Outreach
          </a>
          <a href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeftIcon className="size-4" />
            Home
          </a>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in with the account your admin created for you.</p>

          <form onSubmit={submit} className="mt-8 grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" required className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" required className="h-11 pr-11" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground">
                  {show ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={loading} className="h-11 w-full text-sm">
              {loading && <Loader2Icon className="animate-spin" />}
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            No account? There is no public sign-up. Ask your admin for one.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Free to use. <a href="/#security" className="underline-offset-4 hover:underline">How your data is kept safe</a>
        </p>
      </section>

      {/* brand side */}
      <aside className="relative hidden overflow-hidden border-l bg-zinc-950 text-zinc-50 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_0%,rgb(255_255_255/0.10),transparent_70%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(70%_60%_at_60%_30%,black,transparent)]" />

        <div className="relative inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-zinc-300">
          <span className="size-1.5 rounded-full bg-green-500 shadow-[0_0_0_3px_rgb(34_197_94/0.25)]" />
          Free · Chrome extension and dashboard
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight">Recruiter outreach, sent from your own inbox.</h2>

          {/* a campaign card, the way the dashboard shows it */}
          <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Campaign: React roles</span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-xs">
                <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
                Sending
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              {[["Queued", "142"], ["Sent", "86"], ["Replied", "7"]].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-white/10 px-3 py-2">
                  <div className="text-xs text-zinc-400">{k}</div>
                  <div className="mt-1 text-lg font-semibold tabular-nums">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ul className="relative grid gap-5">
          {FACTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5">
                <Icon className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-medium">{title}</span>
                <span className="block text-sm text-zinc-400">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
}
