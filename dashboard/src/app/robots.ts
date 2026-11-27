import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// Only the home and sign-in pages are public; the dashboard sits behind sign-in.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const SITE = await siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login"],
      disallow: ["/api/", "/dashboard", "/contacts", "/campaigns", "/sent", "/followups", "/resumes", "/templates", "/extension", "/settings", "/admin"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
