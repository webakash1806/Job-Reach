// Service worker: runs the search queue, stores found emails and syncs them to the dashboard.

// Toolbar icon opens the UI as a side panel (stays open while the LinkedIn tab works), not a popup.
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

const DATE_PARAM = { "past-24h": "past-24h", "past-week": "past-week", "past-month": "past-month" };

function searchUrl(keyword, timeline) {
  // LinkedIn's filter values are JSON lists, e.g. datePosted=["past-week"] (checked Nov 2026)
  const p = new URLSearchParams({ keywords: keyword, origin: "FACETED_SEARCH", sortBy: '["date_posted"]' });
  if (DATE_PARAM[timeline]) p.set("datePosted", `["${DATE_PARAM[timeline]}"]`);
  return `https://www.linkedin.com/search/results/content/?${p.toString()}`;
}

// ---------- auto-setup ----------
// The dashboard's "Download extension" button adds a config.json with the user's dashboard URL
// and API key, so a fresh install (or reload after re-downloading) connects with no typing.
async function applyBundledConfig() {
  try {
    const res = await fetch(chrome.runtime.getURL("config.json"));
    if (!res.ok) return;
    const cfg = await res.json();
    if (!cfg.dashboardUrl || !cfg.apiKey) return;
    const { settings = {} } = await chrome.storage.local.get("settings");
    await chrome.storage.local.set({
      settings: { ...settings, dashboardUrl: cfg.dashboardUrl, apiKey: cfg.apiKey },
      account: cfg.email || "",
    });
    flush();
  } catch {
    // no config.json: the user connects manually in the Setup tab
  }
}
chrome.runtime.onInstalled.addListener(applyBundledConfig);

// A run can't survive Chrome restarting or the extension reloading (its tab is gone),
// but its "active" flag would stay set and hide the Start button. Clear it.
async function clearStaleRun() {
  const { run } = await chrome.storage.local.get("run");
  if (run?.active) await chrome.storage.local.set({ run: { ...run, active: false, status: "Previous run was interrupted. Press Start to run again." } });
}
chrome.runtime.onStartup.addListener(clearStaleRun);
chrome.runtime.onInstalled.addListener(clearStaleRun);

async function getRun() {
  const { run } = await chrome.storage.local.get("run");
  return run || { active: false };
}
async function setRun(patch) {
  const run = { ...(await getRun()), ...patch };
  await chrome.storage.local.set({ run });
  return run;
}

// ---------- dashboard sync ----------
let flushing = false;
async function flush() {
  if (flushing) return;
  flushing = true;
  try {
    const { settings = {}, pending = [] } = await chrome.storage.local.get(["settings", "pending"]);
    if (!pending.length || !settings.dashboardUrl || !settings.apiKey) return;
    const url = settings.dashboardUrl.replace(/\/+$/, "") + "/api/ingest";
    for (let i = 0; i < pending.length; i += 50) {
      const batch = pending.slice(i, i + 50);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": settings.apiKey, "x-extension-version": chrome.runtime.getManifest().version },
        body: JSON.stringify({ items: batch }),
      });
      if (!res.ok) throw new Error(`Dashboard returned ${res.status}`);
      const data = await res.json();
      const run = await getRun();
      await setRun({ synced: (run.synced || 0) + batch.length, inserted: (run.inserted || 0) + (data.inserted || 0), syncError: "" });
      const left = (await chrome.storage.local.get("pending")).pending || [];
      const sent = new Set(batch.map((b) => b.email));
      await chrome.storage.local.set({ pending: left.filter((p) => !sent.has(p.email)) });
    }
  } catch (e) {
    await setRun({ syncError: String(e.message || e) });
  } finally {
    flushing = false;
  }
}

async function addFound(items) {
  const { found = [], pending = [] } = await chrome.storage.local.get(["found", "pending"]);
  const known = new Set(found.map((f) => f.email));
  const fresh = items.filter((i) => !known.has(i.email));
  if (!fresh.length) return 0;
  const stamped = fresh.map((f) => ({ ...f, foundAt: new Date().toISOString() }));
  await chrome.storage.local.set({ found: [...stamped, ...found].slice(0, 20000), pending: [...pending, ...stamped] });
  flush();
  return fresh.length;
}

// ---------- run control ----------
async function startQuery(index) {
  const run = await getRun();
  const { settings } = await chrome.storage.local.get("settings");
  const kw = run.queries[index];
  if (!kw) return finish("Finished all keywords");
  const url = searchUrl(kw, settings.timeline);
  let tabId = run.tabId;
  try {
    if (tabId) await chrome.tabs.update(tabId, { url, active: true });
  } catch {
    tabId = null;
  }
  if (!tabId) tabId = (await chrome.tabs.create({ url, active: true })).id;
  await setRun({ tabId, queryIndex: index, currentKeyword: kw, status: `Searching "${kw}"` });
}

async function finish(status) {
  const run = await getRun();
  if (run.tabId) chrome.tabs.sendMessage(run.tabId, { type: "stop" }).catch(() => {});
  await setRun({ active: false, status, endedAt: Date.now() });
  flush();
}

// inject the scraper once the search page has loaded
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status !== "complete") return;
  const run = await getRun();
  if (!run.active || run.tabId !== tabId) return;
  if (!tab.url?.includes("linkedin.com/search/results/content")) {
    // LinkedIn sent us elsewhere (sign-in page, checkpoint, new search URL): say so instead of waiting forever
    return setRun({ status: `Waiting: LinkedIn opened ${tab.url?.split("?")[0] || "another page"} instead of post search results. Sign in to LinkedIn, then press Start again.` });
  }
  const { settings } = await chrome.storage.local.get("settings");
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
    await chrome.tabs.sendMessage(tabId, { type: "run", settings, keyword: run.currentKeyword, deadline: run.deadline });
  } catch (e) {
    await setRun({ status: "Could not start on this page: " + e.message });
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const run = await getRun();
  if (run.active && run.tabId === tabId) finish("Stopped (tab closed)");
});

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  (async () => {
    if (msg.type === "start") {
      const { settings } = await chrome.storage.local.get("settings");
      const queries = (settings.keywords || "").split(/\n|;/).map((s) => s.trim()).filter(Boolean);
      if (!queries.length) return reply({ error: "Add at least one keyword" });
      await chrome.storage.local.set({
        run: {
          active: true,
          queries,
          queryIndex: 0,
          scanned: 0,
          skipped: 0,
          emails: 0,
          newEmails: 0,
          synced: 0,
          inserted: 0,
          startedAt: Date.now(),
          deadline: Date.now() + (Number(settings.maxMinutes) || 30) * 60000,
          status: "Starting",
        },
      });
      await startQuery(0);
      reply({ ok: true });
    } else if (msg.type === "stop") {
      await finish("Stopped");
      reply({ ok: true });
    } else if (msg.type === "found") {
      const added = await addFound(msg.items);
      const run = await getRun();
      await setRun({ newEmails: (run.newEmails || 0) + added });
      reply({ added });
    } else if (msg.type === "progress") {
      const run = await getRun();
      if (!run.active) return reply({ stop: true });
      await setRun({
        scanned: (run.scanned || 0) + (msg.scannedDelta || 0),
        skipped: (run.skipped || 0) + (msg.skippedDelta || 0),
        emails: (run.emails || 0) + (msg.emailsDelta || 0),
        status: msg.status || run.status,
      });
      reply({ stop: Date.now() > run.deadline });
    } else if (msg.type === "queryDone") {
      const run = await getRun();
      if (!run.active) return reply({});
      if (Date.now() > run.deadline) await finish("Time limit reached");
      else if (run.queryIndex + 1 < run.queries.length) await startQuery(run.queryIndex + 1);
      else await finish(`Done. ${msg.reason || ""}`.trim());
      reply({});
    } else if (msg.type === "flush") {
      await flush();
      reply({ ok: true });
    } else if (msg.type === "test") {
      try {
        const { settings } = await chrome.storage.local.get("settings");
        const res = await fetch(settings.dashboardUrl.replace(/\/+$/, "") + "/api/ingest", { headers: { "x-api-key": settings.apiKey, "x-extension-version": chrome.runtime.getManifest().version } });
        const data = await res.json().catch(() => ({}));
        reply(res.ok ? { ok: true, email: data.email } : { error: data.error || `HTTP ${res.status}` });
      } catch (e) {
        reply({ error: String(e.message || e) });
      }
    }
  })();
  return true; // async reply
});
