import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "./db";
import { Session, User } from "./models";
import { ACCESS_COOKIE, verifyAccess } from "./session";

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "itsakash18.06@gmail.com").toLowerCase();

/** Creates the admin account on first run from ADMIN_EMAIL / ADMIN_PASSWORD. */
export async function ensureAdmin() {
  await connectDB();
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role !== "admin" || !existing.active) {
      existing.role = "admin";
      existing.active = true;
      await existing.save();
    }
    return;
  }
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD is not set; it is needed to create the admin account");
  await User.create({ email: ADMIN_EMAIL, name: "Admin", role: "admin", passwordHash: await bcrypt.hash(pw, 10) });
}

/**
 * Validates the access token and checks the session is still live in the database,
 * so "sign out everywhere", password resets and disabled accounts take effect at once.
 */
export async function getSession() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const a = await verifyAccess(token);
  if (!a) return null;
  await connectDB();
  const [user, session] = await Promise.all([
    User.findById(a.sub),
    Session.findById(a.sid).select("revokedAt absoluteExpiresAt userId").lean(),
  ]);
  if (!user || !user.active) return null;
  if (!session || session.revokedAt || String(session.userId) !== String(user._id)) return null;
  if (session.absoluteExpiresAt.getTime() < Date.now()) return null;
  return { user, sessionId: a.sid };
}

export async function getSessionUser() {
  return (await getSession())?.user ?? null;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function requireUser() {
  const u = await getSessionUser();
  if (!u) throw new HttpError(401, "Not signed in");
  return u;
}

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== "admin" || u.email !== ADMIN_EMAIL) throw new HttpError(403, "Admin only");
  return u;
}

/** Wraps a route handler: JSON errors, consistent status codes. */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      const err = e as { code?: number; message?: string; name?: string };
      if (err?.code === 11000) return NextResponse.json({ error: "Already exists" }, { status: 409 });
      if (err?.name === "ZodError") return NextResponse.json({ error: "Invalid input", details: e }, { status: 400 });
      console.error(e);
      return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
    }
  };
}
