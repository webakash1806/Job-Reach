import fs from "node:fs/promises";
import path from "node:path";
import { zipSync, strToU8 } from "fflate";

// Files that make up the unpacked extension (config.json is generated per user).
const FILES = [
  "manifest.json", "background.js", "content.js", "popup.html", "popup.css", "popup.js",
  "icons/icon16.png", "icons/icon32.png", "icons/icon48.png", "icons/icon128.png",
];

/** Finds the extension source: $EXTENSION_DIR, ./extension (Docker), ../extension (local dev). */
export async function extensionDir() {
  const candidates = [process.env.EXTENSION_DIR, path.join(process.cwd(), "extension"), path.join(process.cwd(), "..", "extension")];
  for (const dir of candidates) {
    if (!dir) continue;
    try {
      await fs.access(path.join(dir, "manifest.json"));
      return dir;
    } catch {}
  }
  throw new Error("Extension files not found on the server. Set EXTENSION_DIR.");
}

export async function extensionVersion() {
  const manifest = JSON.parse(await fs.readFile(path.join(await extensionDir(), "manifest.json"), "utf8"));
  return String(manifest.version);
}

/** Builds a zip with manifest.json at the root plus a config.json that auto-connects the extension. */
export async function buildExtensionZip(config: { dashboardUrl: string; apiKey: string; email: string }) {
  const dir = await extensionDir();
  const entries: Record<string, Uint8Array> = {};
  for (const f of FILES) entries[f] = new Uint8Array(await fs.readFile(path.join(dir, f)));
  entries["config.json"] = strToU8(JSON.stringify(config, null, 2));
  entries["README.txt"] = strToU8(
    [
      "LinkedIn Email Collector",
      "",
      "1. Keep this folder somewhere permanent (for example Documents\\job-outreach-extension). Chrome loads it from here.",
      "2. Open chrome://extensions and turn on Developer mode (top right).",
      "3. Click Load unpacked and choose this folder (the one that contains manifest.json).",
      "4. Pin the extension and open it. It connects to your dashboard automatically.",
      "",
      "This folder contains your personal API key. Do not share it.",
    ].join("\r\n")
  );
  return zipSync(entries, { level: 6 });
}
