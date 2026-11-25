import { NextResponse } from "next/server";
import { z } from "zod";
import { handler, HttpError, requireUser } from "@/lib/auth";
import { Campaign, Contact, EmailJob } from "@/lib/models";
import { rescheduleCampaign } from "@/lib/scheduler";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handler(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const campaign = await Campaign.findOne({ _id: id, userId: user._id })
    .populate("templateId", "name subject")
    .populate("resumeId", "filename")
    .lean();
  if (!campaign) throw new HttpError(404, "Campaign not found");
  const jobs = await EmailJob.find({ campaignId: campaign._id }).sort({ scheduledAt: 1 }).limit(2000).lean();
  return NextResponse.json({ campaign, jobs });
});

const Action = z.object({ action: z.enum(["pause", "resume", "cancel"]) });

export const POST = handler(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const { action } = Action.parse(await req.json());
  const c = await Campaign.findOne({ _id: id, userId: user._id });
  if (!c) throw new HttpError(404, "Campaign not found");

  if (action === "pause") {
    c.status = "paused";
    await EmailJob.updateMany({ campaignId: c._id, status: "pending" }, { status: "paused" });
  } else if (action === "resume") {
    c.status = "running";
    await c.save();
    await rescheduleCampaign(c._id);
    return NextResponse.json({ ok: true });
  } else {
    c.status = "cancelled";
    const pending = await EmailJob.find({ campaignId: c._id, status: { $in: ["pending", "paused"] } }).distinct("contactId");
    await EmailJob.updateMany({ campaignId: c._id, status: { $in: ["pending", "paused"] } }, { status: "cancelled", error: "Campaign cancelled" });
    await Contact.updateMany({ _id: { $in: pending }, status: "queued" }, { status: "new" });
  }
  await c.save();
  return NextResponse.json({ ok: true });
});

export const DELETE = handler(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const c = await Campaign.findOne({ _id: id, userId: user._id });
  if (!c) throw new HttpError(404, "Campaign not found");
  if (c.status === "running" || c.status === "paused") throw new HttpError(409, "Cancel the campaign before deleting it");
  // Sent history is kept (it powers "already sent" detection); only the campaign record goes.
  await Campaign.deleteOne({ _id: c._id });
  return NextResponse.json({ ok: true });
});
