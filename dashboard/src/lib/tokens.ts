import "server-only";
import crypto from "node:crypto";
import type { NextResponse } from "next/server";
import type { Types } from "mongoose";
import { Session, User } from "./models";
import { ACCESS_COOKIE, ACCESS_TTL_SEC, LEGACY_COOKIE, REFRESH_COOKIE, signAccess } from "./session";

const DAY = 86400000;
export const REFRESH_TTL_DAYS = 30; // sliding: stays signed in while used at least monthly
export const ABSOLUTE_TTL_DAYS = 90; // hard cap: sign in again after 90 days
const REUSE_GRACE_MS = 30_000; // parallel tabs refreshing at once must not look like theft
const REFRESH_PATH = "/api/auth";

const hash = (t: string) => crypto.createHash("sha256").update(t).digest("hex");
const newRefreshToken = () => crypto.randomBytes(48).toString("base64url");

export function secureCookies() {
  return (process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https://");
}

export function requestMeta(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";
  return { ip: ip.slice(0, 64), userAgent: (req.headers.get("user-agent") || "").slice(0, 300) };
}

type UserLike = { _id: Types.ObjectId; email: string; role?: string | null };

function accessFor(user: UserLike, sid: string) {
  return signAccess({ sub: String(user._id), email: user.email, role: (user.role as "admin" | "user") || "user", sid });
}

export async function createSession(user: UserLike, req: Request) {
  const refresh = newRefreshToken();
  const now = Date.now();
  const session = await Session.create({
    userId: user._id,
    tokenHash: hash(refresh),
    ...requestMeta(req),
    lastUsedAt: new Date(now),
    expiresAt: new Date(now + REFRESH_TTL_DAYS * DAY),
    absoluteExpiresAt: new Date(now + ABSOLUTE_TTL_DAYS * DAY),
  });
  return { access: await accessFor(user, String(session._id)), refresh, sessionId: String(session._id) };
}

export type RefreshResult =
  | { ok: true; access: string; refresh?: string; userId: string }
  | { ok: false; reason: string };

/**
 * Exchanges a refresh token for a new access token and a new refresh token (rotation).
 * Presenting an already-rotated token after the grace window means it was copied:
 * the whole session is revoked so neither the thief nor the victim can keep using it.
 */
export async function rotateRefresh(token: string | undefined, req: Request): Promise<RefreshResult> {
  if (!token) return { ok: false, reason: "No refresh token" };
  const h = hash(token);
  const now = Date.now();

  let session = await Session.findOne({ tokenHash: h });
  let graceReuse = false;
  if (!session) {
    const old = await Session.findOne({ prevHash: h });
    if (!old) return { ok: false, reason: "Unknown refresh token" };
    if (!old.revokedAt && old.rotatedAt && now - old.rotatedAt.getTime() < REUSE_GRACE_MS) {
      session = old; // another tab already rotated it a moment ago
      graceReuse = true;
    } else {
      if (!old.revokedAt) {
        old.revokedAt = new Date();
        old.revokedReason = "Refresh token reuse detected";
        await old.save();
      }
      return { ok: false, reason: "Refresh token was already used" };
    }
  }

  if (session.revokedAt) return { ok: false, reason: "Session ended" };
  if (session.expiresAt.getTime() < now || session.absoluteExpiresAt.getTime() < now)
    return { ok: false, reason: "Session expired" };

  const user = await User.findById(session.userId).select("email role active").lean();
  if (!user || !user.active) {
    session.revokedAt = new Date();
    session.revokedReason = "Account disabled";
    await session.save();
    return { ok: false, reason: "Account disabled" };
  }

  const access = await accessFor(user as UserLike, String(session._id));
  if (graceReuse) return { ok: true, access, userId: String(user._id) }; // keep the newer cookie the other tab set

  const refresh = newRefreshToken();
  const meta = requestMeta(req);
  // Atomic: only succeeds if nobody rotated this token in the meantime.
  const rotated = await Session.findOneAndUpdate(
    { _id: session._id, tokenHash: h, revokedAt: null },
    {
      $set: {
        prevHash: h,
        tokenHash: hash(refresh),
        rotatedAt: new Date(now),
        lastUsedAt: new Date(now),
        expiresAt: new Date(Math.min(now + REFRESH_TTL_DAYS * DAY, session.absoluteExpiresAt.getTime())),
        ...(meta.ip ? { ip: meta.ip } : {}),
        ...(meta.userAgent ? { userAgent: meta.userAgent } : {}),
      },
    },
    { new: true }
  );
  if (!rotated) return { ok: true, access, userId: String(user._id) }; // a parallel request won the race
  return { ok: true, access, refresh, userId: String(user._id) };
}

export async function findSessionByRefresh(token?: string) {
  if (!token) return null;
  return Session.findOne({ tokenHash: hash(token) });
}

export async function revokeSession(sessionId: string, reason: string) {
  await Session.updateOne({ _id: sessionId, revokedAt: null }, { revokedAt: new Date(), revokedReason: reason });
}

/** Ends every session of a user (optionally keeping one, e.g. the browser that changed the password). */
export async function revokeUserSessions(userId: Types.ObjectId | string, reason: string, exceptSessionId?: string) {
  const filter: Record<string, unknown> = { userId, revokedAt: null };
  if (exceptSessionId) filter._id = { $ne: exceptSessionId };
  const r = await Session.updateMany(filter, { revokedAt: new Date(), revokedReason: reason });
  return r.modifiedCount;
}

export function setAuthCookies(res: NextResponse, access: string, refresh?: string) {
  const secure = secureCookies();
  res.cookies.set(ACCESS_COOKIE, access, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: ACCESS_TTL_SEC });
  if (refresh)
    res.cookies.set(REFRESH_COOKIE, refresh, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: REFRESH_PATH,
      maxAge: REFRESH_TTL_DAYS * 86400,
    });
  res.cookies.set(LEGACY_COOKIE, "", { path: "/", maxAge: 0 });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { path: REFRESH_PATH, maxAge: 0 });
  res.cookies.set(LEGACY_COOKIE, "", { path: "/", maxAge: 0 });
}
