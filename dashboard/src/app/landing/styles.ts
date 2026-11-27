// The landing page's own CSS. It is a string (not a .css import) so page.tsx can load it as an
// ordered <style precedence>, after the kit stylesheets in public/assets: it overrides them.
export const landingCss = String.raw`
/* Landing page styles (the kit lives in public/assets) */
:root {
  --p-bg: #ffffff; --p-surface: #f5f5f5; --p-ink: #0a0a0a; --p-muted: #6a6a6a;
  --p-accent: #171717; --p-accent-ink: #ffffff; --p-action: #171717; --p-action-ink: #ffffff;
  --p-inv-bg: #0a0a0a; --p-inv-surface: #171717; --p-inv-ink: #ffffff; --p-inv-muted: #979797;
  --p-inv-accent: #ffffff; --p-inv-accent-ink: #0a0a0a; --p-inv-action: #ffffff; --p-inv-action-ink: #0a0a0a;
  --display-weight: 500;
  --display-tracking: -0.028em;
  --display-tracking-xl: -0.036em;
  --display-stretch: 100%;
  --ly-scale: 1.04;
}
/* the client's black-and-grey brand: the lit ground turned neutral (shadcn's zinc greys) */
html[data-ground] { --ground-bg: #e5e5e5; --ground-surface: #f5f5f5; --ground-ink: #0a0a0a; --ground-muted: #525252; --ground-accent: #404040; }
/* dark mode: shadcn's dark neutrals; same "theme" key and .dark class as the dashboard (next-themes) */
html.dark {
  color-scheme: dark;
  --p-bg: #0a0a0a; --p-surface: #171717; --p-ink: #fafafa; --p-muted: #a1a1a1;
  --p-accent: #fafafa; --p-accent-ink: #0a0a0a; --p-action: #fafafa; --p-action-ink: #0a0a0a;
  --p-inv-bg: #171717; --p-inv-surface: #262626; --p-inv-ink: #fafafa; --p-inv-muted: #a1a1a1;
}
html.dark[data-ground] { --ground-bg: #1c1c1c; --ground-surface: #171717; --ground-ink: #fafafa; --ground-muted: #a1a1a1; --ground-accent: #d4d4d4; }
html.dark .d-win, html.dark .d-card { background: #171717; color: #fafafa; box-shadow: 0 0 0 1px rgb(255 255 255 / .1), 0 24px 60px -28px rgb(0 0 0 / .8); }
html.dark .d-win__bar, html.dark .d-side, html.dark .d-rows, html.dark .d-row, html.dark .d-note__line { border-color: rgb(255 255 255 / .08); }
html.dark .d-win__bar, html.dark .d-card p, html.dark .d-side { color: #a1a1a1; }
html.dark .d-win__dots i { background: #404040; }
html.dark .d-side > span.is-on, html.dark .d-tabs span.is-on { background: rgb(255 255 255 / .08); color: #fafafa; }
html.dark .d-side .d-side__label, html.dark .d-row small, html.dark .d-row .when, html.dark .d-tabs span { color: #8a8a8a; }
html.dark .d-row b, html.dark .d-note__line b { color: #fafafa; }
html.dark .d-row img, html.dark .d-row .d-thumb, html.dark .d-chip, html.dark .d-note__line i, html.dark .d-avatar { background: #262626; color: #d4d4d4; }
html.dark .d-note__line { color: #d4d4d4; }
html.dark .d-btn, html.dark .d-chip--low { background: #fafafa; color: #0a0a0a; }
html.dark .d-chip--out { background: #3b1512; color: #f5a097; }
.theme-btn { display: inline-grid; place-items: center; width: 36px; height: 36px; border-radius: 8px; border: 1px solid color-mix(in oklab, var(--ink) 14%, transparent); background: transparent; color: var(--ink); cursor: pointer; }
.theme-btn:hover { background: color-mix(in oklab, var(--ink) 6%, transparent); }
.theme-btn svg { width: 16px; height: 16px; }
.theme-btn .moon, html.dark .theme-btn .sun { display: none; }
html.dark .theme-btn .moon { display: block; }
@media (max-width: 1023px) {
  .nav:not(.is-open) .nav__actions > .theme-btn { display: inline-grid; }
  .theme-btn { width: 44px; height: 44px; }
  .nav.is-open .nav__actions .theme-btn { justify-self: center; order: 3; }
}

  /* hero window (the collage demo's window rules, greys for the brand) */
.d-win { background: #fff; color: #16181a; border-radius: 12px; overflow: hidden; font: 400 14px/1.4 var(--font-text);
         box-shadow: 0 0 0 1px rgb(0 0 0 / .07), 0 24px 60px -28px rgb(0 0 0 / .45); text-align: left; }
.d-win__bar { display: flex; align-items: center; gap: 10px; height: 40px; padding: 0 14px; border-bottom: 1px solid rgb(0 0 0 / .07); font-size: 13px; color: #5d6268; }
.d-win__dots { display: flex; gap: 6px; } .d-win__dots i { width: 10px; height: 10px; border-radius: 50%; background: #dcdfe2; }
.d-win__body { display: grid; grid-template-columns: 160px 1fr; min-height: 420px; }
.d-side { padding: 14px 10px; border-right: 1px solid rgb(0 0 0 / .07); display: grid; align-content: start; gap: 2px; font-size: 13px; color: #4d5257; }
.d-side > span { display: flex; align-items: center; gap: 8px; height: 30px; padding: 0 8px; border-radius: 7px; }
.d-side > span.is-on { background: rgb(0 0 0 / .05); color: #16181a; font-weight: 500; }
.d-side > span i { width: 14px; height: 14px; border-radius: 4px; background: currentColor; opacity: .3; flex: none; }
.d-side .d-side__label { font-size: 13px; color: #8a8f94; height: 26px; margin-top: 8px; }
.d-main { padding: 16px 18px; display: grid; align-content: start; gap: 12px; min-width: 0; }
.d-main__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.d-main__head h4 { font: 600 16px/1.2 var(--font-text); letter-spacing: -0.01em; margin: 0; color: inherit; }
.d-btn { display: inline-flex; align-items: center; height: 28px; padding: 0 10px; border-radius: 7px; background: #16181a; color: #fff; font-size: 13px; font-weight: 500; }
.d-tabs { display: flex; gap: 4px; font-size: 13px; } .d-tabs span { padding: 4px 10px; border-radius: 99px; color: #6b7076; } .d-tabs span.is-on { background: rgb(0 0 0 / .06); color: #16181a; font-weight: 500; }
.d-rows { display: grid; border-top: 1px solid rgb(0 0 0 / .07); }
.d-row { display: grid; grid-template-columns: 36px minmax(0, 1fr) 56px 96px 84px; align-items: center; gap: 12px; padding: 9px 2px; border-bottom: 1px solid rgb(0 0 0 / .07); font-size: 13px; }
.d-row img, .d-row .d-thumb { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; background: #eef0ee; }
.d-row b { display: block; font-weight: 500; color: #16181a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.d-row small { color: #7b8086; font-size: 13px; }
.d-row .num { text-align: right; font-variant-numeric: tabular-nums; }
.d-row .when { color: #7b8086; font-size: 13px; text-align: right; white-space: nowrap; }
@media (max-width: 639px) { .d-win__body { grid-template-columns: 1fr; } .d-side { display: none; } .d-row, .ly-piece--main .d-row { grid-template-columns: 36px minmax(0, 1fr) auto; } .d-row small { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .d-row .num { display: none; } }
.d-chip { justify-self: end; display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 8px; border-radius: 99px; font-size: 13px; font-weight: 500; background: #f0f0f0; color: #404040; white-space: nowrap; }
.d-chip::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.d-chip--low { background: #171717; color: #fff; }
.d-chip--out { background: #fbe6e3; color: #a3271b; }
.d-card { background: #fff; color: #16181a; border-radius: 12px; padding: 14px 16px; font: 400 14px/1.4 var(--font-text); text-align: left;
          box-shadow: 0 0 0 1px rgb(0 0 0 / .07), 0 18px 44px -20px rgb(0 0 0 / .45); }
.d-card h5 { margin: 0 0 4px; font: 600 14px/1.3 var(--font-text); }
.d-card p { margin: 0; color: #5d6268; font-size: 13px; }
.d-card__row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  /* hero collage: the small result card and the window's rows (from the hero's recipe) */
  .hero__art > .ly-piece--note { left: var(--s-6); bottom: var(--s-6); width: 300px; z-index: 2; }
  .d-note__line { display: flex; align-items: center; gap: 10px; padding: 7px 0; font-size: 13px; color: #404040; border-top: 1px solid rgb(0 0 0 / .06); }
  .d-note__line:first-of-type { border-top: 0; }
  .d-note__line i { width: 18px; height: 18px; border-radius: 50%; flex: none; display: grid; place-items: center; background: #f0f0f0; color: #171717; font-style: normal; font-size: 12px; font-weight: 600; }
  .d-note__line b { font-weight: 500; color: #0a0a0a; }
  .hero__proof { font-size: var(--t-small); color: var(--muted); }
  .ly-piece--main .d-row { grid-template-columns: 36px minmax(0, 1fr) 56px 96px; }
  .d-avatar { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: 500; background: #ededed; color: #262626; }
  /* app-frame (sections-library.md, app-frame) */
  .app.ui { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); margin-top: var(--s-7); background: var(--u-bg); border: 1px solid var(--u-border); border-radius: var(--u-r); box-shadow: var(--u-shadow); }
  .app > .app__pane { position: relative; min-width: 0; min-height: 0; overflow: hidden; }
  .app > .app__pane + .app__pane { border-left: 1px solid var(--u-line); }
  .app > .app__pane > .ui-panel { width: 100%; border: 0; border-radius: 0; box-shadow: none; }
  .app > .app__pane > .ui-doc { width: 100%; padding: var(--s-6); }
  .app > .app__pane::after { content: ""; position: absolute; inset: auto 0 0 0; height: 64px; background: linear-gradient(transparent, var(--u-bg)); pointer-events: none; }
  @media (min-width: 1024px) and (max-width: 1279px) { .app.ui { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); } }
  @media (max-width: 1023px) {
    .app.ui { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); }
    .app > .app__pane--list { max-height: 252px; }
    .app > .app__pane--list::after { display: none; }
    .app .ui-win__side { display: none; }
    .app .ui-win__body { grid-template-columns: minmax(0, 1fr); }
    .app > .app__pane + .app__pane { border-left: 0; border-top: 1px solid var(--u-line); }
  }
  @media (max-width: 639px) {
    .app.ui { grid-template-rows: minmax(0, 1fr); }
    .app > .app__pane--list { display: none; }
    .app > .app__pane + .app__pane { border-top: 0; }
    .app > .app__pane > .ui-doc { padding: var(--s-4); }
  }
  /* steps: one panel height for the group */
  #how .panel { --p-h: 336px; }
  /* hero polish: a soft top light, a small badge, the tools it works with */
  .hero { background-image: radial-gradient(55% 60% at 75% -10%, color-mix(in oklab, var(--ink) 9%, transparent), transparent 70%); }
  .hero__badge { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 var(--s-5); padding: 5px 12px; border-radius: 99px; border: 1px solid color-mix(in oklab, var(--ink) 14%, transparent); font-size: 13px; font-weight: 500; color: var(--muted); }
  .hero__badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 3px color-mix(in oklab, #22c55e 25%, transparent); }
  .hero__works { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; margin-top: var(--s-6); font-size: 13px; color: var(--muted); }
  .hero__works > span:first-child { margin-right: 4px; }
  .hero__works img { margin-left: 6px; }
  /* free: three fact cards */
  .free-facts { margin: var(--s-8) 0 0; row-gap: var(--grid-gap, 24px); }
  .free-card { padding: var(--s-6); border-radius: 14px; border: 1px solid color-mix(in oklab, var(--ink) 12%, transparent); background: color-mix(in oklab, var(--ink) 3%, transparent); }
  .free-card dt { font-size: 13px; color: var(--muted); }
  .free-card dd { margin: var(--s-4) 0 0; color: var(--muted); }
  .free-card dd b { display: block; margin-bottom: var(--s-2); font-size: clamp(32px, 3.4vw, 48px); line-height: 1; font-weight: 500; letter-spacing: -0.03em; color: var(--ink); }
  /* security: the account security panel */
  #security .frame--split { display: grid; place-items: center; padding: var(--s-6); }
  #security .frame--split::before { display: none; }
  .sec-panel { width: min(100%, 440px); padding: 18px; border-radius: 14px; background: color-mix(in oklab, var(--ink) 5%, var(--bg)); border: 1px solid color-mix(in oklab, var(--ink) 12%, transparent); box-shadow: 0 30px 80px -30px rgb(0 0 0 / .7); font-size: 14px; color: var(--ink); text-align: left; }
  .sec-panel__head { display: flex; justify-content: space-between; align-items: center; padding: 0 2px 12px; }
  .sec-panel__label { padding: 16px 2px 6px; font-size: 12px; color: var(--muted); }
  .sec-row { display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 10px 2px; border-top: 1px solid color-mix(in oklab, var(--ink) 9%, transparent); }
  .sec-row b { display: block; font-weight: 500; }
  .sec-row small { display: block; color: var(--muted); font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sec-ico { width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; background: color-mix(in oklab, var(--ink) 8%, transparent); }
  .sec-ico svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
  .sec-pill { height: 22px; padding: 0 9px; display: inline-flex; align-items: center; border-radius: 99px; font-size: 12px; font-weight: 500; background: color-mix(in oklab, var(--ink) 9%, transparent); color: var(--ink); }
  .sec-pill--ok { background: color-mix(in oklab, #22c55e 18%, transparent); color: #15803d; }
  html.dark .sec-pill--ok { color: #4ade80; }
  @media (max-width: 639px) { #security .frame--split { aspect-ratio: auto; height: auto; padding: var(--s-4) var(--s-3); } .sec-panel { padding: 14px; } .sec-row { gap: 10px; } }
  .sec-btn { height: 26px; padding: 0 10px; display: inline-flex; align-items: center; border-radius: 7px; font-size: 12px; font-weight: 500; border: 1px solid color-mix(in oklab, var(--ink) 18%, transparent); }
  @media (min-width: 1024px) { #security .frame--split { aspect-ratio: auto; height: calc(100svh - var(--padt) - var(--padb)); } }
  .ly-piece--main .d-row small { white-space: nowrap; overflow: hidden; text-overflow: clip; }
  @media (max-width: 1023px) { .hero__art .d-side { display: none; } .hero__art .d-win__body { grid-template-columns: 1fr; } .hero__art .d-row:nth-child(n+6) { display: none; } .hero__art .d-row { grid-template-columns: 32px minmax(0, 1fr) auto; } .hero__art .d-row .num { display: none; } }
  .d-row small { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  @media (max-width: 639px) { .hero__art .d-tabs, .hero__art .d-main__head { display: none; } .hero__art .d-row:nth-child(n+4) { display: none; } .hero__art .d-row { grid-template-columns: 32px minmax(0, 1fr) auto; } }
  @media (min-width: 640px) and (max-width: 1279px) { #how { --h: 2; } }
  @media (min-width: 640px) and (max-width: 1023px) { #security .frame--split { aspect-ratio: auto; height: auto; } #faq .grid > .span-5 { grid-column: 1 / 7; } #faq .faq { grid-column: 7 / -1; } #free .free-facts > div { grid-column: 1 / -1; } }
  @media (max-width: 639px) { #how .panel { --p-h: 200px; } }

/* questions: an intro with a sign-in card, numbered question cards */
.faq-intro { display: grid; align-content: start; gap: var(--s-5); }
.faq-help { display: grid; gap: var(--s-2); margin-top: var(--s-4); padding: var(--s-5); border-radius: 14px; border: 1px solid color-mix(in oklab, var(--ink) 12%, transparent); background: color-mix(in oklab, var(--ink) 3%, transparent); max-width: 380px; }
.faq-help span { color: var(--muted); }
.faq-help .link { justify-self: start; margin-top: var(--s-2); }
.faq-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.faq-card { display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: var(--s-4); padding: var(--s-5) var(--s-6); border-radius: 14px; border: 1px solid color-mix(in oklab, var(--ink) 10%, transparent); background: color-mix(in oklab, var(--ink) 2%, transparent); transition: border-color .2s var(--ease), background-color .2s var(--ease); }
.faq-card:hover { border-color: color-mix(in oklab, var(--ink) 22%, transparent); background: color-mix(in oklab, var(--ink) 4%, transparent); }
.faq-card__n { font: 500 13px/1.9 var(--font-mono); color: var(--muted); }
.faq-card h3 { margin: 0 0 6px; font: 500 var(--t-lead)/1.35 var(--font-text); letter-spacing: -0.01em; }
.faq-card p { margin: 0; color: var(--muted); max-width: 62ch; }
@media (max-width: 1023px) { .faq-list { grid-column: 1 / -1; margin-top: var(--s-6); } #faq .faq-intro { grid-column: 1 / -1; } }
@media (max-width: 639px) { .faq-card { grid-template-columns: 1fr; gap: var(--s-2); padding: var(--s-4); } }

/* closing and footer */
.site-foot { border-top: 1px solid color-mix(in oklab, var(--ink) 9%, transparent); }
.site-foot > .wrap { display: grid; align-content: space-between; gap: var(--s-9, 72px); }
.cta-panel { position: relative; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: var(--s-7); padding: clamp(28px, 5vw, 64px); border-radius: 24px; border: 1px solid color-mix(in oklab, var(--ink) 12%, transparent); background: color-mix(in oklab, var(--ink) 3%, var(--bg)); isolation: isolate; }
.cta-panel { isolation: isolate; }
/* a blue glow where the glass is brightest */
.cta-panel::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(55% 90% at 88% 10%, rgb(59 108 246 / .28), transparent 70%), radial-gradient(40% 60% at 70% 100%, rgb(59 108 246 / .12), transparent 70%); }
/* the diagonal fluted glass: a big tilted layer clipped by the panel, strongest on the right */
.cta-panel__glass { position: absolute; inset: 0; z-index: -2; overflow: hidden; pointer-events: none;
  -webkit-mask-image: linear-gradient(100deg, transparent 18%, rgb(0 0 0 / .55) 45%, #000 75%); mask-image: linear-gradient(100deg, transparent 18%, rgb(0 0 0 / .55) 45%, #000 75%); }
.cta-panel__flutes { position: absolute; left: -25%; top: -90%; width: 150%; height: 280%; rotate: -28deg;
  background: repeating-linear-gradient(90deg, color-mix(in oklab, var(--ink) 8%, transparent) 0 2px, transparent 2px 14px, rgb(0 0 0 / .25) 14px 18px), linear-gradient(180deg, color-mix(in oklab, var(--ink) 10%, var(--bg)), var(--bg)); }
.cta-panel__flutes > .ui-pause { display: none !important; }
.cta-panel > :not(.cta-panel__glass) { position: relative; }
/* narrow: the words fill the width, so the glass rises from the bottom-right corner behind the buttons */
@media (max-width: 1023px) { .cta-panel__glass { -webkit-mask-image: linear-gradient(160deg, transparent 35%, rgb(0 0 0 / .6) 68%, #000 95%); mask-image: linear-gradient(160deg, transparent 35%, rgb(0 0 0 / .6) 68%, #000 95%); } }
.cta-panel h2 { margin: 0; font-size: clamp(36px, 4.6vw, 64px); line-height: 1.02; letter-spacing: -0.035em; max-width: 14ch; }
.cta-panel__text { display: grid; gap: var(--s-5); }
.cta-panel__text .t-lead { margin: 0; max-width: 46ch; }
.cta-panel__facts { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; margin: 0; padding: 0; }
.cta-panel__facts li { padding: 5px 12px; border-radius: 99px; border: 1px solid color-mix(in oklab, var(--ink) 14%, transparent); font-size: 13px; color: var(--muted); }
.cta-panel__actions { display: flex; flex-wrap: wrap; gap: 12px; }
.site-foot__grid { display: grid; grid-template-columns: minmax(0, 2fr) repeat(3, minmax(0, 1fr)); gap: var(--s-7); }
.site-foot__brand { display: grid; align-content: start; gap: var(--s-4); }
.site-foot__brand p { margin: 0; color: var(--muted); max-width: 40ch; }
.site-foot__works { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 13px; }
.site-foot__works span { margin-left: 4px; }
.site-foot__col h3 { margin: 0 0 var(--s-4); font: 500 13px/1.4 var(--font-text); letter-spacing: 0; color: var(--muted); }
.site-foot__col ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.site-foot__col a { color: var(--ink); text-decoration: none; opacity: .85; transition: opacity .2s var(--ease); }
.site-foot__col a:hover { opacity: 1; text-decoration: underline; text-underline-offset: 4px; }
.site-foot__legal { display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--s-3) var(--s-6); padding-top: var(--s-5); border-top: 1px solid color-mix(in oklab, var(--ink) 9%, transparent); font-size: 13px; color: var(--muted); }
.site-foot__legal a { color: inherit; text-decoration: none; }
.site-foot__legal a:hover { color: var(--ink); }
@media (max-width: 1023px) { .cta-panel { grid-template-columns: 1fr; align-items: start; } .site-foot__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } .site-foot__brand { grid-column: 1 / -1; } }
@media (max-width: 639px) { .site-foot__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }  .site-foot__legal { flex-direction: column; } }

/* buttons, compact: 30 in the nav, 34 in the page, 36 for the closing pair (the kit's are 44, its large one 64-72) */
:root { --btn-h: 34px; --btn-h-sm: 30px; }
.btn { font-size: 14px; font-weight: 500; padding-inline: 14px; letter-spacing: 0; border-radius: 8px; }
/* the brand's one action colour: a blue gradient with a light top edge and a soft glow (as in the dashboard) */
html .btn.btn--primary {
  background: linear-gradient(180deg, #5a86ff, #2d5cf0); color: #fff; border: 1px solid rgb(255 255 255 / .18);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .3), 0 8px 22px -10px rgb(45 92 240 / .85);
}
html .btn.btn--primary:hover { background: linear-gradient(180deg, #6b93ff, #3566f5); }
html .btn.btn--primary:active { background: linear-gradient(180deg, #4b78f8, #2654e6); }
/* the same blue inside the product mockups (the switch that just turned on, the file being read, the selected
   row, status dots); set on the mockup itself, so the fluted-glass grounds around them keep their grey */
.ui { --fx-accent: #3b6cf6; --fx-accent-ink: #fff; }
.nav__actions .btn { height: 30px; padding-inline: 12px; font-size: 13px; }
.btn--xl, .btn--xl.btn--wide { width: auto; height: 36px; padding-inline: 16px; font: 500 14px/1 var(--font-text); letter-spacing: 0; justify-content: center; }
.theme-btn { width: 30px; height: 30px; }
.theme-btn svg { width: 15px; height: 15px; }
@media (max-width: 1023px) { .theme-btn, .nav__toggle { width: 32px; height: 32px; } .nav__toggle svg { width: 16px; height: 16px; } }
@media (max-width: 639px) {
  .nav:not(.is-open) .nav__actions .btn { height: 32px; padding-inline: 12px; font-size: 13px; }
  .hero .btn-row { display: flex; flex-direction: row; flex-wrap: nowrap; gap: 8px; }
  .hero .btn-row .btn { flex: 1 1 0; width: auto; min-width: 0; height: 36px; padding-inline: 12px; }
  .cta-panel__actions .btn, .cta-panel__actions .btn--xl { flex: 1 1 0; width: auto; min-width: 0; height: 36px; padding-inline: 12px; }
  .nav.is-open .nav__actions .btn { height: 36px; }
}

/* ------------------------------------------------------------ staged hero
   "SEND" + a "your CV" sticker as the headline, a phone running a campaign on a fluted-glass arch, stickers around it,
   a wavy ribbon at the foot; the next section ("Sound familiar?") is where the phone lands on wide screens.
   Black and grey with one blue accent. Entrances are transform-only, so nothing waits at opacity 0. */
.hstage, .pain {
  --hs-accent: #3b6cf6; --hs-accent-ink: #fff;
  --hs-accent-bg: linear-gradient(180deg, #5a86ff, #2d5cf0);
  --hs-accent-glow: inset 0 1px 0 rgb(255 255 255 / .32), 0 12px 30px -12px rgb(45 92 240 / .85);
  --hs-card: color-mix(in oklab, var(--ink) 5%, var(--bg));
  --hs-line: color-mix(in oklab, var(--ink) 12%, transparent);
  --hs-pop: color-mix(in oklab, var(--ink) 90%, var(--bg));
  /* the hero has its own tone; every other section sits on the page background */
  --hs-hero: color-mix(in oklab, var(--ink) 5%, var(--bg));
}
.hstage { position: relative; z-index: 2; overflow-x: clip; overflow-y: visible; padding-bottom: 0; background-color: var(--hs-hero); }
/* the kit's .wrap is z-index 1: unset here so word, arch, ribbon, phone and stickers layer in one order */
main > .hstage > .wrap.hstage__wrap { z-index: auto; }
.hstage__grid {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background-image: linear-gradient(var(--hs-line) 1px, transparent 1px), linear-gradient(90deg, var(--hs-line) 1px, transparent 1px);
  background-size: 56px 56px; background-position: center top; opacity: .5;
  -webkit-mask-image: linear-gradient(#000 60%, transparent); mask-image: linear-gradient(#000 60%, transparent);
}
.hstage__title { margin: 0; }
.hstage__word { display: block; font: 800 clamp(96px, 30vw, 230px)/.78 var(--font-display); letter-spacing: -.07em; text-transform: uppercase; color: var(--ink); text-align: center; }

/* the sticker word: a blue label with white italic words and a soft glow */
.hstage__sticker { display: inline-block; rotate: -5deg; text-transform: none; letter-spacing: 0; }
.hstage__sticker > span {
  display: inline-block; padding: .04em .34em .14em; border-radius: .4em; white-space: nowrap;
  font: italic 400 clamp(46px, 12vw, 76px)/1 var(--font-sticker); color: var(--hs-accent-ink);
  background: var(--hs-accent-bg); border: 1px solid rgb(255 255 255 / .2); box-shadow: var(--hs-accent-glow);
}
.hstage__sticker--sm { rotate: -3deg; margin-left: .1em; vertical-align: baseline; }
.hstage__sticker--sm > span { font-size: 1em; padding: .02em .3em .1em; }

/* the arch behind the phone: the fluted-glass ground; until the effect draws, CSS flutes stand in */
.hstage__arch {
  position: absolute; z-index: -1; left: 50%; width: 380px; margin-left: -190px; top: 22%; bottom: -80px;
  overflow: hidden; border-radius: 999px 999px 0 0; box-shadow: inset 0 0 0 1px var(--hs-line);
  background:
    repeating-linear-gradient(90deg, color-mix(in oklab, var(--ink) 7%, transparent) 0 2px, transparent 2px 13px, rgb(0 0 0 / .22) 13px 16px),
    linear-gradient(180deg, color-mix(in oklab, var(--ink) 14%, var(--bg)), color-mix(in oklab, var(--ink) 5%, var(--bg)));
}
.hstage__center { isolation: isolate; }
/* the arch moves slowly and stops under reduced motion; the kit's floating pause button has no place to sit here */
.hstage__arch > .ui-pause { display: none !important; }

/* the phone */
.hs-phone {
  width: 300px; aspect-ratio: 300 / 620; margin-inline: auto; padding: 10px; border-radius: 48px;
  background: linear-gradient(150deg, #3d3d3d, #0e0e0e 60%);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / .14), 0 0 0 2px #0a0a0a, 0 50px 90px -30px rgb(0 0 0 / .75);
}
.hs-phone__screen {
  height: 100%; border-radius: 38px; overflow: hidden; padding: 12px 16px 16px; display: flex; flex-direction: column; gap: 12px;
  background: var(--bg); color: var(--ink); font: 400 13px/1.35 var(--font-text); text-align: left;
}
.hs-phone__status { display: flex; align-items: center; justify-content: space-between; height: 28px; padding: 0 8px; font-size: 12px; font-weight: 600; }
.hs-phone__island { width: 86px; height: 26px; border-radius: 99px; background: #000; }
.hs-phone__bat { width: 22px; height: 11px; border-radius: 3px; border: 1.5px solid currentColor; opacity: .7; }
.hs-app__head { display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; align-items: center; gap: 10px; }
.hs-app__mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: var(--ink); color: var(--bg); }
.hs-app__mark svg { width: 16px; height: 16px; }
.hs-app__head b { display: block; font-size: 14px; font-weight: 600; }
.hs-app__head small, .hs-stats small, .hs-chart small, .hs-tiles small, .hs-row small { display: block; font-size: 11px; color: var(--muted); }
.hs-live { display: inline-flex; align-items: center; gap: 6px; padding: 4px 9px; border-radius: 99px; border: 1px solid var(--hs-line); font-size: 11px; font-weight: 500; }
.hs-live i { position: relative; width: 6px; height: 6px; border-radius: 50%; background: var(--hs-accent); }
.hs-live i::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: var(--hs-accent); animation: hs-ring 1.8s ease-out infinite; }
.hs-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.hs-stats > div, .hs-tiles > div { padding: 9px 10px; border-radius: 12px; background: var(--hs-card); border: 1px solid var(--hs-line); }
.hs-stats b { display: block; margin-top: 2px; font-size: 20px; font-weight: 600; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.hs-stats > .is-accent { background: var(--hs-accent-bg); border-color: transparent; color: var(--hs-accent-ink); box-shadow: var(--hs-accent-glow); }
.hs-stats > .is-accent small { color: rgb(255 255 255 / .75); }
.hs-chart { padding: 10px 12px 8px; border-radius: 14px; background: var(--hs-card); border: 1px solid var(--hs-line); }
.hs-chart__head { display: flex; justify-content: space-between; }
.hs-chart__up { color: var(--ink) !important; font-weight: 600; }
.hs-area { display: block; width: 100%; height: 72px; margin-top: 6px; overflow: visible; }
.hs-area__fill { fill: color-mix(in oklab, var(--hs-accent) 55%, transparent); animation: hs-fade 1s 2s linear both; }
.hs-area__line { fill: none; stroke: var(--ink); stroke-width: 2; vector-effect: non-scaling-stroke; stroke-dasharray: 400; stroke-dashoffset: 0; animation: hs-draw 2.4s .6s cubic-bezier(.6, .1, .2, 1) both; }
.hs-area__dot { fill: var(--ink); }
.hs-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.hs-tiles b { display: block; margin-top: 2px; font-size: 16px; font-weight: 600; }
.hs-tiles > .is-ink { background: var(--ink); color: var(--bg); border-color: transparent; }
.hs-tiles > .is-ink small { color: color-mix(in oklab, var(--bg) 65%, transparent); }
.hs-list { display: grid; }
.hs-row { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 7px 0; border-top: 1px solid var(--hs-line); }
.hs-row:first-child { border-top: 0; }
.hs-row b { display: block; font-size: 13px; font-weight: 500; }
.hs-av { display: grid; place-items: center; width: 28px; height: 28px; flex: none; border-radius: 50%; background: var(--hs-card); border: 1px solid var(--hs-line); font-size: 10px; font-weight: 600; color: var(--ink); }
.hs-row em { font-style: normal; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 99px; border: 1px solid var(--hs-line); color: var(--muted); }
.hs-row em.is-accent { background: var(--hs-accent-bg); border-color: transparent; color: var(--hs-accent-ink); }

/* the Sent number counts up */
@property --hs-n { syntax: "<integer>"; inherits: false; initial-value: 86; }
.hs-count { font-size: 0 !important; }
.hs-count::after { font-size: 20px; counter-reset: hsn var(--hs-n); content: counter(hsn); animation: hs-count 1.8s .5s cubic-bezier(.2, .7, .2, 1) both; }

/* stickers: the outer element drifts with the scroll, the inner one tilts, pops in and floats */
.hs-stick { z-index: 5; }
.hs-stick__in {
  display: inline-flex; align-items: center; gap: 8px; padding: 11px 16px; border-radius: 14px; white-space: nowrap;
  font: 700 16px/1 var(--font-text); letter-spacing: -.01em;
  background: var(--hs-pop); color: var(--bg); border: 2px solid #0a0a0a; box-shadow: 4px 5px 0 #0a0a0a;
  rotate: var(--r, -4deg);
  animation: hs-pop .6s cubic-bezier(.3, 1.5, .5, 1) both, hs-float 5s ease-in-out infinite;
  animation-delay: var(--d, .75s), calc(var(--d, .75s) + .65s);
}
.hs-stick__in.is-accent { background: var(--hs-accent-bg); color: var(--hs-accent-ink); border-color: rgb(255 255 255 / .2); box-shadow: var(--hs-accent-glow); }
.hs-stick__in svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.hs-stick__in img { width: 18px; height: 18px; }
.hs-stick--a .hs-stick__in { --r: -7deg; --d: .75s; }
.hs-stick--b .hs-stick__in { --r: 8deg; --d: .82s; }
.hs-stick--c .hs-stick__in { --r: -5deg; --d: .89s; }
.hs-stick--e .hs-stick__in { --r: -3deg; --d: 1s; }
.hs-reply {
  display: grid; gap: 8px; width: 260px; white-space: normal; padding: 12px 14px; border-radius: 16px 16px 16px 4px;
  background: var(--bg); color: var(--ink); font: 400 14px/1.4 var(--font-text); letter-spacing: 0;
  border: 2px solid var(--hs-pop); box-shadow: 4px 5px 0 var(--hs-pop);
}
.hs-reply__head { display: grid; grid-template-columns: 28px minmax(0, 1fr); align-items: center; gap: 8px; }
.hs-reply__head b { display: block; font-size: 13px; font-weight: 600; }
.hs-reply__head small { display: block; font-size: 11px; color: var(--muted); }

/* foot of the hero: proof on the left, the pitch on the right */
.hstage__faces { display: inline-flex; padding-left: 8px; }
.hstage__faces i {
  display: grid; place-items: center; width: 36px; height: 36px; margin-left: -8px; border-radius: 50%; font: normal 600 11px/1 var(--font-text);
  background: var(--hs-card); color: var(--ink); border: 2px solid var(--bg); box-shadow: 0 0 0 1px var(--hs-line);
}
.hstage__faces i:nth-child(2) { background: var(--hs-accent-bg); color: var(--hs-accent-ink); }
.hstage__faces i:nth-child(4) { background: var(--ink); color: var(--bg); }
.hstage__proof p { margin: 10px 0 0; font-size: 15px; line-height: 1.45; color: var(--muted); max-width: 24ch; }
.hstage__proof b { color: var(--ink); font-weight: 600; }
.hstage__pitch { display: grid; gap: 18px; }
.hstage .hero__lead { margin: 0; font-size: 17px; line-height: 1.5; color: var(--ink); max-width: 36ch; }
.hstage .btn-row { display: flex; flex-wrap: wrap; gap: 10px; }
.hstage__play { gap: 10px; padding-left: 6px !important; }
.hstage__play-dot { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--ink); color: var(--bg); }
.hstage__play-dot svg { width: 10px; height: 10px; fill: currentColor; }

/* the ribbon */
.hstage__ribbon { display: block; width: 100%; height: 190px; pointer-events: none; position: relative; z-index: 2; }
.hstage__ribbon-fill { fill: var(--bg); }
.hstage__ribbon-band { fill: none; stroke: var(--ink); stroke-width: 56; }
.hstage__ribbon-text { fill: var(--bg); font: 800 20px var(--font-display); letter-spacing: .04em; }
.hstage__ribbon-text .is-star { fill: var(--hs-accent); }
.hstage__ribbon-text .is-serif { font-family: var(--font-sticker); font-style: italic; font-weight: 400; font-size: 26px; letter-spacing: 0; }

/* entrance */
/* motion, measured from the reference hero: entrance on load, then small idle loops */
.hstage__word { animation: hs-word-clip 1s .1s cubic-bezier(.7, 0, .2, 1) both, hs-word-rise 1s .1s cubic-bezier(.16, 1, .3, 1) both; }
.hstage__arch { transform-origin: 50% 100%; animation: hs-arch .9s .25s cubic-bezier(.16, 1, .3, 1) both; }
.hs-phone { animation: hs-phone 1s .35s cubic-bezier(.2, .9, .25, 1.05) both, hs-sway 6s 1.35s ease-in-out infinite; }
.hstage__title .hstage__sticker { animation: hs-pop .7s .9s cubic-bezier(.3, 1.5, .5, 1) both; }
.hstage__title .hstage__sticker > span { animation: hs-wobble 3.2s 1.6s ease-in-out infinite; }
.hstage__pitch, .hstage__proof, .hs-stick--e .hs-stick__in { animation: hs-blur 1.1s .5s cubic-bezier(.16, 1, .3, 1) both; }
.hstage__ribbon { animation: hs-ribbon .8s .4s cubic-bezier(.16, 1, .3, 1) both; }
.hstage__grid { animation: hs-grid 18s linear infinite; }
.hstage__faces i { animation: hs-bob 2.8s ease-in-out infinite; }
.hstage__faces i:nth-child(2) { animation-delay: .15s; } .hstage__faces i:nth-child(3) { animation-delay: .3s; }
.hstage__faces i:nth-child(4) { animation-delay: .45s; } .hstage__faces i:nth-child(5) { animation-delay: .6s; }
.hs-chart__up { display: inline-block; animation: hs-pulse 2.4s 3s linear infinite; }
.pain__think > span { animation: hs-sway-emoji 4s ease-in-out infinite; }
@keyframes hs-word-clip { from { clip-path: inset(100% -10% -20%); } to { clip-path: inset(-30% -10% -20%); } }
@keyframes hs-word-rise { from { transform: translateY(45%); } }
@keyframes hs-arch { from { transform: scaleY(0); } }
@keyframes hs-phone { from { translate: 0 160px; opacity: 0; scale: .85; } }
@keyframes hs-sway { 0%, 100% { transform: rotate(-6deg) translateY(0); } 50% { transform: rotate(-4deg) translateY(-12px); } }
@keyframes hs-pop { 0% { opacity: 0; scale: .3; } 60% { opacity: 1; scale: 1.07; } 100% { opacity: 1; scale: 1; } }
@keyframes hs-wobble { 0%, 100% { rotate: -2.5deg; } 50% { rotate: 2.5deg; } }
@keyframes hs-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -10px; } }
@keyframes hs-blur { from { filter: blur(10px); opacity: 0; transform: translateY(24px); } }
@keyframes hs-ribbon { from { transform: translateY(40px); opacity: 0; } }
@keyframes hs-grid { to { background-position: 56px 56px, 56px 56px; } }
@keyframes hs-bob { 0%, 60%, 100% { transform: none; } 30% { transform: translateY(-8px); } }
@keyframes hs-pulse { 0%, 70%, 100% { transform: none; } 80% { transform: scale(1.15); } }
@keyframes hs-sway-emoji { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
@keyframes hs-draw { from { stroke-dashoffset: 400; } }
@keyframes hs-fade { from { opacity: 0; } }
@keyframes hs-count { from { --hs-n: 0; } to { --hs-n: 86; } }
@keyframes hs-ring { from { transform: scale(1); opacity: .7; } to { transform: scale(2.2); opacity: 0; } }

/* ---- the next section: where the phone lands */
/* main > .section.pain: outranks the kit's one-screen section height and padding */
main > .section.pain { position: relative; height: auto; overflow-x: clip; padding-top: 140px; padding-bottom: 96px; }
main > .section.pain > .wrap.pain__wrap { display: grid; justify-items: center; text-align: center; height: auto; }
.pain__tag { justify-self: center; width: max-content; display: inline-block; padding: 7px 12px; border-radius: 6px; rotate: -3deg; background: var(--hs-accent-bg); color: var(--hs-accent-ink); box-shadow: var(--hs-accent-glow); font: 700 12px/1 var(--font-text); letter-spacing: .08em; text-transform: uppercase; }
.pain__title { margin: 18px 0 0; max-width: 18ch; font: 800 clamp(40px, 5.4vw, 80px)/.95 var(--font-display); letter-spacing: -.055em; text-transform: uppercase; text-wrap: balance; }
.pain__lead { margin: 20px auto 0; max-width: 62ch; font-size: 17px; line-height: 1.55; color: var(--muted); }
.pain__lead b { color: var(--ink); font-weight: 600; }
.pain__stage { position: relative; width: 100%; margin-top: 36px; display: grid; gap: 16px; justify-items: center; }
.pain__slot { display: none; }
.pain-card {
  margin: 0; width: min(100%, 320px); padding: 16px 18px; text-align: left; border-radius: 16px;
  background: var(--bg); border: 2px solid var(--hs-pop); box-shadow: 5px 6px 0 var(--hs-pop);
}
.pain-card blockquote { margin: 0; font: 600 17px/1.3 var(--font-text); letter-spacing: -.01em; color: var(--ink); }
.pain-card figcaption { margin-top: 6px; font-size: 13px; color: var(--muted); }
.pain-card--a { rotate: 3deg; } .pain-card--b { rotate: -2deg; } .pain-card--c { rotate: 2deg; } .pain-card--d { rotate: -3deg; }
.pain__think { display: none; }

/* ---- wide screens: the staged composition */
@media (min-width: 1200px) {
  main > section.hero.hstage { height: max(100svh, 820px); display: flex; flex-direction: column; }
  .hstage__wrap { flex: 1; display: flex; flex-direction: column; }
  .hstage__stage { position: relative; flex: 1; min-height: 640px; }
  .hstage__title { position: absolute; inset: 0; pointer-events: none; }
  .hstage__word { position: absolute; left: -10%; right: -10%; top: 1%; z-index: 0; font-size: clamp(190px, 28vw, 450px); }
  .hstage__title .hstage__sticker { position: absolute; right: 4%; top: 36%; z-index: 6; }
  .hstage__title .hstage__sticker > span { font-size: clamp(56px, 5.2vw, 84px); }
  .hstage__arch { width: 470px; margin-left: -235px; top: 12%; bottom: 0; clip-path: inset(0 0 var(--hs-arch-cut, 0px) 0); }
  /* no stacking context here, so the arch (1) sits under the ribbon (2) and the phone (3) over it */
  .hstage__center { position: absolute; left: 50%; top: 15%; width: 300px; margin-left: -150px; isolation: auto; }
  .hstage__arch { z-index: 1; }
  .hs-fly { position: relative; z-index: 3; }
  .hs-stick { position: absolute; }
  .hs-stick--a { top: 2%; left: 45%; }
  .hs-stick--b { top: 13%; right: 0; }
  .hs-stick--c { top: 6%; left: 6%; }
  .hs-stick--e { top: 37%; left: 13%; }
  .hstage__proof { position: absolute; left: 0; bottom: 20%; z-index: 4; }
  .hstage__pitch { position: absolute; right: 0; bottom: 20%; width: min(380px, calc(50% - 205px)); z-index: 4; }
  .hstage__ribbon { position: absolute; left: 0; bottom: 0; }

  /* open space under the ribbon: the phone flies through it before the heading arrives, as in the reference */
  main > .section.pain { padding-top: 150px; min-height: 100svh; }
  .pain__stage { display: block; height: 560px; max-width: 1180px; margin-top: 32px; }
  .pain-card { position: absolute; }
  .pain-card--a { left: 1%; top: 2%; } .pain-card--b { right: 0; top: 20%; }
  .pain-card--c { left: 6%; top: 52%; } .pain-card--d { right: 2%; top: 66%; }
  .pain__think { display: grid; position: absolute; right: 2%; top: -300px; place-items: center; }
  .pain__think > span { display: grid; place-items: center; width: 78px; height: 78px; border-radius: 50%; font-size: 36px; background: var(--bg); border: 2px solid var(--hs-pop); box-shadow: 4px 5px 0 var(--hs-pop); }
  .pain__think i { position: absolute; border-radius: 50%; background: var(--bg); border: 2px solid var(--hs-pop); }
  .pain__think i:nth-of-type(1) { width: 18px; height: 18px; left: -14px; bottom: -12px; }
  .pain__think i:nth-of-type(2) { width: 10px; height: 10px; left: -30px; bottom: -26px; }
}

/* scroll, wide screens: the phone travels into the next section on the reference's measured curve. It lags at
   first, then swoops down while shrinking to 80% and straightening its -6deg tilt (the sway holds -6 at rest). */
@supports (animation-timeline: scroll()) {
  @media (min-width: 1200px) and (prefers-reduced-motion: no-preference) {
    .pain__slot { display: block; width: 240px; height: 496px; margin: 0 auto; }
    .hs-fly { transform-origin: 50% 0; animation: hs-travel linear both; animation-timeline: scroll(root); animation-range: 0px max(1px, var(--hs-range, var(--hs-travel, 0px))); }
    @keyframes hs-travel {
      0%   { translate: 0 0;                              rotate: 0deg;   scale: 1; }
      11%  { translate: 0 calc(var(--hs-travel) * .008); rotate: 0deg;   scale: .9995; }
      22%  { translate: 0 calc(var(--hs-travel) * .038); rotate: .2deg;  scale: .993; }
      33%  { translate: 0 calc(var(--hs-travel) * .12);  rotate: .7deg;  scale: .977; }
      44%  { translate: 0 calc(var(--hs-travel) * .277); rotate: 1.6deg; scale: .946; }
      56%  { translate: 0 calc(var(--hs-travel) * .534); rotate: 3.2deg; scale: .895; }
      67%  { translate: 0 calc(var(--hs-travel) * .772); rotate: 4.6deg; scale: .846; }
      78%  { translate: 0 calc(var(--hs-travel) * .913); rotate: 5.4deg; scale: .818; }
      89%  { translate: 0 calc(var(--hs-travel) * .98);  rotate: 5.8deg; scale: .805; }
      100% { translate: 0 var(--hs-travel, 0px);         rotate: 6deg;   scale: .8; }
    }
    .pain-card { animation: hs-card linear both; animation-timeline: view(); animation-range: entry 10% cover 35%; }
    @keyframes hs-card { from { opacity: 0; translate: 0 50px; scale: .9; } }
  }
}

/* ---- tablet and phone: the visual leads, like a poster */
@media (max-width: 1199px) {
  main > section.hero.hstage { height: auto; min-height: 100svh; padding-bottom: 0; }
  main > section.hero.hstage > .wrap.hstage__wrap { height: auto; }
  .hstage__stage { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px 10px; padding-top: 18px; }
  .hstage__title { flex-basis: 100%; display: grid; justify-items: center; }
  .hstage__title .hstage__sticker { margin-top: -.12em; position: relative; z-index: 6; }
  .hs-stick { order: 2; margin-top: 6px; }
  .hs-stick--e { order: 4; flex-basis: 100%; display: flex; justify-content: center; margin-top: 18px; }
  .hstage__center { order: 3; flex-basis: 100%; position: relative; z-index: 3; margin-top: 18px; isolation: isolate; }
  .hstage__arch { bottom: -40px; }
  .hstage__pitch { order: 5; flex-basis: 100%; margin-top: 22px; justify-items: start; }
  .hstage__proof { order: 6; flex-basis: 100%; margin-top: 18px; }
  .hstage__ribbon { height: 150px; margin-top: 8px; }
}
@media (max-width: 639px) {
  .hs-phone { zoom: .9; }
  .hstage__arch { width: 330px; margin-left: -165px; }
  .hs-stick__in { padding: 9px 13px; font-size: 14px; }
  .hstage .btn-row .btn { flex: 1 1 0; }
  main > .section.pain { padding-top: 64px; }
}
@media (prefers-reduced-motion: reduce) {
  .hstage__word, .hstage__title .hstage__sticker, .hstage__title .hstage__sticker > span, .hs-phone, .hstage__arch, .hs-stick__in, .hstage__pitch, .hstage__proof, .hstage__ribbon, .hstage__grid, .hstage__faces i, .hs-chart__up, .pain__think > span, .hs-area__line, .hs-area__fill, .hs-live i::after, .hs-count::after { animation: none !important; }
  .hs-phone { transform: rotate(-6deg); }
}

/* ------------------------------------------------------------ the Free section: a bento with small visuals */
.free-bento { display: grid; gap: 16px; margin-top: var(--s-7); grid-template-columns: 1fr; }
@media (min-width: 900px) { .free-bento { grid-template-columns: 1.15fr 1fr 1fr; } }
.fb {
  --fb-blue: #3b6cf6; position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 14px; padding: 20px 22px;
  border-radius: 18px; border: 1px solid color-mix(in oklab, var(--ink) 12%, transparent); background: color-mix(in oklab, var(--ink) 3%, var(--bg));
  transition: translate .25s cubic-bezier(.2, .7, .2, 1), border-color .25s, box-shadow .25s;
}
.fb::before {
  content: ""; position: absolute; inset: -40% -20% auto auto; width: 70%; aspect-ratio: 1; border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, color-mix(in oklab, var(--fb-blue) 22%, transparent), transparent); opacity: 0; transition: opacity .3s;
}
.fb:hover { translate: 0 -3px; border-color: color-mix(in oklab, var(--fb-blue) 40%, transparent); box-shadow: 0 18px 40px -24px rgb(45 92 240 / .6); }
.fb:hover::before { opacity: 1; }
.fb__tag { font-size: 13px; color: var(--muted); }
.fb__big { display: block; font-size: clamp(30px, 3vw, 42px); line-height: 1; font-weight: 600; letter-spacing: -.035em; color: var(--ink); }
.fb__big small { font-size: .45em; font-weight: 500; color: var(--muted); letter-spacing: 0; margin-left: 4px; }
.fb__note { margin: auto 0 0; font-size: 14px; color: var(--muted); }
/* price: $0 with a stamp, and a receipt that adds up to nothing */
.fb__price { display: flex; align-items: center; gap: 14px; }
.fb__price b { font-size: clamp(52px, 5vw, 72px); line-height: .9; font-weight: 600; letter-spacing: -.05em; color: var(--ink); }
.fb__stamp {
  padding: 5px 12px; border-radius: 10px; rotate: -6deg; font: italic 400 24px/1 var(--font-sticker); color: #fff;
  background: linear-gradient(180deg, #5a86ff, #2d5cf0); border: 1px solid rgb(255 255 255 / .2);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .3), 0 10px 24px -10px rgb(45 92 240 / .9);
  animation: fb-wobble 3.2s ease-in-out infinite;
}
.fb__receipt {
  margin: 0; padding: 12px 14px; list-style: none; border-radius: 12px; background: var(--bg);
  border: 1px dashed color-mix(in oklab, var(--ink) 18%, transparent); font-size: 13px; display: grid; gap: 7px;
}
.fb__receipt li { display: flex; justify-content: space-between; gap: 12px; color: var(--muted); }
.fb__receipt li span:last-child { font-family: var(--font-mono); color: var(--ink); }
.fb__receipt .is-total { margin-top: 3px; padding-top: 9px; border-top: 1px dashed color-mix(in oklab, var(--ink) 18%, transparent); color: var(--ink); font-weight: 600; }
.fb__receipt .is-total span:last-child { color: var(--fb-blue); font-weight: 600; }
/* sends from: a small email, and the reply coming back */
.fb__mail { display: grid; gap: 8px; padding: 12px 14px; border-radius: 12px; background: var(--bg); border: 1px solid color-mix(in oklab, var(--ink) 10%, transparent); font-size: 13px; }
.fb__mail-row { display: grid; grid-template-columns: 38px minmax(0, 1fr); align-items: center; color: var(--muted); }
.fb__chip {
  display: inline-flex; align-items: center; gap: 6px; width: max-content; max-width: 100%; padding: 3px 9px; border-radius: 99px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; background: color-mix(in oklab, var(--ink) 6%, transparent); color: var(--ink);
}
.fb__mail-sub { padding-top: 8px; border-top: 1px solid color-mix(in oklab, var(--ink) 8%, transparent); font-weight: 600; color: var(--ink); }
.fb__reply { display: flex; align-items: center; gap: 8px; color: var(--ink); }
.fb__reply i { position: relative; width: 8px; height: 8px; border-radius: 50%; background: var(--fb-blue); }
.fb__reply i::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: var(--fb-blue); animation: hs-ring 1.8s ease-out infinite; }
/* daily limit: a meter that fills as it comes into view, with your own cap marked */
.fb__meter { position: relative; padding-top: 26px; }
.fb__cap {
  position: absolute; top: 0; left: 12%; translate: -50% 0; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600;
  color: #fff; white-space: nowrap; background: linear-gradient(180deg, #5a86ff, #2d5cf0);
}
.fb__cap::after { content: ""; position: absolute; left: 50%; top: 100%; width: 2px; height: 12px; translate: -50% 0; background: var(--fb-blue); }
.fb__bars { display: grid; grid-template-columns: repeat(24, 1fr); gap: 3px; height: 44px; align-items: end; }
.fb__bars i { height: 100%; border-radius: 3px; background: color-mix(in oklab, var(--ink) 10%, transparent); }
.fb__bars i:nth-child(-n+20) { background: var(--ink); opacity: .85; }
.fb__bars i:nth-child(-n+3) { background: var(--fb-blue); opacity: 1; }
.fb__scale { display: flex; justify-content: space-between; margin-top: 6px; font: 11px var(--font-mono); color: var(--muted); }
@keyframes fb-wobble { 0%, 100% { rotate: -6deg; } 50% { rotate: -2deg; } }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .fb__bars { animation: fb-fill linear both; animation-timeline: view(); animation-range: entry 20% cover 45%; }
    @keyframes fb-fill { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
    .fb { animation: fb-in linear both; animation-timeline: view(); animation-range: entry 0% cover 30%; }
    @keyframes fb-in { from { opacity: 0; transform: translateY(40px); } }
  }
}
@media (prefers-reduced-motion: reduce) { .fb__stamp, .fb__reply i::after { animation: none; } }

/* ------------------------------------------------------------ the footer: the page's own language (grid, blue, sticker word)
   footer.closing.site-foot outranks the kit's one-screen rule: the closing panel and the footer take the room they need,
   so the panel is never squeezed and clipped on a short window. */
footer.closing.site-foot { height: auto; min-height: 100svh; position: relative; overflow: clip; padding-bottom: 0; }
footer.closing.site-foot > .wrap { height: auto; }
.cta-panel { flex-shrink: 0; }
/* the hero's grid, fading in from the bottom, under a blue glow */
footer.closing.site-foot::before {
  content: ""; position: absolute; inset: 40% 0 0; z-index: 0; pointer-events: none;
  background-image: linear-gradient(color-mix(in oklab, var(--ink) 7%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--ink) 7%, transparent) 1px, transparent 1px);
  background-size: 56px 56px; background-position: center bottom;
  -webkit-mask-image: linear-gradient(transparent, #000 70%); mask-image: linear-gradient(transparent, #000 70%);
}
footer.closing.site-foot::after {
  content: ""; position: absolute; left: 50%; bottom: -30%; width: 90%; height: 70%; translate: -50% 0; z-index: 0; pointer-events: none;
  background: radial-gradient(closest-side, rgb(59 108 246 / .22), transparent);
}
/* links: blue, with an arrow that slides in */
.site-foot__col h3 { font: 600 11px/1.4 var(--font-text); letter-spacing: .08em; text-transform: uppercase; }
.site-foot__col a { display: inline-flex; align-items: center; gap: 6px; opacity: .8; transition: opacity .2s, color .2s; }
.site-foot__col a::after { content: "↗"; font-size: .8em; opacity: 0; translate: -4px 2px; transition: opacity .2s, translate .2s cubic-bezier(.2, .7, .2, 1); }
.site-foot__col a:hover { opacity: 1; color: #3b6cf6; text-decoration: none; }
html.dark .site-foot__col a:hover { color: #7fa0ff; }
.site-foot__col a:hover::after { opacity: 1; translate: 0 0; }
/* the tools it works with, as small chips */
.site-foot__works img { box-sizing: content-box; padding: 7px; border-radius: 10px; border: 1px solid color-mix(in oklab, var(--ink) 12%, transparent); background: color-mix(in oklab, var(--ink) 4%, var(--bg)); transition: translate .2s; }
.site-foot__works img:hover { translate: 0 -2px; }
/* back to top: a round button that lifts */
.site-foot__legal { position: relative; z-index: 1; align-items: center; }
.site-foot__top { display: inline-flex; align-items: center; gap: 8px; padding: 6px 6px 6px 14px; border-radius: 99px; border: 1px solid color-mix(in oklab, var(--ink) 14%, transparent); transition: border-color .2s, translate .2s; }
.site-foot__top i { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; font-style: normal; color: #fff; background: linear-gradient(180deg, #5a86ff, #2d5cf0); box-shadow: 0 6px 14px -6px rgb(45 92 240 / .8); }
.site-foot__top:hover { translate: 0 -2px; border-color: rgb(59 108 246 / .5); }
/* the giant wordmark at the very bottom, cut by the edge, with the blue sticker word */
.site-foot__mega {
  position: relative; z-index: 1; margin-top: var(--s-7); display: flex; align-items: flex-start; justify-content: center; gap: .1em;
  --hs-accent-ink: #fff; --hs-accent-bg: linear-gradient(180deg, #5a86ff, #2d5cf0);
  --hs-accent-glow: inset 0 1px 0 rgb(255 255 255 / .32), 0 12px 30px -12px rgb(45 92 240 / .85);
  font: 800 clamp(64px, 14.5vw, 250px)/.78 var(--font-display); letter-spacing: -.07em; text-transform: uppercase; white-space: nowrap;
  background: linear-gradient(180deg, color-mix(in oklab, var(--ink) 20%, var(--bg)), color-mix(in oklab, var(--ink) 4%, var(--bg)) 85%);
  -webkit-background-clip: text; background-clip: text; color: transparent; user-select: none; pointer-events: none;
  margin-bottom: -.12em;
}
.site-foot__mega .hstage__sticker { align-self: center; translate: 0 -.1em; font-size: 1rem; letter-spacing: 0; animation: fb-wobble 3.2s ease-in-out infinite; }
.site-foot__mega .hstage__sticker > span { font-size: clamp(30px, 4.2vw, 64px); }
@media (prefers-reduced-motion: reduce) { .site-foot__mega .hstage__sticker { animation: none; } }
@media (max-width: 639px) { .site-foot__mega { margin-bottom: 0; padding-bottom: 18px; } }
`;
