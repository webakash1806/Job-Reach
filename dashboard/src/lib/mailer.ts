import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { decrypt } from "./crypto";
import { Contact, EmailJob, Resume, Template, User, type UserDoc } from "./models";
import { readFile } from "./gridfs";

type SmtpUser = Pick<UserDoc, "smtp" | "email" | "name">;

export function transportFor(user: SmtpUser) {
  const s = user.smtp;
  if (!s?.host || !s.user || !s.passEnc) throw new Error("SMTP is not configured. Open Settings and add your SMTP details.");
  return nodemailer.createTransport({
    host: s.host,
    port: s.port || 465,
    secure: s.secure ?? (s.port || 465) === 465,
    auth: { user: s.user, pass: decrypt(s.passEnc) },
  });
}

export function fromAddress(user: SmtpUser) {
  const email = user.smtp?.fromEmail || user.smtp?.user || user.email;
  const name = user.smtp?.fromName || user.name;
  return name ? { name, address: email } : email;
}

type Vars = { name?: string | null; email?: string | null; company?: string | null };

/** Replaces {{name}}, {{email}}, {{company}}, {{first_name}}. Missing values fall back sensibly. */
export function render(text: string, v: Vars) {
  const first = (v.name || "").trim().split(/\s+/)[0];
  const map: Record<string, string> = {
    name: v.name || "Hiring Team",
    first_name: first || "there",
    email: v.email || "",
    company: v.company || "your company",
  };
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k: string) => map[k.toLowerCase()] ?? m);
}

export function toHtml(body: string) {
  const esc = body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const linked = esc.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#1f2328">${linked
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 12px">${p.replace(/\n/g, "<br>")}</p>`)
    .join("")}</div>`;
}

function newMessageId(from: string) {
  const domain = from.split("@")[1] || "mail.local";
  return `<${crypto.randomUUID()}@${domain}>`;
}

/**
 * Sends a single queued EmailJob. Initial mails start a new thread; follow-ups reply in the
 * same thread (Re: subject + In-Reply-To/References) so Gmail groups them together.
 */
export async function sendJob(jobId: string) {
  const job = await EmailJob.findById(jobId);
  if (!job) throw new Error("Job not found");
  const [user, contact, template] = await Promise.all([
    User.findById(job.userId),
    Contact.findById(job.contactId),
    Template.findById(job.templateId),
  ]);
  if (!user || !contact || !template) throw new Error("Missing user, contact or template");

  const vars = { name: contact.name, email: contact.email, company: contact.company };
  const text = render(template.body, vars);
  const from = fromAddress(user);
  const fromEmail = typeof from === "string" ? from : from.address;
  const messageId = newMessageId(fromEmail);

  let subject = render(template.subject || "", vars);
  const headers: Record<string, string> = {};
  let inReplyTo: string | undefined;
  let references: string[] | undefined;

  if (job.type === "followup") {
    const thread = await EmailJob.find({ contactId: contact._id, status: "sent", messageId: { $ne: null } })
      .sort({ sentAt: 1 })
      .lean();
    if (thread.length) {
      const root = thread[0];
      subject = "Re: " + String(root.subject || subject).replace(/^(re:\s*)+/i, "");
      references = thread.map((t) => t.messageId!).filter(Boolean);
      inReplyTo = references[references.length - 1];
    }
  }
  if (!subject) subject = "Application";

  const attachments: { filename: string; content: Buffer; contentType?: string }[] = [];
  if (job.resumeId) {
    const resume = await Resume.findById(job.resumeId);
    if (resume) {
      attachments.push({
        filename: resume.filename,
        content: await readFile(resume.gridFsId),
        contentType: resume.contentType || undefined,
      });
    }
  }

  const info = await transportFor(user).sendMail({
    from,
    to: contact.email,
    subject,
    text,
    html: toHtml(text),
    messageId,
    inReplyTo,
    references,
    headers,
    attachments,
  });

  const now = new Date();
  job.status = "sent";
  job.sentAt = now;
  job.subject = subject;
  job.messageId = info.messageId || messageId;
  job.error = undefined;
  await job.save();

  contact.lastSentAt = now;
  if (contact.status !== "replied" && contact.status !== "bounced") contact.status = "sent";
  if (job.type === "followup") contact.followUpCount = (contact.followUpCount || 0) + 1;
  await contact.save();
  await User.updateOne({ _id: user._id }, { lastSentAt: now });
  return job;
}
