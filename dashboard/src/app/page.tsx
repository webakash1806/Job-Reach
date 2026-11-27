import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { DM_Mono, Instrument_Serif, Inter } from "next/font/google";
import { GoogleTagManager } from "@/components/gtm";
import { LandingPage } from "./landing/landing-page";
import { landingCss } from "./landing/styles";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"] });
// the hero's sticker words ("your CV", "replies") and the ribbon's italic words
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic" });

const description =
  "Collect recruiter emails from LinkedIn hiring posts and send your CV from your own Gmail on a schedule, with follow-ups and reply detection. Free to use.";

export const metadata: Metadata = {
  title: "Job Outreach: recruiter email outreach for job seekers",
  description,
  openGraph: {
    type: "website",
    title: "Job Outreach: recruiter email outreach for job seekers",
    description: "Find recruiter emails on LinkedIn and send your CV from your own inbox, on a schedule. Free.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0a0a0a" };

// The kit's stylesheets in public/assets, in the order the kit expects. The UI panel script
// (ui.js) finds base.css and the fragment sheets already linked and does not add them again.
const KIT_CSS = [
  "system.css",
  "ui/cards.css",
  "motion/motion.css",
  "backgrounds/backgrounds.css",
  "layout/layout.css",
  "icons/icon.css",
  "ui/base.css",
  "ui/window/fragment.css",
  "ui/doc/fragment.css",
  "ui/search/fragment.css",
  "ui/files/fragment.css",
  "ui/toggles/fragment.css",
];

// Runs before first paint: the kit reads these from <html>.
const BOOT = `(function(){var d=document.documentElement;
d.setAttribute("data-type","software");d.setAttribute("data-radius","soft");d.setAttribute("data-ground","sky");
d.setAttribute("data-buttons","tonal");d.setAttribute("data-motion","");
d.classList.add("m-enter","mo-js");
setTimeout(function(){d.classList.add("m-enter-done")},700);setTimeout(function(){d.classList.add("mo-safe")},2500);})();`;

const fontCss = `:root{--font-display:${inter.style.fontFamily},system-ui,sans-serif;--font-text:${inter.style.fontFamily},system-ui,sans-serif;--font-mono:${dmMono.style.fontFamily},ui-monospace,Menlo,Consolas,monospace;--font-sticker:${serif.style.fontFamily},Georgia,serif}`;

export default function Home() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      {/* one precedence group keeps this order in <head>: kit first, then the page's own CSS */}
      {KIT_CSS.map((f) => (
        <link key={f} rel="stylesheet" href={`/assets/${f}`} precedence="landing" />
      ))}
      <style href="landing-page" precedence="landing">{fontCss + "\n" + landingCss}</style>
      {/* reads the palette before paint so dark grounds never flash light; it must run in place, not deferred */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="/assets/backgrounds/backgrounds.js" />
      <GoogleTagManager />
      <LandingPage />
      <Script type="module" src="/assets/system.js" strategy="afterInteractive" />
      <Script type="module" src="/assets/motion/motion.js" strategy="afterInteractive" />
      <Script type="module" src="/assets/layout/layout.js" strategy="afterInteractive" />
    </>
  );
}
