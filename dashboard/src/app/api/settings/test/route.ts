import { NextResponse } from "next/server";
import { z } from "zod";
import { handler, HttpError, requireUser } from "@/lib/auth";
import { imapClient } from "@/lib/imap";
import { fromAddress, toHtml, transportFor } from "@/lib/mailer";

const Body = z.object({ kind: z.enum(["smtp", "imap"]), to: z.string().email().optional() });

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const { kind, to } = Body.parse(await req.json());
  try {
    if (kind === "smtp") {
      const t = transportFor(user);
      await t.verify();
      const text = "Your SMTP settings work. Bulk sending from the dashboard is ready.";
      await t.sendMail({ from: fromAddress(user), to: to || user.smtp?.user || user.email, subject: "SMTP test", text, html: toHtml(text) });
      return NextResponse.json({ ok: true, message: `Test email sent to ${to || user.smtp?.user || user.email}` });
    }
    const c = imapClient(user);
    await c.connect();
    const status = (await c.status("INBOX", { messages: true, unseen: true })) as { messages?: number; unseen?: number };
    await c.logout();
    return NextResponse.json({ ok: true, message: `Connected. INBOX has ${status.messages} messages (${status.unseen} unread).` });
  } catch (e) {
    throw new HttpError(400, (e as Error).message);
  }
});
