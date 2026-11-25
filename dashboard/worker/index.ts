/**
 * Background worker: sends scheduled emails, queues automatic follow-ups and checks inboxes
 * for replies. Run it next to the web app:  npm run worker
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { connectDB } from "../src/lib/db";
import { Campaign, Contact, EmailJob, User } from "../src/lib/models";
import { sendJob } from "../src/lib/mailer";
import { checkReplies } from "../src/lib/imap";

const SEND_TICK_MS = 15_000;
const FOLLOWUP_TICK_MS = 5 * 60_000;
const IMAP_TICK_MS = 10 * 60_000;
const MIN_GAP_PER_USER_MS = 10_000; // never two emails from the same account closer than this
const MAX_ATTEMPTS = 3;

const log = (...a: unknown[]) => console.log(new Date().toISOString(), ...a);

async function recoverStuck() {
  // a crash mid-send leaves jobs in "sending"; put them back after 5 minutes
  const r = await EmailJob.updateMany(
    { status: "sending", updatedAt: { $lt: new Date(Date.now() - 5 * 60_000) } },
    { status: "pending" }
  );
  if (r.modifiedCount) log(`recovered ${r.modifiedCount} stuck jobs`);
}

async function sendTick() {
  const now = new Date();
  const users = await EmailJob.distinct("userId", { status: "pending", scheduledAt: { $lte: now } });
  for (const userId of users) {
    const user = await User.findById(userId).select("active lastSentAt").lean();
    if (!user?.active) continue;
    if (user.lastSentAt && now.getTime() - new Date(user.lastSentAt).getTime() < MIN_GAP_PER_USER_MS) continue;

    // atomically claim the oldest due job for this user
    const job = await EmailJob.findOneAndUpdate(
      { userId, status: "pending", scheduledAt: { $lte: now } },
      { status: "sending", $inc: { attempts: 1 } },
      { sort: { scheduledAt: 1 }, new: true }
    );
    if (!job) continue;

    if (job.campaignId) {
      const c = await Campaign.findById(job.campaignId).select("status").lean();
      if (c && c.status !== "running") {
        await EmailJob.updateOne({ _id: job._id }, { status: c.status === "paused" ? "paused" : "cancelled", $inc: { attempts: -1 } });
        continue;
      }
    }

    // last line of defence against double sends
    const contact = await Contact.findById(job.contactId).select("status").lean();
    if (!contact) {
      await EmailJob.updateOne({ _id: job._id }, { status: "cancelled", error: "Contact deleted" });
      continue;
    }
    if (job.type === "initial") {
      const dup = await EmailJob.exists({ _id: { $ne: job._id }, contactId: job.contactId, type: "initial", status: "sent" });
      if (dup || contact.status === "replied" || contact.status === "bounced") {
        await EmailJob.updateOne({ _id: job._id }, { status: "cancelled", error: "Already emailed" });
        continue;
      }
    } else if (contact.status === "replied" || contact.status === "bounced") {
      await EmailJob.updateOne({ _id: job._id }, { status: "cancelled", error: `Contact ${contact.status}` });
      continue;
    }

    try {
      await sendJob(String(job._id));
      log(`sent ${job.type} to ${job.to}`);
    } catch (e) {
      const msg = (e as Error).message;
      const permanent = /invalid|not configured|recipient|no such user|does not exist|550|553/i.test(msg);
      const giveUp = permanent || job.attempts >= MAX_ATTEMPTS;
      await EmailJob.updateOne(
        { _id: job._id },
        giveUp
          ? { status: "failed", error: msg }
          : { status: "pending", error: msg, scheduledAt: new Date(Date.now() + job.attempts * 5 * 60_000) }
      );
      if (giveUp && job.type === "initial") await Contact.updateOne({ _id: job.contactId, status: "queued" }, { status: "new" });
      log(`failed ${job.to}: ${msg}${giveUp ? "" : " (will retry)"}`);
    }
  }
}

async function finishCampaigns() {
  const running = await Campaign.find({ status: "running" }).select("_id followUp").lean();
  for (const c of running) {
    const left = await EmailJob.exists({ campaignId: c._id, type: "initial", status: { $in: ["pending", "paused", "sending"] } });
    if (!left && !c.followUp?.enabled) await Campaign.updateOne({ _id: c._id }, { status: "done" });
  }
}

/** For campaigns with auto follow-up: queue a reply for anyone silent for `afterDays`. */
async function followupTick() {
  const campaigns = await Campaign.find({ status: { $in: ["running", "done"] }, "followUp.enabled": true }).lean();
  for (const c of campaigns) {
    const f = c.followUp!;
    if (!f.templateId) continue;
    const before = new Date(Date.now() - f.afterDays * 86400000);
    const contactIds = await EmailJob.distinct("contactId", { campaignId: c._id, type: "initial", status: "sent" });
    const queued = new Set(
      (await EmailJob.distinct("contactId", { contactId: { $in: contactIds }, type: "followup", status: { $in: ["pending", "paused", "sending"] } })).map(String)
    );
    const due = await Contact.find({
      _id: { $in: contactIds },
      status: "sent",
      lastSentAt: { $lte: before },
      followUpCount: { $lt: f.maxCount },
    })
      .select("_id email")
      .lean();
    const list = due.filter((d) => !queued.has(String(d._id)));
    if (!list.length) continue;
    const gap = c.intervalMode === "fixed" ? c.intervalSec : Math.round((c.minSec + c.maxSec) / 2);
    await EmailJob.insertMany(
      list.map((d, i) => ({
        userId: c.userId,
        campaignId: c._id,
        contactId: d._id,
        to: d.email,
        type: "followup",
        templateId: f.templateId,
        resumeId: f.attachResume ? c.resumeId : undefined,
        scheduledAt: new Date(Date.now() + 60_000 + i * Math.max(10, gap) * 1000 * (0.7 + Math.random() * 0.6)),
        status: "pending",
      }))
    );
    log(`queued ${list.length} auto follow-ups for campaign ${c.name}`);
    if (c.status === "done") await Campaign.updateOne({ _id: c._id }, { status: "running" });
  }
  // campaigns whose people all reached max follow-ups or replied can close
  for (const c of campaigns) {
    if (c.status !== "running") continue;
    const left = await EmailJob.exists({ campaignId: c._id, status: { $in: ["pending", "paused", "sending"] } });
    if (left) continue;
    const ids = await EmailJob.distinct("contactId", { campaignId: c._id, type: "initial", status: "sent" });
    const stillOpen = await Contact.exists({ _id: { $in: ids }, status: "sent", followUpCount: { $lt: c.followUp!.maxCount } });
    if (!stillOpen) await Campaign.updateOne({ _id: c._id }, { status: "done" });
  }
}

async function imapTick() {
  const users = await User.find({ active: true, "imap.enabled": true }).select("_id email").lean();
  for (const u of users) {
    try {
      const r = await checkReplies(String(u._id));
      if (r.replies || r.bounces) log(`${u.email}: ${r.replies} replies, ${r.bounces} bounces`);
    } catch (e) {
      const msg = (e as Error).message;
      await User.updateOne({ _id: u._id }, { lastImapError: msg, lastImapCheck: new Date() });
      log(`imap ${u.email}: ${msg}`);
    }
  }
}

function loop(name: string, fn: () => Promise<void>, every: number) {
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      await fn();
    } catch (e) {
      log(`${name} error:`, (e as Error).message);
    } finally {
      running = false;
    }
  };
  run();
  return setInterval(run, every);
}

async function main() {
  await connectDB();
  log("worker started");
  await recoverStuck();
  loop("send", async () => {
    await sendTick();
    await finishCampaigns();
  }, SEND_TICK_MS);
  loop("recover", recoverStuck, 5 * 60_000);
  loop("followups", followupTick, FOLLOWUP_TICK_MS);
  loop("imap", imapTick, IMAP_TICK_MS);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

for (const sig of ["SIGINT", "SIGTERM"] as const) process.on(sig, () => process.exit(0));
