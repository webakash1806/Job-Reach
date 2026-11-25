import type { Types } from "mongoose";
import { Campaign, Contact, EmailJob } from "./models";

export type Timing = {
  intervalMode: "fixed" | "random";
  intervalSec: number;
  minSec: number;
  maxSec: number;
  dailyCap: number;
  windowStart?: string; // "HH:MM" in the creator's local time, "" = any time
  windowEnd?: string;
  tzOffset: number; // Date#getTimezoneOffset() of the creator, minutes
};

const MIN_GAP_SEC = 10;

function gapMs(t: Timing) {
  if (t.intervalMode === "fixed") return Math.max(MIN_GAP_SEC, t.intervalSec) * 1000;
  const lo = Math.max(MIN_GAP_SEC, Math.min(t.minSec, t.maxSec));
  const hi = Math.max(lo, t.maxSec);
  return Math.round((lo + Math.random() * (hi - lo)) * 1000);
}

function toMinutes(hhmm?: string) {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** "Local" clock of the campaign creator, represented as a UTC Date for easy math. */
const toLocal = (d: Date, off: number) => new Date(d.getTime() - off * 60000);
const fromLocal = (d: Date, off: number) => new Date(d.getTime() + off * 60000);
const dayKey = (local: Date) => local.toISOString().slice(0, 10);

/** Moves a time forward into the allowed window / next day with free capacity. */
function fit(t: Date, timing: Timing, perDay: Map<string, number>) {
  const ws = toMinutes(timing.windowStart);
  const we = toMinutes(timing.windowEnd);
  let local = toLocal(t, timing.tzOffset);
  for (let guard = 0; guard < 400; guard++) {
    const mins = local.getUTCHours() * 60 + local.getUTCMinutes();
    const nextDayStart = () => {
      const n = new Date(local);
      n.setUTCDate(n.getUTCDate() + 1);
      n.setUTCHours(ws !== null ? Math.floor(ws / 60) : 0, ws !== null ? ws % 60 : 0, 0, 0);
      // small jitter so day starts do not look robotic
      return new Date(n.getTime() + Math.floor(Math.random() * 5 * 60000));
    };
    if (ws !== null && we !== null && ws < we) {
      if (mins < ws) {
        local.setUTCHours(Math.floor(ws / 60), ws % 60, 0, 0);
        continue;
      }
      if (mins >= we) {
        local = nextDayStart();
        continue;
      }
    }
    if ((perDay.get(dayKey(local)) ?? 0) >= Math.max(1, timing.dailyCap)) {
      local = nextDayStart();
      continue;
    }
    break;
  }
  perDay.set(dayKey(local), (perDay.get(dayKey(local)) ?? 0) + 1);
  return fromLocal(local, timing.tzOffset);
}

/** Returns n send times starting at `start`, spaced by fixed/random gaps, honoring cap + window. */
export function computeTimes(n: number, start: Date, timing: Timing) {
  const out: Date[] = [];
  const perDay = new Map<string, number>();
  let t = new Date(Math.max(start.getTime(), Date.now()));
  for (let i = 0; i < n; i++) {
    if (i > 0) t = new Date(t.getTime() + gapMs(timing));
    t = fit(t, timing, perDay);
    out.push(t);
  }
  return out;
}

/** Contact ids (from the given list) that were already emailed or are already queued. */
export async function alreadyContacted(userId: Types.ObjectId, contactIds: Types.ObjectId[]) {
  const [jobs, contacts] = await Promise.all([
    EmailJob.find({
      userId,
      contactId: { $in: contactIds },
      type: "initial",
      status: { $in: ["pending", "paused", "sending", "sent"] },
    }).distinct("contactId"),
    Contact.find({ userId, _id: { $in: contactIds }, status: { $in: ["sent", "replied", "bounced"] } }).distinct("_id"),
  ]);
  return new Set([...jobs, ...contacts].map(String));
}

/** Re-spreads the remaining jobs of a campaign from now (used on resume). */
export async function rescheduleCampaign(campaignId: Types.ObjectId | string) {
  const c = await Campaign.findById(campaignId);
  if (!c) return;
  const jobs = await EmailJob.find({ campaignId: c._id, status: { $in: ["pending", "paused"] } }).sort({ scheduledAt: 1 });
  const times = computeTimes(jobs.length, new Date(), c as unknown as Timing);
  await EmailJob.bulkWrite(
    jobs.map((j, i) => ({
      updateOne: { filter: { _id: j._id }, update: { $set: { scheduledAt: times[i], status: "pending" } } },
    }))
  );
}
