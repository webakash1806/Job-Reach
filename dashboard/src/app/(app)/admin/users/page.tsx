"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRoundIcon, Loader2Icon, LogOutIcon, PlusIcon, Trash2Icon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader, SecureNote } from "@/components/bits";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, fmtDate } from "@/lib/api";

type U = { _id: string; email: string; name?: string; role: string; active: boolean; createdAt: string; contacts: number; sent: number; sessions: number };

export default function UsersPage() {
  const [rows, setRows] = useState<U[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pwFor, setPwFor] = useState<U | null>(null);
  const [delFor, setDelFor] = useState<U | null>(null);

  const load = useCallback(() => api<{ users: U[] }>("/api/admin/users").then((d) => setRows(d.users)).catch((e) => toast.error(e.message)), []);
  useEffect(() => {
    load();
  }, [load]);

  async function patch(id: string, body: Record<string, unknown>, msg: string) {
    try {
      const r = await api<{ endedSessions?: number }>(`/api/admin/users/${id}`, { method: "PATCH", json: body });
      toast.success(r.endedSessions ? `${msg}. Signed out of ${r.endedSessions} session${r.endedSessions === 1 ? "" : "s"}.` : msg);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function remove(u: U) {
    try {
      await api(`/api/admin/users/${u._id}`, { method: "DELETE" });
      toast.success(`Deleted ${u.email}`);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader title="Users" description="Only the admin can create accounts. Each user has their own contacts, CVs, SMTP and campaigns.">
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          Create user
        </Button>
      </PageHeader>
      {/* phones: one card per user */}
      <div className="grid gap-2 @3xl:hidden">
        {!rows ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          rows.map((u) => (
            <div key={u._id} className="grid gap-3 rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium"><span className="break-all">{u.email}</span>{u.role === "admin" && <Badge variant="secondary">Admin</Badge>}</p>
                  {u.name && <p className="text-xs text-muted-foreground">{u.name}</p>}
                </div>
                <Switch aria-label={`Account active for ${u.email}`} checked={u.active} disabled={u.role === "admin"} onCheckedChange={(v) => patch(u._id, { active: v }, v ? "Enabled" : "Disabled")} />
              </div>
              <dl className="grid grid-cols-3 gap-2 text-xs">
                <div><dt className="text-muted-foreground">Contacts</dt><dd className="mt-0.5 text-sm font-medium tabular-nums">{u.contacts}</dd></div>
                <div><dt className="text-muted-foreground">Sent</dt><dd className="mt-0.5 text-sm font-medium tabular-nums">{u.sent}</dd></div>
                <div><dt className="text-muted-foreground">Signed in</dt><dd className="mt-0.5 text-sm">{u.sessions ? `${u.sessions} device${u.sessions === 1 ? "" : "s"}` : "Signed out"}</dd></div>
              </dl>
              <div className="flex flex-wrap gap-2 border-t pt-3">
                <Button variant="outline" size="sm" onClick={() => setPwFor(u)}><KeyRoundIcon />Reset password</Button>
                {u.role !== "admin" && u.sessions > 0 && <Button variant="outline" size="sm" onClick={() => patch(u._id, { endSessions: true }, "Signed out")}><LogOutIcon />Sign out</Button>}
                {u.role !== "admin" && <Button variant="outline" size="sm" onClick={() => setDelFor(u)}><Trash2Icon />Delete</Button>}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="hidden overflow-x-auto rounded-lg border @3xl:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Signed in</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Active</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!rows ? (
              <TableRow><TableCell colSpan={7} className="text-muted-foreground">Loading...</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={7}><EmptyState icon={UsersIcon} title="No users" /></TableCell></TableRow>
            ) : (
              rows.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{u.email}</span>
                      {u.role === "admin" && <Badge variant="secondary">Admin</Badge>}
                    </div>
                    {u.name && <span className="text-xs text-muted-foreground">{u.name}</span>}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">{u.contacts}</TableCell>
                  <TableCell className="font-mono tabular-nums">{u.sent}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.sessions ? `${u.sessions} device${u.sessions === 1 ? "" : "s"}` : "Signed out"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(u.createdAt)}</TableCell>
                  <TableCell>
                    <Switch
                      aria-label={`Account active for ${u.email}`}
                      checked={u.active}
                      disabled={u.role === "admin"}
                      onCheckedChange={(v) => patch(u._id, { active: v }, v ? "Enabled" : "Disabled")}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm" aria-label="Reset password" title="Reset password" onClick={() => setPwFor(u)}><KeyRoundIcon /></Button>
                    {u.role !== "admin" && u.sessions > 0 && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Sign ${u.email} out everywhere`}
                        title="Sign out everywhere"
                        onClick={() => patch(u._id, { endSessions: true }, "Signed out")}
                      >
                        <LogOutIcon />
                      </Button>
                    )}
                    {u.role !== "admin" && (
                      <Button variant="ghost" size="icon-sm" aria-label="Delete user" title="Delete user" onClick={() => setDelFor(u)}><Trash2Icon /></Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onDone={load} />
      <PasswordDialog user={pwFor} onClose={() => setPwFor(null)} onSave={(pw) => pwFor && patch(pwFor._id, { password: pw }, "Password updated")} />

      <AlertDialog open={!!delFor} onOpenChange={(o) => !o && setDelFor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {delFor?.email}?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the account with all its contacts, CVs, templates, campaigns and email history. It cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => delFor && remove(delFor)}>Delete user</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CreateUserDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void }) {
  const [f, setF] = useState({ email: "", name: "", password: "" });
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/admin/users", { method: "POST", json: f });
      toast.success(`Created ${f.email}. Share the password with them securely.`);
      setF({ email: "", name: "", password: "" });
      onOpenChange(false);
      onDone();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>They sign in with this email and password and can change nothing about other users.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="u-email">Email</Label>
            <Input id="u-email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="u-name">Name</Label>
            <Input id="u-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="u-pass">Password</Label>
            <Input id="u-pass" type="password" autoComplete="new-password" required minLength={8} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </div>
          <SecureNote title="Saved only as a bcrypt hash">
            A one-way lock: no one can read this password later, you included. Share it with them yourself.
          </SecureNote>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2Icon className="animate-spin" />}
              Create user
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PasswordDialog({ user, onClose, onSave }: { user: U | null; onClose: () => void; onSave: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(pw);
            setPw("");
            onClose();
          }}
        >
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>{user?.email} will be signed out on every device.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="np">New password</Label>
            <Input id="np" type="password" autoComplete="new-password" minLength={8} required value={pw} onChange={(e) => setPw(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit">Save password</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
