import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { REFRESH_COOKIE } from "@/lib/session";
import { clearAuthCookies, rotateRefresh, setAuthCookies } from "@/lib/tokens";

/** Only allow redirects back into this app. */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") && !next.startsWith("/api/auth/") ? next : "/dashboard";
}

async function refresh(req: NextRequest) {
  await connectDB();
  return rotateRefresh(req.cookies.get(REFRESH_COOKIE)?.value, req);
}

// fetch() from the dashboard when an API call returns 401
export async function POST(req: NextRequest) {
  const r = await refresh(req);
  if (!r.ok) {
    const res = NextResponse.json({ error: "Session expired, please sign in again", reason: r.reason }, { status: 401 });
    clearAuthCookies(res);
    return res;
  }
  const res = NextResponse.json({ ok: true });
  setAuthCookies(res, r.access, r.refresh);
  return res;
}

// page navigation: middleware redirects here when the access token has expired
export async function GET(req: NextRequest) {
  const next = safeNext(req.nextUrl.searchParams.get("next"));
  const r = await refresh(req);
  if (!r.ok) {
    const login = new URL("/login", req.url);
    if (next !== "/dashboard") login.searchParams.set("next", next);
    const res = NextResponse.redirect(login);
    clearAuthCookies(res);
    return res;
  }
  const res = NextResponse.redirect(new URL(next, req.url));
  setAuthCookies(res, r.access, r.refresh);
  return res;
}
