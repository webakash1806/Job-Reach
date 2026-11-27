"use client";

import { useEffect } from "react";

// The hero's two measured motions. Runs after hydration and only writes CSS variables on <html> and SVG
// attributes React does not render, so it never changes markup React hydrates.
//  - --hs-travel: how far the phone moves to land in the next section's empty slot, and --hs-range: over how
//    much scroll (until that section reaches the nav), so the heading, cards and phone arrive together.
//    The CSS scroll animation reads both; on narrow screens or without scroll-driven animations they stay 0.
//  - the ribbon loops by exactly one repeat of its words, so the marquee has no jump.
export function HeroMotion() {
  useEffect(() => {
    const html = document.documentElement;
    const top = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

    const measure = () => {
      // the arch must end at the hero's bottom edge (under the ribbon), whatever the window size: clip what hangs below
      const hero = document.querySelector<HTMLElement>(".hstage");
      const center = document.querySelector<HTMLElement>(".hstage__center");
      if (hero && center) html.style.setProperty("--hs-arch-cut", `${Math.max(0, Math.ceil(center.getBoundingClientRect().bottom - hero.getBoundingClientRect().bottom))}px`);
      const fly = document.querySelector<HTMLElement>(".hs-fly");
      const slot = document.querySelector<HTMLElement>(".pain__slot");
      const pain = document.querySelector<HTMLElement>(".pain");
      const nav = document.querySelector<HTMLElement>(".nav");
      if (!fly || !slot || !pain || !window.matchMedia("(min-width: 1200px)").matches) { html.style.setProperty("--hs-travel", "0px"); html.style.removeProperty("--hs-range"); return; }
      // the phone's resting place, read with its scroll animation paused at the start
      const prev = fly.style.animation;
      fly.style.animation = "none";
      const d = Math.max(0, Math.round(top(slot) - top(fly)));
      fly.style.animation = prev;
      html.style.setProperty("--hs-travel", `${d}px`);
      html.style.setProperty("--hs-range", `${Math.max(1, Math.round(top(pain) - (nav?.offsetHeight ?? 0)))}px`);
    };

    const ribbon = () => {
      const tp = document.querySelector<SVGTextPathElement>(".hstage__ribbon textPath");
      const first = tp?.querySelector<SVGTSpanElement>(":scope > tspan");
      const anim = tp?.querySelector("animate");
      if (!tp || !first || !anim) return;
      const len = first.getComputedTextLength();
      if (len > 0) anim.setAttribute("to", String(-len));
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) tp.closest("svg")?.pauseAnimations();
    };

    measure();
    ribbon();
    document.fonts?.ready.then(() => { measure(); ribbon(); });
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => { ro.disconnect(); for (const v of ["--hs-travel", "--hs-range", "--hs-arch-cut"]) html.style.removeProperty(v); };
  }, []);
  return null;
}
