import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { handler, requireAdmin } from "@/lib/auth";
import { Contact, EmailJob, Session, User } from "@/lib/models";

export const GET = handler(async () => {
  await requireAdmin();
  const users = await User.find().select("email name role active createdAt lastSentAt").sort({ createdAt: 1 }).lean();
  const now = new Date();
  const [contacts, sent, sessions] = await Promise.all([
    Contact.aggregate([{ $group: { _id: "$userId", n: { $sum: 1 } } }]),
    EmailJob.aggregate([{ $match: { status: "sent" } }, { $group: { _id: "$userId", n: { $sum: 1 } } }]),
    Session.aggregate([
      { $match: { revokedAt: null, expiresAt: { $gt: now }, absoluteExpiresAt: { $gt: now } } },
      { $group: { _id: "$userId", n: { $sum: 1 } } },
    ]),
  ]);
  const pick = (arr: { _id: unknown; n: number }[], id: unknown) => arr.find((x) => String(x._id) === String(id))?.n ?? 0;
  return NextResponse.json({
    users: users.map((u) => ({ ...u, contacts: pick(contacts, u._id), sent: pick(sent, u._id), sessions: pick(sessions, u._id) })),
  });
});

const Body = z.object({
  email: z.string().email(),
  name: z.string().optional().default(""),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const POST = handler(async (req: Request) => {
  await requireAdmin();
  const b = Body.parse(await req.json());
  const user = await User.create({
    email: b.email.toLowerCase(),
    name: b.name,
    role: "user",
    passwordHash: await bcrypt.hash(b.password, 10),
  });
  return NextResponse.json({ user: { _id: user._id, email: user.email } });
});
