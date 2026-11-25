import { NextResponse } from "next/server";
import { handler, requireUser } from "@/lib/auth";
import { newApiKey } from "@/lib/crypto";
import { buildExtensionZip, extensionVersion } from "@/lib/extension-pack";

/** The URL the user is actually using, so the extension calls back to the same place. */
function publicOrigin(req: Request) {
  const h = req.headers;
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || new URL(req.url).protocol.replace(":", "");
  if (host) return `${proto}://${host}`;
  return (process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin).replace(/\/+$/, "");
}

// GET /api/extension            -> status for the setup page
// GET /api/extension?download=1 -> personalised zip (contains this user's API key)
export const GET = handler(async (req: Request) => {
  const user = await requireUser();
  if (!user.apiKey) {
    user.apiKey = newApiKey();
    await user.save();
  }
  const dashboardUrl = publicOrigin(req);

  if (new URL(req.url).searchParams.get("download")) {
    const zip = await buildExtensionZip({ dashboardUrl, apiKey: user.apiKey, email: user.email });
    return new Response(new Uint8Array(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="job-outreach-extension.zip"',
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json({
    dashboardUrl,
    apiKey: user.apiKey,
    version: await extensionVersion().catch(() => null),
    lastSeenAt: user.extensionLastSeenAt ?? null,
    lastVersion: user.extensionVersion ?? null,
  });
});
