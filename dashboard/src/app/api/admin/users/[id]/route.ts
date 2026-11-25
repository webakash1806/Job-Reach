import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, handler, HttpError, requireAdmin } from "@/lib/auth";
import { deleteFile } from "@/lib/gridfs";
import { Campaign, Contact, EmailJob, Resume, Session, Template, User } from "@/lib/models";
import { revokeUserSessions } from "@/lib/tokens";

type Ctx = { params: Promise<{ id: string }> };

const Body = z.object({
  active: z.boolean().optional(),
  name: z.string().optional(),
  password: z.string().min(8).optional(),
  endSessions: z.boolean().optional(),
});

export const PATCH = handler(async (req: Request, { params }: Ctx) => {
  const admin = await requireAdmin();
  const { id } = await params;
  const b = Body.parse(await req.json());
  const u = await User.findById(id);
  if (!u) throw new HttpError(404, "User not found");
  if (String(u._id) === String(admin._id) && b.active === false) throw new HttpError(400, "You cannot disable yourself");
  if (b.active !== undefined) u.active = b.active;
  if (b.name !== undefined) u.name = b.name;
  if (b.password) u.passwordHash = await bcrypt.hash(b.password, 10);
  await u.save();

  // A reset password, a disabled account or an explicit request signs that user out everywhere.
  // When admins act on their own account, the browser they are using stays signed in.
  let endedSessions = 0;
  if (b.password || b.active === false || b.endSessions) {
    const self = String(u._id) === String(admin._id);
    const keep = self ? (await getSession())?.sessionId : undefined;
    const reason = b.active === false ? "Account disabled" : b.password ? "Password reset by admin" : "Signed out by admin";
    endedSessions = await revokeUserSessions(u._id, reason, keep);
  }
  return NextResponse.json({ ok: true, endedSessions });
});

export const DELETE = handler(async (_req: Request, { params }: Ctx) => {
  const admin = await requireAdmin();
  const { id } = await params;
  if (id === String(admin._id)) throw new HttpError(400, "You cannot delete the admin account");
  const u = await User.findById(id);
  if (!u) throw new HttpError(404, "User not found");
  const resumes = await Resume.find({ userId: u._id }).lean();
  await Promise.all(resumes.map((r) => deleteFile(r.gridFsId)));
  await Promise.all([
    Resume.deleteMany({ userId: u._id }),
    Contact.deleteMany({ userId: u._id }),
    EmailJob.deleteMany({ userId: u._id }),
    Campaign.deleteMany({ userId: u._id }),
    Template.deleteMany({ userId: u._id }),
    Session.deleteMany({ userId: u._id }),
  ]);
  await u.deleteOne();
  return NextResponse.json({ ok: true });
});
