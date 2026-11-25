import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { handler, HttpError, requireUser } from "@/lib/auth";
import { Contact, EmailJob, Resume, Template } from "@/lib/models";
import { TimingBody } from "@/lib/schemas";
import { computeTimes } from "@/lib/scheduler";

// Contacts that were emailed, have not replied or bounced, and have no follow-up queued.
export const GET = handler(async (req: Request) => {
  const user = await requireUser();
  const days = Number(new URL(req.url).searchParams.get("days") ?? 3);
  const before = new Date(Date.now() - Math.max(0, days) * 86400000);
  const queued = await EmailJob.find({ userId: user._id, type: "followup", status: { $in: ["pending", "paused", "sending"] } }).distinct("contactId");
  const contacts = await Contact.find({
    userId: user._id,
    status: "sent",
    lastSentAt: { $lte: before },
    _id: { $nin: queued },
  })
    .sort({ lastSentAt: 1 })
    .limit(3000)
    .lean();
  const firsts = await EmailJob.find({ userId: user._id, type: "initial", status: "sent", contactId: { $in: contacts.map((c) => c._id) } })
    .select("contactId subject sentAt")
    .lean();
  const subj = new Map(firsts.map((f) => [String(f.contactId), f]));
  return NextResponse.json({
    contacts: contacts.map((c) => ({
      ...c,
      subject: subj.get(String(c._id))?.subject ?? "",
      firstSentAt: subj.get(String(c._id))?.sentAt ?? null,
    })),
    pendingFollowups: queued.length,
  });
});

const Body = TimingBody.extend({
  contactIds: z.array(z.string()).min(1),
  templateId: z.string().min(1),
  resumeId: z.string().optional().nullable(),
  startAt: z.coerce.date(),
});

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const b = Body.parse(await req.json());
  const t = await Template.findOne({ _id: b.templateId, userId: user._id });
  if (!t) throw new HttpError(400, "Pick a follow-up template");
  if (b.resumeId && !(await Resume.exists({ _id: b.resumeId, userId: user._id }))) throw new HttpError(400, "CV not found");

  const queued = await EmailJob.find({ userId: user._id, type: "followup", status: { $in: ["pending", "paused", "sending"] } }).distinct("contactId");
  const qset = new Set(queued.map(String));
  // Only people we actually emailed and who have not replied or bounced.
  const contacts = await Contact.find({ userId: user._id, _id: { $in: b.contactIds }, status: "sent" }).select("_id email").lean();
  const list = contacts.filter((c) => !qset.has(String(c._id)));
  if (!list.length) throw new HttpError(400, "None of these contacts can get a follow-up (replied, bounced, not sent yet or already queued)");
  const times = computeTimes(list.length, b.startAt, b);
  await EmailJob.insertMany(
    list.map((c, i) => ({
      userId: user._id,
      contactId: c._id,
      to: c.email,
      type: "followup",
      templateId: t._id,
      resumeId: b.resumeId ? new Types.ObjectId(b.resumeId) : undefined,
      scheduledAt: times[i],
      status: "pending",
    }))
  );
  return NextResponse.json({ queued: list.length, skipped: b.contactIds.length - list.length, firstAt: times[0] });
});
