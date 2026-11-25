import { NextResponse } from "next/server";
import { handler, requireUser } from "@/lib/auth";
import { Contact, EmailJob } from "@/lib/models";

export const GET = handler(async (req: Request) => {
  const user = await requireUser();
  const uid = user._id;
  // Day buckets follow the viewer's timezone (?tz = Date#getTimezoneOffset()).
  const tz = Math.max(-900, Math.min(900, Number(new URL(req.url).searchParams.get("tz")) || 0));
  const DAY = 86400000;
  const localNow = Date.now() - tz * 60000;
  const today = new Date(Math.floor(localNow / DAY) * DAY + tz * 60000);
  const since = new Date(today.getTime() - 13 * DAY);
  const abs = Math.abs(tz);
  const timezone = `${tz <= 0 ? "+" : "-"}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;

  const [byStatus, queued, failedToday, sentToday, perDay, recent] = await Promise.all([
    Contact.aggregate([{ $match: { userId: uid } }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
    EmailJob.countDocuments({ userId: uid, status: { $in: ["pending", "sending"] } }),
    EmailJob.countDocuments({ userId: uid, status: "failed", updatedAt: { $gte: today } }),
    EmailJob.countDocuments({ userId: uid, status: "sent", sentAt: { $gte: today } }),
    EmailJob.aggregate([
      { $match: { userId: uid, status: "sent", sentAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$sentAt", timezone } }, n: { $sum: 1 } } },
    ]),
    Contact.find({ userId: uid }).sort({ createdAt: -1 }).limit(6).select("email name keyword createdAt status").lean(),
  ]);
  const s = Object.fromEntries(byStatus.map((x) => [x._id, x.n])) as Record<string, number>;
  const total = Object.values(s).reduce((a, b) => a + b, 0);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since.getTime() - tz * 60000 + i * DAY).toISOString().slice(0, 10);
    return { day: d.slice(5), sent: perDay.find((p) => p._id === d)?.n ?? 0 };
  });
  return NextResponse.json({
    total,
    new: s.new ?? 0,
    sent: (s.sent ?? 0) + (s.replied ?? 0),
    replied: s.replied ?? 0,
    bounced: s.bounced ?? 0,
    queued,
    failedToday,
    sentToday,
    days,
    recent,
    imap: { enabled: !!user.imap?.enabled, lastCheck: user.lastImapCheck, error: user.lastImapError },
  });
});
