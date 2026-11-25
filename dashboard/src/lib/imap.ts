import type { Types } from "mongoose";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { decrypt } from "./crypto";
import { Contact, EmailJob, User, type UserDoc } from "./models";

type ImapUser = Pick<UserDoc, "imap" | "smtp">;

export function imapClient(user: ImapUser) {
  const i = user.imap;
  const login = i?.user || user.smtp?.user;
  const pass = i?.passEnc ? decrypt(i.passEnc) : decrypt(user.smtp?.passEnc);
  if (!i?.host || !login || !pass) throw new Error("IMAP is not configured");
  return new ImapFlow({
    host: i.host,
    port: i.port || 993,
    secure: i.secure ?? true,
    auth: { user: login, pass },
    logger: false,
  });
}

const BOUNCE_FROM = /(mailer-daemon|postmaster|mail delivery)/i;

async function markReplied(userId: Types.ObjectId, contactId: Types.ObjectId) {
  await Contact.updateOne({ _id: contactId, userId }, { status: "replied", repliedAt: new Date() });
  await EmailJob.updateMany(
    { contactId, userId, type: "followup", status: { $in: ["pending", "paused"] } },
    { status: "cancelled", error: "Contact replied" }
  );
}

/**
 * Reads new INBOX messages since the last run. A message counts as a reply when its
 * In-Reply-To/References points at one of our sent Message-IDs, or when it comes from a
 * contact we have emailed. Bounces mark the recipient as bounced.
 */
export async function checkReplies(userId: string) {
  const user = await User.findById(userId);
  if (!user?.imap?.enabled) return { checked: 0, replies: 0, bounces: 0 };
  const client = imapClient(user);
  let checked = 0, replies = 0, bounces = 0;
  let maxUid = user.lastImapUid || 0;
  await client.connect();
  const lock = await client.getMailboxLock("INBOX");
  try {
    const since = new Date(Date.now() - 14 * 86400000);
    const range = maxUid > 0 ? { uid: `${maxUid + 1}:*` } : { since };
    for await (const msg of client.fetch(range, { uid: true, envelope: true, source: true }, { uid: true })) {
      if (msg.uid <= (user.lastImapUid || 0)) continue;
      maxUid = Math.max(maxUid, msg.uid);
      checked++;
      const fromAddr = msg.envelope?.from?.[0]?.address?.toLowerCase() || "";
      const fromName = msg.envelope?.from?.[0]?.name || "";
      const parsed = await simpleParser(msg.source as Buffer);
      const refs = [parsed.inReplyTo, ...(Array.isArray(parsed.references) ? parsed.references : [parsed.references])]
        .filter(Boolean) as string[];

      if (BOUNCE_FROM.test(fromAddr) || BOUNCE_FROM.test(fromName)) {
        const text = `${parsed.text || ""}`.toLowerCase();
        const sent = await EmailJob.find({ userId: user._id, status: "sent", sentAt: { $gte: since } }).select("to contactId").lean();
        for (const s of sent) {
          if (text.includes(s.to.toLowerCase())) {
            await Contact.updateOne({ _id: s.contactId }, { status: "bounced" });
            await EmailJob.updateMany({ contactId: s.contactId, status: { $in: ["pending", "paused"] } }, { status: "cancelled", error: "Bounced" });
            bounces++;
          }
        }
        continue;
      }

      let contactId: Types.ObjectId | null = null;
      if (refs.length) {
        const job = await EmailJob.findOne({ userId: user._id, messageId: { $in: refs } }).select("contactId").lean();
        contactId = (job?.contactId as Types.ObjectId) ?? null;
      }
      if (!contactId && fromAddr) {
        const c = await Contact.findOne({ userId: user._id, email: fromAddr, status: { $in: ["sent", "queued"] } }).select("_id").lean();
        contactId = (c?._id as Types.ObjectId) ?? null;
      }
      if (contactId) {
        await markReplied(user._id, contactId);
        replies++;
      }
    }
  } finally {
    lock.release();
    await client.logout().catch(() => {});
  }
  await User.updateOne({ _id: user._id }, { lastImapUid: maxUid, lastImapCheck: new Date(), lastImapError: null });
  return { checked, replies, bounces };
}
