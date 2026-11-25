import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, handler, HttpError } from "@/lib/auth";
import { Session } from "@/lib/models";
import { revokeSession, revokeUserSessions } from "@/lib/tokens";

async function current() {
  const s = await getSession();
  if (!s) throw new HttpError(401, "Not signed in");
  return s;
}

// Active sessions of the signed-in user
export const GET = handler(async () => {
  const { user, sessionId } = await current();
  const now = new Date();
  const sessions = await Session.find({ userId: user._id, revokedAt: null, expiresAt: { $gt: now }, absoluteExpiresAt: { $gt: now } })
    .sort({ lastUsedAt: -1 })
    .select("userAgent ip createdAt lastUsedAt expiresAt")
    .lean();
  return NextResponse.json({ sessions: sessions.map((s) => ({ ...s, current: String(s._id) === sessionId })) });
});

const Body = z.union([z.object({ id: z.string() }), z.object({ others: z.literal(true) })]);

// { id } ends one session, { others: true } ends every session except this one
export const DELETE = handler(async (req: Request) => {
  const { user, sessionId } = await current();
  const b = Body.parse(await req.json());
  if ("others" in b) {
    const ended = await revokeUserSessions(user._id, "Signed out from another device", sessionId);
    return NextResponse.json({ ended });
  }
  const s = await Session.findOne({ _id: b.id, userId: user._id });
  if (!s) throw new HttpError(404, "Session not found");
  await revokeSession(String(s._id), "Signed out from another device");
  return NextResponse.json({ ended: 1, current: b.id === sessionId });
});
