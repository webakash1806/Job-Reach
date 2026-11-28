"use client";

import { useEffect } from "react";
import "lenis/dist/lenis.css";

// Lenis smooth wheel scrolling for the landing page only. It moves the real page scroll, so the CSS
// scroll-driven animations (animation-timeline: scroll()/view()) keep working unchanged.
// Loaded after hydration so it stays off the first-paint path; skipped for reduced motion.
// Touch scrolling stays native (Lenis's default), so phones are unaffected.
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cleanup = () => {};
    let cancelled = false;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({ autoRaf: true });

      // In-page links (#how, #product...). Lenis's own `anchors` option doesn't cancel the browser's
      // jump (it flickers), and the fixed nav's height is only final after the kit script runs,
      // so handle the click here and measure the nav each time.
      const onClick = (e: MouseEvent) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
        const hash = a?.getAttribute("href");
        if (!a || !hash) return;
        const target = hash === "#top" || hash === "#" ? 0 : document.getElementById(decodeURIComponent(hash.slice(1)));
        if (target === null) return;
        e.preventDefault();
        const nav = document.querySelector<HTMLElement>(".nav")?.offsetHeight ?? 0;
        lenis.scrollTo(target, { offset: target === 0 ? 0 : -nav });
        history.pushState(null, "", hash);
      };
      document.addEventListener("click", onClick);
      cleanup = () => {
        document.removeEventListener("click", onClick);
        lenis.destroy();
      };
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);
  return null;
}
