import { NextResponse } from "next/server";
import { z } from "zod";
import { handler, HttpError, requireUser } from "@/lib/auth";
import { render } from "@/lib/mailer";
import { Contact, EmailJob, Resume, Template } from "@/lib/models";

type Ctx = { params: Promise<{ id: string }> };

// one email for the reading pane: its body rebuilt from the template and the contact
export const GET = handler(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const job = await EmailJob.findOne({ _id: id, userId: user._id }).lean();
  if (!job) throw new HttpError(404, "Not found");
  const [contact, template, resume] = await Promise.all([
    Contact.findById(job.contactId, "email name company").lean(),
    Template.findById(job.templateId, "name subject body").lean(),
    job.resumeId ? Resume.findById(job.resumeId, "filename").lean() : null,
  ]);
  const vars = { name: contact?.name, email: contact?.email ?? job.to, company: contact?.company };
  return NextResponse.json({
    templateName: template?.name ?? null,
    resumeFilename: resume?.filename ?? null,
    subject: job.subject || (template ? render(template.subject || "", vars) : ""),
    // ponytail: rebuilt from the template as it is now; store the sent body on the job if templates get edited often
    body: template ? render(template.body, vars) : "",
  });
});

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
