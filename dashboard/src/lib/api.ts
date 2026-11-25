// One refresh at a time: parallel 401s (several widgets loading) share the same request.
let refreshing: Promise<boolean> | null = null;
export function refreshSession() {
  refreshing ??= fetch("/api/auth/refresh", { method: "POST" })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => setTimeout(() => (refreshing = null), 0));
  return refreshing;
}

function toLogin() {
  if (typeof window === "undefined") return;
  const next = window.location.pathname + window.location.search;
  window.location.href = next && next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login";
}

// Small client-side fetch helper: JSON in/out, throws with the server's error message.
// An expired access token is refreshed once and the request retried transparently.
export async function api<T = unknown>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const send = () =>
    fetch(path, {
      ...rest,
      headers: json !== undefined ? { "Content-Type": "application/json", ...rest.headers } : rest.headers,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  let res = await send();
  const isAuthCall = path.startsWith("/api/auth/");
  if (res.status === 401 && !isAuthCall) {
    if (await refreshSession()) res = await send();
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !isAuthCall) toLogin();
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

export function fmtDate(d?: string | Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function fmtRelative(d?: string | Date | null) {
  if (!d) return "";
  const diff = new Date(d).getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (abs < 60000) return rtf.format(Math.round(diff / 1000), "second");
  if (abs < 3600000) return rtf.format(Math.round(diff / 60000), "minute");
  if (abs < 86400000) return rtf.format(Math.round(diff / 3600000), "hour");
  return rtf.format(Math.round(diff / 86400000), "day");
}

/** value for <input type="datetime-local"> in the browser's local time */
export function toLocalInput(d: Date) {
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

export const CAMPAIGN_IDS_KEY = "jo.campaignContactIds";
