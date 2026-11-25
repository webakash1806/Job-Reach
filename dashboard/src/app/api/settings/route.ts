import { NextResponse } from "next/server";
import { z } from "zod";
import { handler, requireUser } from "@/lib/auth";
import { encrypt, newApiKey } from "@/lib/crypto";

export const GET = handler(async () => {
  const u = await requireUser();
  if (!u.apiKey) {
    u.apiKey = newApiKey();
    await u.save();
  }
  return NextResponse.json({
    email: u.email,
    name: u.name,
    apiKey: u.apiKey ?? null,
    smtp: {
      host: u.smtp?.host ?? "",
      port: u.smtp?.port ?? 465,
      secure: u.smtp?.secure ?? true,
      user: u.smtp?.user ?? "",
      fromName: u.smtp?.fromName ?? "",
      fromEmail: u.smtp?.fromEmail ?? "",
      hasPassword: !!u.smtp?.passEnc,
    },
    imap: {
      enabled: u.imap?.enabled ?? false,
      host: u.imap?.host ?? "",
      port: u.imap?.port ?? 993,
      secure: u.imap?.secure ?? true,
      user: u.imap?.user ?? "",
      hasPassword: !!u.imap?.passEnc,
      lastCheck: u.lastImapCheck ?? null,
      lastError: u.lastImapError ?? null,
    },
  });
});

const Smtp = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().min(1).max(65535),
  secure: z.boolean(),
  user: z.string().min(1),
  password: z.string().optional(),
  fromName: z.string().optional().default(""),
  fromEmail: z.string().email().or(z.literal("")).optional().default(""),
});
const Imap = z.object({
  enabled: z.boolean(),
  host: z.string().optional().default(""),
  port: z.coerce.number().int().min(1).max(65535).default(993),
  secure: z.boolean().default(true),
  user: z.string().optional().default(""),
  password: z.string().optional(),
});
const Body = z.object({
  name: z.string().optional(),
  smtp: Smtp.optional(),
  imap: Imap.optional(),
  regenerateApiKey: z.boolean().optional(),
});

export const PUT = handler(async (req: Request) => {
  const u = await requireUser();
  const b = Body.parse(await req.json());
  if (b.name !== undefined) u.name = b.name;
  if (b.smtp) {
    const { password, ...rest } = b.smtp;
    u.smtp = { ...rest, passEnc: password ? encrypt(password) : u.smtp?.passEnc };
  }
  if (b.imap) {
    const { password, ...rest } = b.imap;
    const changedAccount = rest.host !== u.imap?.host || rest.user !== u.imap?.user;
    u.imap = { ...rest, passEnc: password ? encrypt(password) : u.imap?.passEnc };
    if (changedAccount) u.lastImapUid = 0;
  }
  if (b.regenerateApiKey || !u.apiKey) u.apiKey = newApiKey();
  await u.save();
  return NextResponse.json({ ok: true, apiKey: u.apiKey });
});
