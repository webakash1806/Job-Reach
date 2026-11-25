import { NextResponse } from "next/server";
import { z } from "zod";
import { handler, HttpError, requireUser } from "@/lib/auth";
import { EmailJob } from "@/lib/models";

type Ctx = { params: Promise<{ id: string }> };

// retry a failed job now, or cancel a queued one
export const POST = handler(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const { action } = z.object({ action: z.enum(["retry", "cancel"]) }).parse(await req.json());
  const job = await EmailJob.findOne({ _id: id, userId: user._id });
  if (!job) throw new HttpError(404, "Not found");
  if (action === "retry") {
    if (job.status !== "failed") throw new HttpError(400, "Only failed emails can be retried");
    job.status = "pending";
    job.attempts = 0;
    job.scheduledAt = new Date();
    job.error = undefined;
  } else {
    if (!["pending", "paused"].includes(job.status)) throw new HttpError(400, "Only queued emails can be cancelled");
    job.status = "cancelled";
  }
  await job.save();
  return NextResponse.json({ ok: true });
});
