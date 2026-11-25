import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ACCESS_COOKIE, REFRESH_COOKIE, verifyAccess } from "@/lib/session";
import { clearAuthCookies, findSessionByRefresh, revokeSession, revokeUserSessions } from "@/lib/tokens";

// POST { all?: true }  -> ends this session, or every session of the user
// Works with an expired access token too, using the refresh cookie.
export async function POST(req: NextRequest) {
  const all = await req
    .json()
    .then((b) => !!b?.all)
    .catch(() => false);
  await connectDB();

  const access = await verifyAccess(req.cookies.get(ACCESS_COOKIE)?.value);
  const session = access ? null : await findSessionByRefresh(req.cookies.get(REFRESH_COOKIE)?.value);
  const sid = access?.sid ?? (session ? String(session._id) : null);
  const userId = access?.sub ?? (session ? String(session.userId) : null);

  let ended = 0;
  if (all && userId) ended = await revokeUserSessions(userId, "Signed out everywhere");
  else if (sid) {
    await revokeSession(sid, "Signed out");
    ended = 1;
  }
  const res = NextResponse.json({ ok: true, ended });
  clearAuthCookies(res);
  return res;
}
