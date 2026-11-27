import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, redirectTo, verifyAccess } from "@/lib/session";

// Reachable without an access token. /api/auth/* includes refresh and logout,
// which authenticate with the refresh cookie (only ever sent to /api/auth).
// /.well-known: nothing is published there, so those paths answer 404 instead of the sign-in redirect.
const PUBLIC = ["/assets", "/login", "/robots.txt", "/sitemap.xml", "/llms.txt", "/.well-known", "/api/auth/login", "/api/auth/refresh", "/api/auth/logout", "/api/ingest"];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === "/" || PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) return NextResponse.next();

  const access = await verifyAccess(req.cookies.get(ACCESS_COOKIE)?.value);
  if (!access) {
    // API calls from fetch(): the dashboard's helper refreshes and retries on this 401.
    // Browser navigations (download links, opening a CV) get the redirect below instead.
    const isNavigation = req.headers.get("sec-fetch-mode") === "navigate";
    if (pathname.startsWith("/api/") && !isNavigation)
      return NextResponse.json({ error: "Not signed in", code: "token_expired" }, { status: 401 });
    // Pages: swap the refresh token for a new access token, then come back here
    return redirectTo(req, `/api/auth/refresh?next=${encodeURIComponent(pathname + search)}`);
  }
  if ((pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) && access.role !== "admin") {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Admin only" }, { status: 403 });
    return redirectTo(req, "/dashboard");
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)"],
};
