import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE = await siteUrl();
  return [
    { url: `${SITE}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/login`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
