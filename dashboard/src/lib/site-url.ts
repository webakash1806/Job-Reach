import { headers } from "next/headers";

// The public address this request came in on (behind Cloudflare or a proxy: the forwarded host),
// so robots.txt and the sitemap never point at a wrong NEXT_PUBLIC_APP_URL.
export async function siteUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto.split(",")[0]}://${host.split(",")[0]}`;
}
