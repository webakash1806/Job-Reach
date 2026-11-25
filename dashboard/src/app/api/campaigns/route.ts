import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { handler, HttpError, requireUser } from "@/lib/auth";
import { Campaign, Contact, EmailJob, Resume, Template } from "@/lib/models";
import { CampaignBody } from "@/lib/schemas";
import { alreadyContacted, computeTimes } from "@/lib/scheduler";

export const GET = handler(async () => {
  const user = await requireUser();
  const campaigns = await Campaign.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
  const counts = await EmailJob.aggregate([
    { $match: { userId: user._id, campaignId: { $in: campaigns.map((c) => c._id) } } },
    { $group: { _id: { c: "$campaignId", s: "$status" }, n: { $sum: 1 } } },
  ]);
  const next = await EmailJob.aggregate([
    { $match: { userId: user._id, status: "pending", campaignId: { $in: campaigns.map((c) => c._id) } } },
    { $group: { _id: "$campaignId", at: { $min: "$scheduledAt" } } },
  ]);
  const rows = campaigns.map((c) => {
    const by: Record<string, number> = {};
    for (const x of counts) if (String(x._id.c) === String(c._id)) by[x._id.s] = x.n;
    return { ...c, counts: by, nextAt: next.find((n) => String(n._id) === String(c._id))?.at ?? null };
  });
  return NextResponse.json({ campaigns: rows });
});

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const body = CampaignBody.parse(await req.json());

  const template = await Template.findOne({ _id: body.templateId, userId: user._id });
  if (!template) throw new HttpError(400, "Pick a message template");
  if (body.resumeId && !(await Resume.exists({ _id: body.resumeId, userId: user._id })))
    throw new HttpError(400, "CV not found");
  if (body.followUp.enabled && !body.followUp.templateId) throw new HttpError(400, "Pick a follow-up template");
  if (!user.smtp?.host) throw new HttpError(400, "Set up SMTP in Settings first");

  const filter: Record<string, unknown> = { userId: user._id };
  if (body.allNew) filter.status = "new";
  else if (body.contactIds?.length) filter._id = { $in: body.contactIds };
  else throw new HttpError(400, "Select at least one contact");

  const contacts = await Contact.find(filter).sort({ createdAt: 1 }).select("_id email").lean();
  const skip = await alreadyContacted(user._id, contacts.map((c) => c._id));
  const toSend = contacts.filter((c) => !skip.has(String(c._id)));
  if (!toSend.length) throw new HttpError(400, `All ${contacts.length} selected contacts were already emailed`);

  const times = computeTimes(toSend.length, body.startAt, body);
  const campaign = await Campaign.create({
    ...body,
    userId: user._id,
    resumeId: body.resumeId || undefined,
    followUp: { ...body.followUp, templateId: body.followUp.templateId || undefined },
    total: toSend.length,
    status: "running",
  });
  await EmailJob.insertMany(
    toSend.map((c, i) => ({
      userId: user._id,
      campaignId: campaign._id,
      contactId: c._id,
      to: c.email,
      type: "initial",
      templateId: template._id,
      resumeId: body.resumeId ? new Types.ObjectId(body.resumeId) : undefined,
      scheduledAt: times[i],
      status: "pending",
    }))
  );
  await Contact.updateMany({ _id: { $in: toSend.map((c) => c._id) }, status: "new" }, { status: "queued" });

  return NextResponse.json({
    campaign,
    queued: toSend.length,
    skipped: contacts.length - toSend.length,
    firstAt: times[0],
    lastAt: times[times.length - 1],
  });
});
