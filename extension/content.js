// Injected into LinkedIn content-search results. Expands posts, extracts emails, auto-scrolls.
(() => {
  if (window.__joCollector) return;
  window.__joCollector = true;

  let stopped = false;
  const seenPosts = new WeakSet();
  const seenEmails = new Set();

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const jitter = (ms) => ms * (0.7 + Math.random() * 0.6);
  const send = (msg) => chrome.runtime.sendMessage(msg).catch(() => ({}));

  // ---------- matching ----------
  const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // "java" must not match "javascript": require non-alphanumeric on both sides.
  function wordRx(list) {
    const words = list.map((w) => w.trim()).filter(Boolean);
    if (!words.length) return null;
    return new RegExp(`(?<![a-z0-9])(?:${words.map(escapeRx).join("|")})(?![a-z0-9])`, "i");
  }
  const splitList = (s) => (s || "").split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

  const EMAIL_RX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
  // "hr [at] company [dot] com", "hr(at)company(dot)com"
  const OBFUSCATED_RX = /([a-z0-9._%+-]+)\s*[\[(]\s*at\s*[\])]\s*([a-z0-9-]+(?:\s*[\[(]\s*dot\s*[\])]\s*[a-z0-9-]+)+)/gi;
  const BAD_TLD = /\.(png|jpe?g|gif|webp|svg|css|js)$/i;
  const BAD_DOMAIN = /(linkedin\.com|licdn\.com|example\.com|sentry\.io|wixpress\.com)$/i;

  function extractEmails(text) {
    const out = new Set();
    for (const m of text.matchAll(OBFUSCATED_RX)) {
      out.add(`${m[1]}@${m[2].replace(/\s*[\[(]\s*dot\s*[\])]\s*/gi, ".")}`);
    }
    for (const m of text.match(EMAIL_RX) || []) out.add(m);
    return [...out]
      .map((e) => e.toLowerCase().replace(/^[._-]+|[._-]+$/g, ""))
      .filter((e) => !BAD_TLD.test(e) && !BAD_DOMAIN.test(e.split("@")[1] || "") && e.length < 120);
  }

  // ---------- DOM ----------
  const POST_SELECTORS = [
    "div.feed-shared-update-v2",
    "div[data-urn*='urn:li:activity']",
    "div[data-id*='urn:li:activity']",
    "li.reusable-search__result-container",
    "div[role='article']",
  ];

  function findPosts() {
    for (const sel of POST_SELECTORS) {
      const list = [...document.querySelectorAll(sel)];
      if (list.length) return list.filter((el) => !list.some((other) => other !== el && other.contains(el)));
    }
    return [];
  }

  async function expand(post) {
    const btns = post.querySelectorAll("button, span[role='button']");
    for (const b of btns) {
      const t = (b.innerText || b.getAttribute("aria-label") || "").trim().toLowerCase();
      if (t === "…more" || t === "...more" || t === "more" || t === "see more" || t.startsWith("…see more") || t.includes("see more")) {
        b.click();
        await sleep(150);
        break;
      }
    }
  }

  function postText(post) {
    const el =
      post.querySelector(".update-components-text") ||
      post.querySelector(".feed-shared-inline-show-more-text") ||
      post.querySelector(".feed-shared-text") ||
      post;
    return (el.innerText || "").trim();
  }

  function postMeta(post) {
    const name =
      post.querySelector(".update-components-actor__title span[aria-hidden='true']")?.innerText ||
      post.querySelector(".update-components-actor__name")?.innerText ||
      post.querySelector("a[href*='/in/'] span[aria-hidden='true']")?.innerText ||
      "";
    const sub = post.querySelector(".update-components-actor__description span[aria-hidden='true']")?.innerText || "";
    const company = (sub.match(/\bat\s+([^|•,]+)/i)?.[1] || "").trim();
    const urn = post.getAttribute("data-urn") || post.getAttribute("data-id") || post.querySelector("[data-urn*='activity']")?.getAttribute("data-urn") || "";
    const postUrl = urn.includes("activity") ? `https://www.linkedin.com/feed/update/${urn}/` : location.href;
    return { name: name.split("\n")[0].trim().slice(0, 120), company: company.slice(0, 120), postUrl };
  }

  function clickShowMoreResults() {
    const b = [...document.querySelectorAll("button")].find((x) => /show more results|load more/i.test(x.innerText || ""));
    if (b && !b.disabled) {
      b.click();
      return true;
    }
    return false;
  }

  // ---------- main loop ----------
  async function run(settings, keyword) {
    const exclude = wordRx(splitList(settings.exclude));
    const mustHave = wordRx(splitList(settings.mustHave));
    const maxPosts = Number(settings.maxPosts) || 300;
    const delay = Math.max(800, Number(settings.scrollDelay) || 2500);
    let scanned = 0;
    let idle = 0;

    await sleep(2500); // let results render

    while (!stopped && scanned < maxPosts) {
      const posts = findPosts().filter((p) => !seenPosts.has(p));
      let scannedDelta = 0, skippedDelta = 0, emailsDelta = 0;
      const items = [];

      for (const post of posts) {
        if (stopped) break;
        seenPosts.add(post);
        await expand(post);
        const text = postText(post);
        if (!text) continue;
        scanned++;
        scannedDelta++;
        if ((exclude && exclude.test(text)) || (mustHave && !mustHave.test(text))) {
          skippedDelta++;
          post.style.outline = "2px dashed rgba(220,38,38,.5)";
          continue;
        }
        const emails = extractEmails(text).filter((e) => !seenEmails.has(e));
        if (!emails.length) continue;
        post.style.outline = "2px solid rgba(16,185,129,.7)";
        const meta = postMeta(post);
        for (const email of emails) {
          seenEmails.add(email);
          emailsDelta++;
          items.push({ email, ...meta, keyword, postSnippet: text.replace(/\s+/g, " ").slice(0, 600) });
        }
      }

      if (items.length) await send({ type: "found", items });
      const r = await send({
        type: "progress",
        scannedDelta,
        skippedDelta,
        emailsDelta,
        status: `"${keyword}": scanned ${scanned} posts`,
      });
      if (r?.stop) break;

      idle = posts.length ? 0 : idle + 1;
      if (idle >= 6) {
        await send({ type: "queryDone", reason: "No more posts." });
        return;
      }

      // scroll like a person: jump to the last post, then a bit further
      const last = findPosts().at(-1);
      if (last) last.scrollIntoView({ behavior: "smooth", block: "end" });
      window.scrollBy({ top: 400 + Math.random() * 500, behavior: "smooth" });
      if (idle >= 2) clickShowMoreResults();
      await sleep(jitter(delay));
    }
    if (!stopped) await send({ type: "queryDone", reason: scanned >= maxPosts ? "Post limit reached." : "" });
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "run") {
      stopped = false;
      run(msg.settings || {}, msg.keyword || "");
    } else if (msg.type === "stop") {
      stopped = true;
    }
  });
})();
