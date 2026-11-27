import type { Metadata, Viewport } from "next";
import fs from "node:fs";
import path from "node:path";
import { DM_Mono, Inter } from "next/font/google";
import { GoogleTagManager } from "@/components/gtm";
import { LandingPage } from "./landing/landing-page";
// The kit's stylesheets in public/assets, in the order the kit expects, then the page's own. As imports
// Next bundles and minifies them into one hashed file, cached for a year: twelve linked files were twelve
// render-blocking requests on a phone, and inline <style> was sent twice (in the HTML and the RSC payload).
// data-kit-css on <html> tells the UI panel script (ui.js) not to link them again.
import "../../public/assets/system.css";
import "../../public/assets/ui/cards.css";
import "../../public/assets/motion/motion.css";
import "../../public/assets/backgrounds/backgrounds.css";
import "../../public/assets/layout/layout.css";
import "../../public/assets/icons/icon.css";
import "../../public/assets/ui/base.css";
import "../../public/assets/ui/window/fragment.css";
import "../../public/assets/ui/doc/fragment.css";
import "../../public/assets/ui/search/fragment.css";
import "../../public/assets/ui/files/fragment.css";
import "../../public/assets/ui/toggles/fragment.css";
import "./landing/landing.css";

// Inter: one variable file, and display optional, so the headline (the largest paint) is never painted a
// second time when the font arrives late on a slow phone; it keeps the size-matched fallback instead.
const inter = Inter({ subsets: ["latin"], display: "optional" });
// small UI text only: not preloaded, so it never competes with Inter
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], preload: false });

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

const asset = (f: string) => fs.readFileSync(path.join(process.cwd(), "public/assets", f), "utf8");
// reads the palette before paint so dark grounds never flash light; inlined so it costs no request
const backgroundsJs = asset("backgrounds/backgrounds.js");

// Runs before first paint: the kit reads these from <html>. No m-enter class: it hid the hero text until
// the motion script ran, which held the largest paint back by seconds on a phone. The hero rises by CSS.
const BOOT = `(function(){var d=document.documentElement;
d.setAttribute("data-type","software");d.setAttribute("data-radius","soft");d.setAttribute("data-ground","sky");
d.setAttribute("data-buttons","tonal");d.setAttribute("data-motion","");d.setAttribute("data-kit-css","");
d.classList.add("mo-js");setTimeout(function(){d.classList.add("mo-safe")},2500);})();`;

const fontCss = `html:root{--font-display:${inter.style.fontFamily},system-ui,sans-serif;--font-text:${inter.style.fontFamily},system-ui,sans-serif;--font-mono:${dmMono.style.fontFamily},ui-monospace,Menlo,Consolas,monospace}`;

export default function Home() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <style href="landing-fonts" precedence="landing">{fontCss}</style>
      <script dangerouslySetInnerHTML={{ __html: backgroundsJs }} />
      <GoogleTagManager />
      <LandingPage />
      {/* plain module scripts: deferred by the browser, in this order. next/script also preloaded them in a
          non-module mode, so each one downloaded twice */}
      {/* eslint-disable @next/next/no-sync-scripts -- type=module scripts are deferred, never blocking */}
      <script type="module" src="/assets/system.js" />
      <script type="module" src="/assets/motion/motion.js" />
      <script type="module" src="/assets/layout/layout.js" />
      {/* eslint-enable @next/next/no-sync-scripts */}
    </>
  );
}
