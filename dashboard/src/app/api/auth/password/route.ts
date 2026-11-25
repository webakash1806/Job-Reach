import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, handler, HttpError } from "@/lib/auth";
import { revokeUserSessions } from "@/lib/tokens";

const Body = z.object({
  current: z.string().min(1),
  next: z.string().min(8, "New password must be at least 8 characters").max(200),
});

// Changes your own password and signs out every other device.
export const POST = handler(async (req: Request) => {
  const s = await getSession();
  if (!s) throw new HttpError(401, "Not signed in");
  const b = Body.parse(await req.json());
  if (!(await bcrypt.compare(b.current, s.user.passwordHash))) throw new HttpError(400, "Current password is wrong");
  if (b.current === b.next) throw new HttpError(400, "Choose a different password");
  s.user.passwordHash = await bcrypt.hash(b.next, 10);
  await s.user.save();
  const ended = await revokeUserSessions(s.user._id, "Password changed", s.sessionId);
  return NextResponse.json({ ok: true, endedOtherSessions: ended });
});
