const $ = (id) => document.getElementById(id);
const FIELDS = ["keywords", "exclude", "mustHave", "timeline", "maxPosts", "scrollDelay", "maxMinutes", "dashboardUrl", "apiKey"];
const DEFAULTS = { exclude: "python, java", timeline: "past-week", maxPosts: 300, scrollDelay: 2500, maxMinutes: 30 };
const msg = (m) => chrome.runtime.sendMessage(m);

// ---------- tabs ----------
document.querySelectorAll(".tabs button").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach((x) => x.classList.toggle("active", x === b));
    document.querySelectorAll(".panel").forEach((p) => (p.hidden = p.id !== "tab-" + b.dataset.tab));
  })
);

// ---------- settings ----------
async function loadSettings() {
  const { settings = {} } = await chrome.storage.local.get("settings");
  const s = { ...DEFAULTS, ...settings };
  FIELDS.forEach((f) => ($(f).value = s[f] ?? ""));
}
async function saveSettings() {
  const { settings = {} } = await chrome.storage.local.get("settings");
  FIELDS.forEach((f) => (settings[f] = $(f).value.trim()));
  await chrome.storage.local.set({ settings });
  return settings;
}
FIELDS.forEach((f) => $(f).addEventListener("change", saveSettings));

$("saveSetup").addEventListener("click", async () => {
  const s = await saveSettings();
  const out = $("setupMsg");
  out.className = "small";
  if (!s.dashboardUrl || !s.apiKey) {
    out.textContent = "Fill in both fields.";
    return;
  }
  out.textContent = "Testing...";
  const ok = await checkConnection();
  out.className = ok ? "small" : "small error";
  out.textContent = $("conn").textContent;
  if (ok) msg({ type: "flush" });
});

async function checkConnection() {
  const { settings = {} } = await chrome.storage.local.get("settings");
  const conn = $("conn");
  if (!settings.dashboardUrl || !settings.apiKey) {
    conn.textContent = "Not connected. Open Setup.";
    conn.className = "muted error";
    return false;
  }
  const r = await msg({ type: "test" });
  conn.textContent = r?.ok ? `Connected as ${r.email}` : `Not connected: ${r?.error || "dashboard unreachable"}`;
  conn.className = r?.ok ? "muted" : "muted error";
  return !!r?.ok;
}

// ---------- run ----------
$("start").addEventListener("click", async () => {
  const s = await saveSettings();
  if (!s.dashboardUrl || !s.apiKey) {
    $("status").textContent = "Tip: set the dashboard URL and API key in Setup. Emails are kept locally until then.";
  }
  const r = await msg({ type: "start" });
  if (r?.error) $("status").textContent = r.error;
});
$("stop").addEventListener("click", () => msg({ type: "stop" }));

function renderRun(run = {}) {
  $("start").hidden = !!run.active;
  $("stop").hidden = !run.active;
  $("state").textContent = run.active ? "Running" : "Idle";
  $("state").classList.toggle("on", !!run.active);
  $("sScanned").textContent = run.scanned || 0;
  $("sSkipped").textContent = run.skipped || 0;
  $("sNew").textContent = run.newEmails || 0;
  $("sSaved").textContent = run.inserted || 0;
  $("status").textContent = run.status || "";
  $("syncError").textContent = run.syncError ? `Dashboard sync failed: ${run.syncError}. Will retry.` : "";
}

// ---------- found list ----------
function renderFound(found = [], pending = []) {
  $("foundCount").textContent = found.length ? `(${found.length})` : "";
  $("pendingInfo").textContent = pending.length ? `${pending.length} not yet saved to the dashboard` : found.length ? "All saved to the dashboard" : "";
  const ul = $("foundList");
  ul.replaceChildren();
  if (!found.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No emails found yet";
    ul.append(li);
    return;
  }
  for (const f of found.slice(0, 200)) {
    const li = document.createElement("li");
    const e = document.createElement("div");
    e.className = "e";
    e.textContent = f.email;
    const m = document.createElement("div");
    m.className = "m";
    m.textContent = [f.name, f.keyword].filter(Boolean).join(" | ");
    li.append(e, m);
    ul.append(li);
  }
}

$("exportCsv").addEventListener("click", async () => {
  const { found = [] } = await chrome.storage.local.get("found");
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = ["email,name,company,keyword,postUrl,foundAt", ...found.map((f) => [f.email, f.name, f.company, f.keyword, f.postUrl, f.foundAt].map(esc).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `linkedin-emails-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
});
$("resync").addEventListener("click", () => msg({ type: "flush" }));
$("clear").addEventListener("click", async () => {
  if (!confirm("Clear the local list? Emails already saved in the dashboard stay there.")) return;
  await chrome.storage.local.set({ found: [], pending: [] });
});

chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.run) renderRun(changes.run.newValue);
  if (changes.found || changes.pending) {
    const { found, pending } = await chrome.storage.local.get(["found", "pending"]);
    renderFound(found, pending);
  }
});

(async () => {
  await loadSettings();
  $("conn").textContent = "Checking connection...";
  checkConnection();
  const { run, found, pending } = await chrome.storage.local.get(["run", "found", "pending"]);
  renderRun(run);
  renderFound(found, pending);
})();
