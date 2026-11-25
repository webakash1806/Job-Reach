import { NextResponse } from "next/server";
import { handler, HttpError, requireUser } from "@/lib/auth";
import { EmailJob, Template } from "@/lib/models";
import { TemplateBody } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = handler(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const data = TemplateBody.parse(await req.json());
  const t = await Template.findOneAndUpdate({ _id: id, userId: user._id }, data, { new: true });
  if (!t) throw new HttpError(404, "Not found");
  return NextResponse.json({ template: t });
});

export const DELETE = handler(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const inUse = await EmailJob.countDocuments({ userId: user._id, templateId: id, status: { $in: ["pending", "paused"] } });
  if (inUse) throw new HttpError(409, `This template is used by ${inUse} queued emails`);
  await Template.deleteOne({ _id: id, userId: user._id });
  return NextResponse.json({ ok: true });
});
